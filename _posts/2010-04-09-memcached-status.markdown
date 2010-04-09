---
layout: post
title: What We're Doing in Memcached
---

<div>
   <img src="/images/being-transparent.png" alt="transparency"
       title="So what if I like Banksy?" class="floatright"/>
</div>

We've been steadily hacking on [memcached][memcached].

We think it's going very well, but we do want to make sure everybody
who cares has the opportunity to see what's going on behind the
proverbial curtain.

The basic theme is to build a platform that allows a company to solve
its scaling problems without preventing you from solving your own.

## Extensibility

The biggest thing we've been working on is getting the storage engine
interface really solid.  [Trond][trond] has been thinking about this
for [two years][firstse] and did an excellent
[presentation][sepresentation] on an application of it at last year's
MySQL User Conference.

Since then, we've applied it and adapted it to handle a few real-world
scenarios and have been pretty happy with the results.

We're looking forward to fewer forks of memcached to solve one-off
problems and instead making it easier to bake a solution to your
problem directly into the standard code base.

Our hope is that this will lead to a variety of open source solutions
to common problems.  For example, [NorthScale][ns] released the
[bucket engine][busket] that allows a single memcached instance to
support multiple logical engines.

## Portability

[Patrick][patrick] has done a ridiculous amount of work to get us to
the point where we can officially support Windows in a maintainable
way (i.e. does as little damage to the rest of the codebase as
possible).

This is another area where forks have existed to solve one-off
problems, but have been unable to track bug fixes and new features.

## Documentation

[dormando][dormando] has essentially been doing an informed rewrite of
the documentation to make it more approachable, more comprehensive,
and just generally more better.

The [new site][memcached] was the first part of this, and has been
pretty awesome, but the [wiki][wiki] reorg is almost done and I'm
pretty excited about that.

## Releases

The 1.4.5 release just shipped.  We have plans for a 1.4.6 maintenance
release to clear up a bit more of the problems people have seen in the
field (mostly targetting people who run operating systems that won't
update their libraries more than once a decade).

## Come Join Us

If you're somewhere around Santa Clara, come join us at the [MySQL
User Conference][conf].  We've got a lot of stuff we'll be finishing
up and are able to answer any questions you might have about storing
data, perhaps even some about retrieving it.

We're having a [bof][bof] that you are personally invited to and I
believe I may be joining [Matt][matt] for a talk about some of the
work we've been doing.

[memcached]: http://memcached.org/
[trond]: http://trondn.blogspot.com/
[firstse]: http://blogs.sun.com/trond/entry/memcached_and_customized_storage_engines
[sepresentation]: http://blogs.sun.com/trond/entry/presentation_at_the_mysql_users
[sebranch]: http://github.com/trondn/memcached/tree/engine
[patrick]: http://patg.net/
[dormando]: http://consoleninja.net/
[conf]: http://en.oreilly.com/mysql2010/
[ns]: http://www.northscale.com/
[busket]: http://github.com/northscale/bucket_engine
[bof]: http://en.oreilly.com/mysql2010/public/schedule/detail/14627
[matt]: http://blog.northscale.com/northscale-blog/author/matt-ingenthron
