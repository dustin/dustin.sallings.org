---
layout: post
title: Publishing Changelogs
---

# Publishing Changelogs

A user filed a bug against my [memcached client][client] because he
couldn't find the changelog and wanted to know what went into the new
version.

I have a decent structure around releases, especially with this
project.  I tag it and write a good summary of changes in the tag
including an abbreviated shortlog output, then I send the same out to
the mailing list.

Somehow, I expected anyone not on the mailing list to just dig through
my tags to find out what's changed.  I suppose that's asking quite a
bit.

Since I've been keeping good information in my tags since moving over
to git (which actually has proper tag objects), I've found it quite
easy to automate this process.  My new [git htmlchangelog][clcmd]
takes a list of tags and generates a reasonable changelog
automatically from this.

For example, the following command:

    git htmlchangelog `git tag | egrep -v pre\|rc` > changelog.html

created [the changelog][clientchangelog] for my memcached client.

[client]:http://code.google.com/p/spymemcached/
[clcmd]:http://github.com/dustin/bindir/blob/master/git-htmlchangelog
[clientchangelog]:http://dustin.github.com/java-memcached-client/changelog.html
