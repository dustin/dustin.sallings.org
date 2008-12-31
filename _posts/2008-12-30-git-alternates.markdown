---
layout: post
title: Using Git Alternates
---

# Using Git Alternates

Now that you're happily using
[github sync](/2008/12/29/github-sync.html) to pull down all your
repos into local bare trees, you may want to free up a bit of disk
space from duplicate objects (about 120MB for me).

git has a way for multiple repos to share object space by way of
alternates.  You can read more about alternates in the
[repository layout documentation][1], but essentially it's a text file
that contains the location of another `objects` directory from which
objects may be fetched when needed.

## Example:

Let's say you're me and have checked out my photo album.  You'd end up
with a .git directory that looks like this:

    dhcp-39:/tmp/photo 599% du -sh .git
     18M	.git

By setting up an alternate using my [git alternate][2] command:

    dhcp-39:/tmp/photo 600% git alternate ~/prog/github/photo.git
    .git/objects -> /Users/dustin/prog/github/photo.git/objects

You can then gc and free up gangs of disk:

    dhcp-39:/tmp/photo 601% git gc 
    Nothing new to pack.
    Removing duplicate objects: 100% (256/256), done.
    dhcp-39:/tmp/photo 602% du -sh .git
    144K	.git

From 18MB to 144KB, and everything pretty much works as it did before.

You don't need my [git alternate][2] command, for that, of course, but
it makes it a bit easier when you've got a lot of them to do.

[1]:http://www.kernel.org/pub/software/scm/git/docs/gitrepository-layout.html
[2]:http://gitorious.org/projects/bindir/repos/mainline/blobs/master/git-alternate

