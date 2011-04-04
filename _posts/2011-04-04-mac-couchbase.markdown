---
title: Couchbase OSX
layout: post
---

<div>
  <img src="/images/membase-server-osx.png" alt="membase/osx"
      title="The Status Menu"
      class="floatright"/>
</div>

About a year ago, [Trond][trond] asked me to build him a GUI tool for
running membase on his Mac.  I finally got around to it and we liked
it enough that we're making it [available][mbosx] to everyone.

I've been on a cocoa development kick lately after doing some work
[Jan's][janl] CouchDBX for our [Couchbase Server 1.1][cbserver]
release.  It was really quite awesome and easy to get people going.  I
recommended it to all of my friends who were interested in CouchDB,
but it was not something I ever ran myself.

After releasing 1.1, I started thinking about what would really make
it better and put a bunch of time into something I'd run on my own
(both for development and my home production instance).  The biggest
features I wanted for myself were the following:

* Minimal UI in the app (much prefer the status bar only)
* Autorestart on failure (I like to kill my daemons randomly)
* Easy start at login

The minimal UI includes everything you need and nothing you don't.

Firstly, it no longer brings its own web browser.  You have one you
like, that's the one I want you to use.

Also, I run on a headless server with minimal resources.  I kill my
CouchDB randomly when it gets big, or whenever else I feel like doing
it.  It's a crash-only design, so why not let that happen and just
restart?  If you have a persistent failure (i.e. it can't run for at
least ten seconds), the server will pop up an alert box letting you
know, stop automatically restarting and wait for you to tell it to
retry or just give up.

Similarly, whenever my machine finishes booting, I want it running my
server.  Instead of hand-crafting a launchd config like I normally do,
I just check a box.  Done!

"But wait," you say, "what does this have to do with membase?"  After
estabilishing the process monitoring framework, the desired
interaction, and the build system (really the worst part), it was
pretty obvious how to get membase running a similar way.  The build
process isn't totally straightforward (lots of weird library stuff
requiring me to learn all about [install_name_tool][int] and magic
incantations of automatically discovery of development time
dependencies and packaging them up) and when you're done, you either
have to write a launchd plist or just sit in a terminal with the
thing running and manage its logs and all that kind of stuff.  That's
tedious.

In the end, there are two free packages ready for you that should work
exactly as you'd expect software to work on your Mac.

Get [Couchbase Server][cbserver] and [Membase Server][mbserver] and
instantly make all of your friends envious of how easily you can set
up scalable databases on your Mac.

[trond]: http://trondn.blogspot.com/
[mbosx]: http://www.couchbase.com/press-releases/Membase-for-Mac-OS-X
[janl]: http://twitter.com/janl
[cbserver]: http://www.couchbase.com/products-and-services/couchbase-server
[mbserver]: http://www.couchbase.com/products-and-services/membase-server
[int]: http://developer.apple.com/library/mac/#documentation/Darwin/Reference/ManPages/man1/install_name_tool.1.html
