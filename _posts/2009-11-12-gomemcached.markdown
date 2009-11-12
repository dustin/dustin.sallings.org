---
title: Hello World in Go -- A Memcached Server
layout: post
---

# Hello World in Go -- A Memcached Server

<div>
  <img src="/images/gomemcached.png" alt="go memcached" class="floatright"/>
</div>

I sat down last night to learn [go][go].  I've been a fan of
concurrency-oriented languages since I wrote my [first erlang
program][environ] in early 2004 (which I still use).  I've been
itching to give [go][go] a go since the announcement.

The first thing I thought of that could naturally be modeled as a
concurrent program was a [memcached][memcached] server.  That has sort
of become my "hello, world" as I have implemented the [first python
server][mtest] for the memcached binary protocol (using asyncore), the
[main server][memcached] (which [Trond][trond] made beautiful), an
[erlang server][ememcached], and a [twisted server][tmemcached].

My [go server][gomemcached] has a lot in common with
[ememcached][ememcached] since both languages are concurrency
oriented.  There is one process/goroutine for managing the actual data
storage, one for accepting TCP connections, and one for each connected
user.

The TCP listener just accepts and spins up new processes or goroutines
to handle the IO on the connections and then they wait for data.  Once
they've read a single request, they dispatch to the storage mechanism
which will sequentually process each operation, regardless of input
concurrency.  Very simple, very easy to understand.

I mostly liked what I saw.  The code feels a little C-like, but in
practice is fairly intuitive and pleasant to work with.  There are
many [reviews][review] of the language and I'm not attempting to write
one, but I will say that I got hung up on the lack of exceptions which
required me to do [weird][weird] error handling in sequential code.

The concurrency primitives remind me a bit of [alef][alef] which I
remember from early [plan9][plan9] distributions, though I never
actually got a chance to work with it before it got killed off.  The
one part of alef I really liked lived on in go, which further
motivated me.


[go]: http://golang.org/
[environ]: http://github.com/dustin/environ
[alef]: http://en.wikipedia.org/wiki/Alef_%28programming_language%29
[plan9]: http://plan9.bell-labs.com/plan9/
[memcached]: http://memcached.org/
[mtest]: http://github.com/dustin/memcached-test
[ememcached]: /2009/10/11/ememcached.html
[tmemcached]: http://github.com/dustin/twisted-memcached
[gomemcached]: http://github.com/dustin/gomemcached
[trond]: http://blogs.sun.com/trond/
[weird]: http://github.com/dustin/gomemcached/blob/master/mc_conn_handler.go#L72
[review]: http://scienceblogs.com/goodmath/2009/11/googles_new_language_go.php
