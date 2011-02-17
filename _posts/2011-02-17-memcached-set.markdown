---
layout: post
title: Maintaining a Set in Memcached
---

# Maintaining a Set in Memcached

<div>
  <img src="/images/simple.png" alt="simple"
      title="I found this in some old military archives."
      class="floatright"/>
</div>

This is something that comes up every once in a while.  I usually
describe a means of doing it that I think makes sense, but I don't
think I've ever described it *quite* well enough.  People tend to
think it's complicated or slow or things like that.  I'm going to try
to try to solve that problem here.

## Constraints

In order to be useful for enough applications, we're going to work
under the following assumptions:

* must minimize round trips to the servers
* O(1) add (for both current size and new items coming in)
* O(1) remove (for both current size and items being removed)
* O(1) fetch
* lock and wait free
* easy to use
* easy to understand
* no required explicit maintenance

And, of course, it has to be web scale!

## Ingredients

The concept is simple and makes use of three memcached operations with
atomicity guarantees.

An index is created with `add`.  This should be pretty obvious.

Whenever we need to add or remove items, we use `append`.  For this to
work, we need to encode the items in such a way as to have them
represent either positive or negative items.  I created a simple
sample encoding of `+key` to represent the addition of `key` to the
set and `-key` to represent the removal of `key` from the set.  I then
use spaces to separate multiple items.  Example: `+a +b +c -b`
represents `{a, c}`.  The sequence is, of course important.

A set that has members coming and going frequently enough may need to
be compacted.  For that, we rencode the set and use `cas` to ensure we
can add it back without stepping on another client.

## Walk Me Through It

I'm using python for this example.  Ideally this gets implemented in
your client and everything's good to go.

First, we need encoders and decoders.  This is actually the hard
part and it's really trivial when it comes down to it.

### The Encoder

We start with the most basic representation of data within our sets.

{% highlight python %}
def encodeSet(keys, op='+'):
    """Encode a set of keys to modify the set.

    >>> encodeSet(['a', 'b', 'c'])
    '+a +b +c '
    """
    return ''.join(op + k + ' ' for k in keys)
{% endhighlight %}

This is more documentation than code, but it's pretty clear.  If you
want a set of JPEGs instead, you could create a simple binary encoding
with a length and a body instead of having it be whitespace separated.

### Modifying a Set

Modification is append-only with the only difference between adding
and removing being an encoding op.  This is useful because we can
write the same code for both cases.

{% highlight python %}
def modify(mc, indexName, op, keys):
    encoded = encodeSet(keys, op)
    try:
        mc.append(indexName, encoded)
    except KeyError:
        # If we can't append, and we're adding to the set,
        # we are trying to create the index, so do that.
        if op == '+':
            mc.add(indexName, encoded)

def add(mc, indexName, *keys):
    """Add the given keys to the given set."""
    modify(mc, indexName, '+', keys)

def remove(mc, indexName, *keys):
    """Remove the given keys from the given set."""
    modify(mc, indexName, '-', keys)
{% endhighlight %}

I allow a side-effect of `add` to create the index if it doesn't exist.

In an actual application, there's a non-zero chance that the `append`
would fail because the item is missing and the immediately subsequent
`add` would fail due to a race condition.  I didn't write the code to
cover that here, but it's pretty simple.  If it matters to you, just
loop the entire modify method as long as both fail.  You'd have to be
trying to get it to fail more than once.

### The Decoder

In order to use the data, we're going to need to decode it, so let's
put together a quick decoder that can reverse what the above encoder
does (including the appends for add and remove).

{% highlight python %}
def decodeSet(data):
    """Decode an item from the cache into a set impl.

    Returns a dirtiness indicator (compaction hint) and the set

    >>> decodeSet('+a +b +c -b -x')
    (2, set(['a', 'c']))
    """

    keys = set()
    dirtiness = 0
    for k in data.split():
        op, key = k[0], k[1:]
        if op == '+':
            keys.add(key)
        elif op == '-':
            keys.discard(key)
            dirtiness += 1

    return dirtiness, keys
{% endhighlight %}

This is the most complicated part.

### Retrieving the Items

Now that we can encode, set, and modify our data, retrieval should be
quite trivial.  A basic pass would look like this:

{% highlight python %}
def items(mc, indexName):
    """Retrieve the current values from the set."""

    flags, cas, data = mc.get(indexName)
    dirtiness, keys = decodeSet(data)
    return keys
{% endhighlight %}

That's pretty much it.  However, this is a pretty good time to do
compaction.  `dirtiness` above measures how many removal tokens are in
the set.  If there are too many, we want to kill them.

Imagine a `DIRTINESS_THRESHOLD` number set that decides where we want
to do autocompaction.  If we have more dirtiness than this, we
compact upon retrieval (making a single get into a single get and a
single `CAS`.

For this use case, we don't actually care whether the `CAS` succeeds
most of the time, so we just fire and forget.  It's safe (i.e. won't
destroy any data), but not guaranteed to work.

So here's a modified `items` function conditionally compacting:

{% highlight python %}
def items(mc, indexName, forceCompaction=False):
    """Retrieve the current values from the set.

    This may trigger a compaction if you ask it to or the encoding is
    too dirty."""

    flags, casid, data = mc.get(indexName)
    dirtiness, keys = decodeSet(data)

    if forceCompaction or dirtiness > DIRTINESS_THRESHOLD:
        compacted = encodeSet(keys)
        mc.cas(indexName, casid, compacted)
    return keys
{% endhighlight %}

And we're done.

## In Summary

**Worst case add to set**:  2 round trips (when the set doesn't exist and
needs to be created, but we don't have to know that).

**Normal add to set**: 1 round trip regardless of the number of
members being added.  (You don't even need to retrieve the current
value to correctly add or remove items in bulk, much less transfer it
all back).

**Worst case retrieval**:  2 round trips (when compaction is a
side-effect).

**Normal retrieval**:  1 round trip (just fetch the one key).

### Caveats

While the number of sets is roughly unlimited, there's a practical
size of a single set with this implementation.  It'd be trivial to
"shard" the set across multiple keys (thus across multiple servers)
if one needed very large sets (more than, say 4,000 250 byte items).

Since compaction is done on read in this implementation, a case where
you're modifying very heavily but reading rarely might not be a
perfect for this code.  In that case, I'd start compacting on random
writes (making worst case add/remove take about three hops where it
would've otherwise been one).
