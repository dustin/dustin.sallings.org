---
layout: post
title: Git Archaeology
---

# Git Archaeology

<div>
  <img class="floatright" src="/images/indiana_jones_small.jpg" alt="indy"/>
</div>

I just spent a while reconstructing the history of my code
[junk drawer][snippets].  It's on its fourth revision control system now
([cvs][cvs] &rarr; [tla][tla] &rarr; [mercurial][hg] &rarr;
[git][git]) and has been through a lot of different tree states.

CVS really only versions files, but allows you to arrange things into
a hierarchy, so I had a natural hierarchy and reflected it in a
similar way in CVS.

Gnu arch favored smaller repositories, so when I did the conversion
from CVS, I broke the snippets down into several different "branches"
and versioned each language independently.  I had one container branch
that had a build config that would recreate the tree.  This codebase
lived through three different archives (repositories) and some of the
individual snippets had a couple versions within that.

Once I started using mercurial more, I needed my snippets with me, but
mercurial didn't have a similar mechanism for managing a collection of
repositories (even today, the [forest extension][forest] is not
distributed with mercurial).  I had attempted to use [darcs][darcs] to
reconstruct a single tree with full history but the trees renamed, but
darcs wouldn't ever complete with a subset of what needed to be
converted.  I ended up just snapshotting what was in gnu arch and
dropping it into a single mercurial repository.

Having moved into git, I finally have the tools to actually put the
history back together correctly.  By "correctly", I mean I wanted a
single repository with all of the changes in it ordered
chronologically (the order in which junk was placed in the drawer)
without lots of weird merges that didn't actually happen.  I *also*
needed to dig up all of the history prior to the snapshot I took for
mercurial and get it all in place.

## Bringing up Snippets

Just to add to the complexity story, keep the following in mind:

1. After tla, code was committed into mercurial from a snapshot.
2. That snapshot was (cleanly) converted to git, and more code was
   committed there.
3. One failed archaeological excursion had a few commits as well.

I started by going to the latest gnu arch versions of each snippet set
and converting them to git repositories (by way of mercurial -- but
that's a different story).

## Setting up the Repo

I created a repo with a single empty commit in it as the eventual root
of all of the other repos.

Once each repository was converted to individual git repositories, I
brought added them as remotes to the conversion repository.  Each
branch needs to be considered related in order to facilitate the
eventual merge, so I created grafts that placed the root of each
branch atop my empty commit using the following script:

{% highlight sh %}
#!/bin/sh

empty=6c417dd379ccdb46de57e7a3860379633c270c9e

for b in "$@"
do
	oldest=`git rev-list --reverse $b | head -1`
	echo "Grafting $b"
	echo "$oldest $empty" >> .git/info/grafts
done
{% endhighlight %}

This was run for every remote repo and then each branch was run
through `git filter-branch` to place the changes atop the empty branch
in a real history.

### Rewriting Tree Structures

These weren't quite ready to merge just yet.  Before I could even
consider an actual merge, I needed to modify the tree structures
(e.g. take all of the stuff at the toplevel of the `eiffel` directory
and move it under an `eiffel/` directory).  The previous excursion had
done this using a recipe I'd found on the internet somewhere which
*worked*, but did the wrong thing with my version of sed.  Using gsed
cleaned this up.

For each remote branch, I'd run the following filter:

{% highlight sh %}
#!/bin/sh

git filter-branch -f --index-filter \
        'git ls-files -s | gsed "s-\t-&eiffel/-" |
                GIT_INDEX_FILE=$GIT_INDEX_FILE.new \
                        git update-index --index-info &&
         mv $GIT_INDEX_FILE.new $GIT_INDEX_FILE' $1/master
{% endhighlight %}

**Note**: Out of pure laziness, I would edit this script for every
invocation and then run it for a single remote.

### Doing the Merge

<div>
  <img alt="merge" class="floatleft" src="http://img.skitch.com/20090101-6s52spepjx7qgjaj3yuscuasa.png"/>
</div>

The merge was really rather exciting.  The image to the left shows a
24-way octopus merge.

That is, after grafting the empty changeset to the bottom of every
branch, they now had common ancestry, making a merge possible.  Since
each branch got its paths rewritten all throughout history, there was
no chance of conflict.

So enter the octopus.

<br clear="both"/>

### Performing a Linear Rewrite

As cool as it was to do a massive octopus merge, I wanted linear
history.

It would be possible to produce a graft file to place each change atop
a single parent, but that seemed quite hard.

The strategy I employed was to dump the entire history using
`git format-patch` and then write [a script][historyscript] to rename
all of the patches to be in chronological order so I could use
`git am` to reconstruct the tree.

So I created a new branch from "empty", and ran `git am` for a while.
A nice bonus is that `git apply` strips off trailing whitespace for
me, so the changes were slightly cleaned on the way in (I could've
disabled that, but I rather liked it).

### Removing Emptiness

I no longer needed the "empty" changeset after `git am` was complete,
so I had to get rid of that.  The root node is generally a bit
difficult to touch, but I sort of guessed that I could add a graft of
a hash without a parent and it'd make that change the new root.

So another trip through `git filter-branch` and I've now got a pretty
decent set of history up throgh the snapshot that was taken for the
mercurial conversion.

### Catching up to the Present

So now that I've got everything up to the snapshot, what do I do?

I had a lot of options here -- cherry-picking, grafting,
format-patch.  I think I went with format-patch arbitrarily.
Basically, I did a `git format-patch` of the full history from the
latest git repo and applied those changes to the newly created one.

### Verification

So now that everything has been all hacked up and history is rewritten
and changests grafted, etc...  how do I have any idea whether it's
even close to where it was before?

This is where git's content tracking stuff really saves the day.  With
the git repo I've been using as a remote, I can do a simple diff
across the trees from the latest branches (and various other states).
The only differences I saw were some new scripts/etc... had been
added.

All's well.  I certainly learned a lot.

[snippets]:http://github.com/dustin/snippets "snippets"
[cvs]:http://www.nongnu.org/cvs/ "concurrent version system"
[tla]:http://www.gnu.org/software/gnu-arch/ "gnu arch"
[hg]:http://www.selenic.com/mercurial/ "mercurial"
[git]:http://git-scm.com/ "git"
[forest]:http://www.selenic.com/mercurial/wiki/index.cgi/ForestExtension "forest"
[darcs]:http://darcs.net/ "darcs"
[historyscript]:http://github.com/dustin/snippets/tree/master/python/misc/rewrite-patches.py
