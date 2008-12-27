---
layout: post
title: Moody Bots
---

# Moody Bots

[Twitterspy](/twitterspy/) is a rather brute-force way to achieve xmpp
functionality for twitter.  It makes very heavy use of twitter search to
provide track-like functionality to end users.

I've noticed in watching the logs that I often will get more errors in
attempting searches than successes.  This was at least the feel I got from
looking at the logs.  I wanted a way to communicate this to look at this
information via xmpp.

Initially, it seemed like status would be a good way to do this.  Currently,
the status is used to show stats on how many users and queries the bot knows
about.  This is already a little weird, and I wouldn't want to try to shove too
much stuff into it.

Next, I thought about using the vcard for it.  The bio is a fine way to
describe such things.  That wasn't quite right, either.  The bio is a better
general description of the bot, and not so much status.

Then I discovered [XEP-0107](http://xmpp.org/extensions/xep-0107.html) -- user
moods.  User moods in a [PEP](http://xmpp.org/extensions/xep-0163.html)
transport provides exactly the kind of thing I'm looking for.

<div><img src="http://img.skitch.com/20081225-g8nbh7s3np2amubspgkas2ab1f.png"
class="floatright" alt="twitterspy angry"/></div>

Twitterspy keeps track of how many of its searches are successful, and how many
fail.  When many searches are successful, it's in a good mood, when few are,
it's in a bad mood.

<div><img src="http://ralphm.net/images/mood/knology/excited.gif"
class="floatleft" alt="excited!"/></div>

I had my kid look through the XEP to come up with some rules for how to select
a mood based on how successful recent searches are.  I've applied many of her
changes, but some still require me to keep a bit more state than I do
currently.  It's kind of an exciting thing, though few people will ever
actually see it.

The pubsub mechanism will hopefully show itself to be useful, though.  I'm
hoping to do something cool like have a web status showing moods and all.
[Ralph Meijer's](http://ralphm.net/) [moods page](http://ralphm.net/moods) is
quite inspirational here -- as long as I'm capturing the data.

For the rest of you out there:  Bring your XMPP services to life.  Show their
moods.
