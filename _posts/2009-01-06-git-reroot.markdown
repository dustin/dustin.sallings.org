---
title: Git Reroot - When Rebase is Too Gentle
layout: post
---

# Git Reroot - When Rebase is Too Gentle

<div>
  <img src="/images/transplant.jpg" alt="transplant" class="floatright"/>
</div>
The fun thing about git is that it'll do whatever you tell it.

Many newcomers look at is as this really complicated beast that is
impossible to understand, but the less resistant users find that it's
very happy to just sit back and happily do whatever you ask of it
(even if you ask it to do something stupid).

Recently, I was working on a project, and wanted to rebase a branch
that had drifted quite a bit away from the master branch.  `rebase`
itself wasn't getting me anywhere due to various conflicts from some
partial merges and manual merges.

As an attempt towards a solution, I created [git reroot][reroot].

## What Does it Do?

`git reroot` is very similar to `rebase` conceptually, with one subtle
detail -- `rebase` works by rewinding to a merge point and replaying
deltas (while dropping duplicates).  `reroot` works by taking a range
of commits and placing the commits at the end of the current `HEAD` by
exact tree state.

The distinction is subtle, but important.  git does not record
changes, it snapshots tree states with some additional metadata.
Commit deltas may be computed between any arbitrary trees, so the
representations you often see are these deltas.

## When Should I Use It?

Quite likely never.  It was not appropriate for the project for which
I created it.

However, if

1. you find yourself with a branch that has diverged too far,
2. you consider the result of this branch to be the desired state, and
3. it's OK to think of the commits as snapshots of work instead of
   changes to previous state,

then you may find `reroot` helpful.

## How Do I Use It?

The invocation recipes are different from that of `rebase` because
it's more of a "do what I want" kind of tool.

In a really simple case, let's say you have a branch `new-development`
that diverged from `master` a while back.  Some work has been done on
master, but you really just want `new-development` to be master.  For
whatever reason, you don't want to do a merge to get it there, and
rebase fails you due to conflicts you really don't care about.

You would invoke `reroot` as follows:

    git reroot master..new-development

You should see some output that's showing you progress, and then a
line that looks like this:

    The newly created history is available as 2015200[...]

This command is *completely non-destrutive*, and will not affect *any*
ref, so it's safe to do whenever and wherever you like.

This output is telling you that the new tree is available, but not
linked.  You may use log (`git log 2015200`) to examine it, and when
you're ready to overwrite the current ref:

    git reset --hard 2015200

If you look through the deltas (`git log -p`), you may see some
changes that are much larger than you'd expect (especially towards the
beginning, or any merge points), but at any given commit, the source
tree is guaranteed to be in the exact state it was in when the author
committed it.

[reroot]:http://gitorious.org/projects/bindir/repos/mainline/blobs/master/git-reroot
