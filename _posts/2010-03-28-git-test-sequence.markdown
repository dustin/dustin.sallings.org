---
layout: post
title: git test-sequence -- Push Working Changes
---

# git test-sequence: Push Working Changes

<div>
  <img src="/images/mr-clean-small.png"
       alt="Herr Clean"
       class="floatright"/>
</div>

I interactively rebase my changes before I push them for two primary
reasons:

1. The changes I push must concisely represent the changes I intended
to make.
2. Each change should be tested (i.e. don't break the build)

It's easy enough to rewrite stuff interactively and squash and
what-not to end up with a readable history, but when you actually want
to try things out, it can be a pain.

Assume the upstream tree is in a working state.  You want to push two
changes.  The first one adds a feature and the second one uses it.
The second one also accidentally fixes a bug in the first one.  That
appears OK because the tree builds before and after your push.

If I didn't break the build, what's the problem?  You broke *a*
build.  Next time someone runs `git bisect` he might hit it.  It will
make him sad.  Let us not make people sad.  If we can verify every
change works, we will forever live harmonious lives.

I wrote a tool for git called [test-sequence][testseq] a long time ago
to support this very thing.  When it is easy to verify a tree is
clean, we will at least try.

I'm writing about it today because it's come up twice in conversation
this week.  Once with a co-worker who was trying to prep a rather
large branch for review, and again in a [stack overflow question][soq]
where someone was eerily asking for exactly what I had written.

The concept is similar to an automated `git bisect` except it's
linear.  It will test *every* change between two points in the DAG.
It'll even walk each side of a merge and test *those* changes
individually.

The [stack overflow question][soq] goes into a lot of details of the
why, so I'll just talk about the how:

## Using git test-sequence

First, put the [git-test-sequence][testseq] script somewhere in your
path.

Now, think about the stuff you want to test, how you want to test it,
etc...

The example I give in the script itself looks like this:

    git test-sequence origin/master.. 'make clean && make test'

Since I'm using normal range operators, that should be pretty readable
to any git user.  In this case, run `make clean && make test` for
every local commit that I've made since I last pushed to
`origin/master`.

You can go the other way, too:

    git test-sequence ..origin/master 'make clean && make test'

...will there be any incoming changes that will break my build?

When combined with [buildbot][buildbot], you get ludicrous power.
I've got a buildbot install with 21 builders currently.  I've got 26
commits on a branch I'm moving forward.  The following command will
test all 26 changes against each of the 21 builders (i.e. 546 builds
will be started):

    git test-sequence origin/master.. 'buildbot try'

And no, the code didn't work on all of the builders.  Most of them in
fact.  My screen was covered in growl alerts from
[buildwatch][buildwatch] letting me know that we broke something.

Before this is published, every build will work on every platform, and
it will be trivial to verify.

[testseq]: http://github.com/dustin/bindir/blob/master/git-test-sequence
[soq]: http://stackoverflow.com/questions/2530015/any-tool-to-make-git-build-every-commit-to-a-branch-in-a-seperate-repository
[buildbot]: http://buildbot.net/
[buildwatch]: http://code.google.com/p/buildwatch/
