---
layout: post
title: Using Github Sync to Track Your Projects
---

# Using Github Sync to Track Your Projects

<div>
  <img alt="octocat syncing" class="floatright"
    src="/images/octocat-sync-small.png"/>
</div>

When [github](http://github.com/) announced their
[API](http://github.com/guides/the-github-api), I very quickly threw
together a [python implementation](http://github.com/dustin/py-github).

I didn't end up doing very much with the project as a whole, but I did
write one tool in here that I end up using quite a bit:
`githubsync.py`.

`githubsync.py` takes a github username and a directory and make sure
I've got a local copy of every public repo that user has on github.

Grab the repo and try it out:

    git clone git://github.com/dustin/py-github.git
    cd py-github
    ./src/githubsync.py dustin /tmp/dustinatgithub

Once that finishes, you will have all of my current public repos in
`/tmp/dustinatgithub` and if you run it periodically, you'll see new
repos I add appear while the existing ones are being updated.

But what about private repos, or even repos that aren't on github?

The file `~/.github-private` is read as a tab-delimited list of repos
and their sources and those will also be synchronized.  For example:

    cool-stuff	  git@github.com:dustin/cool-stuff.git

With that in place, the `cool-stuff` repo will be created and
synchronized along with all of the stuff found through the API.
