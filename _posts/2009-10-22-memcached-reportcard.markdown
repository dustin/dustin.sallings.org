---
layout: post
title: Memcached Report Card
---

# Memcached - Report Card for an Open Source Project

While approaching our [1.4][rel140] release, the memcached project slipped into
a state where we weren't pushing out new code very frequently.

Some members of the community demanded releases occur more frequently,
so [dormando][dormando] published a proposal for a release cycle for
memcached that would help drive us into the direction of universal
happiness.

I had a feeling that his plan and efforts to keep us on it were quite
effective, but the purpose of this post is to sort of take an
objective retrospective look and see how the reality of the progress
of the project holds up to my perception.

## Release Scheduling

![Release Velocity](/images/memcached-velocity.png)

This chart pretty much speaks for itself.  It's clear to see that
we very quickly approached the stated goal of 30 days between
releases.

I should note that [1.4.1][rel141] was released later than expected
because a user hit a real live failure scenario in a production system
that took a while to isolate.  Once we did, we wrote some tests to
ensure that the entire class of bug described can't happen again.

These releases are bigger than they appear, but very well tested on
our [build farm][buildfarm] and in production environments.  To see
what goes into each release, check the release notes for
[1.4.0][rel140], [1.4.1][rel141], and [1.4.2][rel142].

## Bug Status

We've been taking bugs very seriously.

Crash bugs are resolved *very* quickly, but bugs in general are
resolved within our release cycle.

Please let us know via [our mailing list][list] or our [bug
tracker][bugs] if you're having issues or can't figure something
out. We fix things very quickly, but **we can't fix what we don't hear
about**. Remember that goes for the [wiki docs][wiki], too.

The following chart shows the average age (time between when they were
filed and when they were closed) of bugs by month in memcached.  The
error bars are showing the minimum and maximum age for any given
month.  Issues marked as invalid, won'tfix, and had other indicators
of not being actual defects or missing features in the software were
excluded.

Four anomalies were identified and described briefly in the chart.
These are all considered trivial issues that were not detrimental to
the state of the server, but they do show that we're sometimes not too
quick in cases like these.  (more details on [A][buga], [B][bugb],
[C][bugc], and [D][bugd]).

![Bug Age](/images/memcached-issue-age.png)

I also found it useful to consider what I called the "bug load."  That
is, the number of bugs going in and out of the project by month.

The following chart is showing bugs activity in the memcached
project.

Positive numbers are bugs being reported to the project.  Negative
numbers are bugs that we closed (bugs removed from the project).  The
line indicates the net number of bugs at the end of the given month.

![Bug Load](/images/memcached-bug-load.png)

## So What's the Grade?

I'd say we've got a solid B.  We have room for improvement and I'm
confident we're making it.

If you disagree (and can articulate why specifically) or otherwise
have feedback, a warm, active community awaits.

Contact us on irc [(freenode.net #memcached)][irc], email suggestions
or questions to our [list][list], or just go [file a bug][bugs].

[dormando]: http://consoleninja.net/
[irc]: irc://irc.freenode.net/memcached
[list]: http://groups.google.com/group/memcached
[bugs]: http://code.google.com/p/memcached/issues/list
[wiki]: http://code.google.com/p/memcached/wiki/Start
[buga]: http://code.google.com/p/memcached/issues/detail?id=9
[bugb]: http://code.google.com/p/memcached/issues/detail?id=42
[bugc]: http://code.google.com/p/memcached/issues/detail?id=53
[bugd]: http://code.google.com/p/memcached/issues/detail?id=59
[rel140]: http://code.google.com/p/memcached/wiki/ReleaseNotes140
[rel141]: http://code.google.com/p/memcached/wiki/ReleaseNotes141
[rel142]: http://code.google.com/p/memcached/wiki/ReleaseNotes142
[buildfarm]: http://code.google.com/p/memcached/wiki/BuildFarm
