---
title: How to Test Everything
layout: post
---

# How to Test Everything

I recently had a [membase][membase] user point out a sequence of
operations that led to an undesirable state.  I've got a lot of really
good engine tests I've written, but not *this* case:

    add with timeout -> wait for timeout -> add with timeout

The bug is pretty straightforward -- expiry is lazy and it turns out
I'm not checking for expiry in this case.  It was pretty easy to write
this test, but immediately made me think about what *other* cases
weren't being run.

Now, I know there are countless tools out there to aid in testing.
I've written another one.  I probably spent an hour or so writing a
framework to write and run all of the tests I needed.  The difference
between what I'm describing here and, for example, [quick
check][quickcheck] is that I want something very simple to express
actions that expect their environment to be in a particular state and
will leave the environment in another state.  Then I want to hit every
possible arrangement of these actions to ensure they don't interfer
with each other in unexpected ways.

<div>
  <img src="/images/permutations.png" alt="Permutations" class="floatright"/>
</div>

This blows up very quickly -- specifically the number of tests
generated for a test sequence of `n` actions from `a` possible actions
is approximately <code>a<sup>n</sup></code>.

Consider three defined actions permuted into sequences of two.  That
blows out to nine possibilites as shown in the diagram on the right.

The actions in the diagram are defined with memcached semantics on a
single key, so `add` has a prerequisite that the item *must not* exist
and `del` has a prerequisite that the item *must* exist.

The generated test expects success at each white box, failure at each
red box, and tracks the expected state mutations to build assertions.

<div>
  <img src="/images/breakdancer-exponentiality.png"
       alt="BreakDancer Growth" class="floatleft"/>
</div>

My first test... um, test ran with `11` actions in sequences of `4`
actions.  I have more actions to go, but `4` is a pretty good length,
so the chart at the left is going to demonstrate my growth rate.

The awesome part is that it pointed out the original bug quite easily
and another couple of bugs with limited effort.

## How Do I Use This?

<div>
  <img src="/images/action-life.png" alt="action lifecycle" class="floatright"/>
</div>

The API is so far pretty simple and composable.  There are basically
five classes (three are shown in the image on the right).

### Condition

A `Condition` is a simple callable that is used for preconditions and
postconditions.  A given class doesn't care which one it's used for,
and in many cases will be used for both.

For example, consider my implementation of `DoesNotExist`:

{% highlight python %}
class DoesNotExist(Condition):
    def __call__(self, state):
        return TESTKEY not in state
{% endhighlight %}

<br/>

### Effect

An `Effect` changes our view of the state (and depending on the
driver, may actually cause something in the world to change with it).
For example, the `StoreEffect` works as follows:

{% highlight python %}
class StoreEffect(Effect):
    def __call__(self, state):
        state[TESTKEY] = '0'
{% endhighlight %}

<br/>

### Action

An `Action` brings an `Effect` and one or more `Condition` classes as
pre and post conditions.  For example, we'll look at two actions, an
`Add` action and a `Set` action:

{% highlight python %}
class Set(Action):
    effect = StoreEffect()
    postconditions = [Exists()]

class Add(Action):
    preconditions = [DoesNotExist()]
    effect = StoreEffect()
    postconditions = [Exists()]
{% endhighlight %}

The interesting part of this is that Set and Add have different
semantics, but are expressed as different compositions of the same
conditions and effects.

### Driver

Driver is kind of a larger part (seven defined methods!).  It does
enough that I can do anything from generate a C test suite for
memcached engines all the way to actually executing tests across a
remote protocol.

I won't describe the entire thing here since it's documented in the
[source][breakdaner] (currently just a few files in a gist -- need to
upgrade this to a proper project real soon).  I will however, close
the loop by showing you some example code that it generated that
demonstrated the error we failed to find in the first place:

{% highlight c %}
static enum test_result test_add_add_delay_add(ENGINE_HANDLE *h,
                                               ENGINE_HANDLE_V1 *h1) {
    add(h, h1);
    assertHasNoError(); // value is "0"
    add(h, h1);
    assertHasError(); // value is "0"
    delay(expiry+1);
    assertHasNoError(); // value is not defined
    add(h, h1);
    assertHasNoError(); // value is "0"
    checkValue(h, h1, "0");
    return SUCCESS;
}
{% endhighlight %}

That demonstrates how much information you know at each step of the
way.  From there, we can do all kinds of stuff with our stubs (delay
above is implemented with the memcached testapp "time travel" feature,
for example).

From here, it's less exciting.  We provide constraints, it writes
tests, and makes sure that there's another area that it's impossible
for users to encounter something we haven't seen before.

[membase]: http://www.membase.org/
[quickcheck]: http://www.haskell.org/haskellwiki/Introduction_to_QuickCheck
[breakdancer]: http://github.com/dustin/BreakDancer
