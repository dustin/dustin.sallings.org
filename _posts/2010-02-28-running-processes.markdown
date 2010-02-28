---
layout: post
title: Running Processes
---

<div>
  <img src="/images/startmeup.jpg"
       alt="If you start me up I'll never stop - Rolling Stones"
       title="I run this bitch, and I'm a keep running - Birdman and Lil' Wayne"
       class="floatright"/>
</div>

I keep suffering a lack of decent process supervision mechanisms
provided by operating systems I use.

Most systems and software seem to have this idea that a "start up
script" is the right approach.

This is horribly wrong as is demonstrated by [lots][god] and
[lots][monit] and [lots][procmon] of tools that exist to do that on
top of so many really awful "ps via cron" kind of things people hack
together or process counts via [nagios][nagios] or whatever.

This post describes alternatives I've found to help relieve my
suffering, but has ended up exceedlingly long.  I'll provide quick
links to specific sections:

# TOC

<ul>
  <li><a href="#howwrong">How Wrong Can You Get?</a></li>
  <li><a href="#whatswrong">What's Wrong with monit/god/nagios/etc...</a></li>
  <li><a href="#rightway">So What's the Right Way?</a>
    <ul>
      <li><a href="#osx">OSX</a></li>
      <li><a href="#solaris">Solaris</a></li>
      <li><a href="#ubuntu">Ubuntu</a></li>
      <li><a href="#freebsd">FreeBSD</a></li>
      <li><a href="#genericlinux">Generic Linux</a></li>
      <li><a href="#thirdparty">Third Party Tools</a>
        <ul>
          <li><a href="#daemontools">daemontools</a></li>
        </ul>
      </li>
    </ul>
  </li>
</ul>

<a name="howwrong">&nbsp;</a>
## How Wrong Can You Get?

The worst one of these I've personally seen was a group of contractors
who pieced a system together via [tibco][tibco].  There was a computer
that had a process that needed to be monitored.  There was another
computer that ran a monitor thing that would send out messages over
tibco that would be processed by an agent on the first machine that
would run a really long shell script that would do some `ps`, `grep`,
`awk` and other stuff to search for a process and then maybe restart
it before replying back across the tibco bus.

It did this about once a minute and used something like 60% of the CPU
to verify the machine was still running.  They demonstrated this to me
and was all ready for me to tell them how amazed I was with their rube
goldberg sysadmin skills, but my response didn't leave them with the
good feeling they sought:

"Wow.  You reinvented [init][init] *and* cron, but managed to make
them both less reliable and consume more CPU than I could've
imagined."

<a name="whatswrong"> </a>
## What's Wrong With monit/god/nagios/etc...

Sometimes, these tools can be used for good, but often, they're
variations on the same theme as above.  You're polling your process
list, or a pid file, or whatever to try to see if another process is
running and then restarting it if it fails.

Many people seem to grab these tools with the goal of rerunning their
start script sometime after they've noticed the process is not
running.  This is the mentality I'm hoping to correct.

And this brings me to my point...

<a name="rightway"> </a>
## So What's the Right Way?

Don't *start* programs, *run* programs.

[init][init] already does this.  It does it *very* efficiently, with
no CPU overhead in the general case, no latency in the exceptional
case, no custom scripts to write, and with absolute reliability (that
is, it won't forget to run your command, and it won't crash without
taking the entire operating system with it).

Unfortunately, init has historically not been very easy to use use for
your own processes.  I'll break it down a bit here to help you keep
your stuff running.

**Note**: In every case, it's assumed that you have a program that
wants to run that does *not* daemonize on its own.  Self-daemonizing
programs start you down the path to hell.  You can't use any sane
keepalive techniques so you have to resort to polling process lists or
checking the pid or something.  Even managing that pidfile gets hard
when you combine it with things that change their own uid for safety
(because you should never run anything as root).

<a name="osx"> </a>
### Mac OS X

Mac OS X has [launchd][launchd] which combines init, cron, inetd, and
a few other things rolled into one.

Launchd provides tremendous amounts of granularity over control of
processes and extends that to users themselves to run applications
consistently on events.

The following example shows how you can have a program that runs
consistently while you're logged in.  Place this in
`~/Library/LaunchAgents/com.example.someprogram.plist` and launchd
should do its magic to keep it going.

{% highlight xml %}
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC
          "-//Apple Computer//DTD PLIST 1.0//EN"
          "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>Label</key>
	<string>com.example.someprogram</string>
	<key>KeepAlive</key>
	<true/>
	<key>RunAtLoad</key>
	<true/>
	<key>ProgramArguments</key>
	<array>
		<string>/path/to/someprogram</string>
	</array>
</dict>
</plist>
{% endhighlight %}

For disconnected use, you can build a similar plist and place it in
`/Library/LaunchDaemons/`, add a `UserName` attribute and have the
system maintain a program on behalf of another user for you quite
easily.

Much, much more can be done with launchd (such as run programs on
filesystem and network events).  It's open source and a horrible shame
it isn't everywhere, as it really does provide a tremendous benefit.

<a name="solaris"> </a>
### Solaris

Solaris has [smf][smf] which is similar to launchd, but provides even
more control over lifecycle, permissions, dependencies, fault
management and many other things.

If you're using Solaris, you probably understand it already, otherwise
I'd recommend reading [the smf docs][smf] to understand how to use it
to manage your system.

<a name="ubuntu"> </a>
### Ubuntu

Recent versions of ubuntu ship with [upstart][upstart], which is the
least modern of the modern system facilities, but at least does allow
you to specify that you want to *run* an application instead of just
*start* it.

Here's an example upstart script I wrote for a twisted app that I
needed to keep running on an ubuntu box:

{% highlight sh %}
description	"useful description"
author		"Dustin Sallings <dustin@spy.net>"

start on runlevel 2
start on runlevel 3

stop on runlevel 0
stop on runlevel 1
stop on runlevel 4
stop on runlevel 5
stop on runlevel 6

chdir /path/to/project/directory
exec /usr/bin/twistd --uid=daemonuser --syslog -ny project.tac
respawn
{% endhighlight %}

Note that this relies on `twistd` to change the uid since it's more
straightforward than using `su` or `sudo` to change the userid before
invoking the start script.

<a name="freebsd"> </a>
### FreeBSD

FreeBSD, and most BSDs for that matter have an init that will
supervise processes defined in `/etc/ttys`.  This is about as
primitive as it can get, but it works fine.

For example, if you wanted to run `sshd` on a FreeBSD box and make
sure that it can never die, you could add the following to
`/etc/ttys`:

    sshd "/usr/local/etc/sshd_tty" unknown on

The script, `/usr/local/etc/sshd_tty` exists primarily to eat the
implicit argument init passes to the program it runs.  For this, I
used the following script:

{% highlight sh %}
#!/bin/sh
exec /usr/sbin/sshd -D
{% endhighlight %}

`/etc/ttys` basically exists for [getty][getty] type services, but
it's suitable for any other process that needs to be supervised.

After any modification to `/etc/ttys`, you must run `init q` for your
changes to take effect.

<a name="genericlinux"> </a>
## Generic Linux

On any vanilla Linux system (that is, systems that don't use a modern
init as well as other systems with similar init mechanisms), you can
do something similar to the above with `/etc/inittab`, although it ahs
no implicit argument, so you can directly invoke sshd.

For example, the following works on my RedHat 5.4 box:

    sshd:2345:respawn:/usr/sbin/sshd -D

After adding this entry (and, of course, making sure you don't already
have an sshd server running), you can run `/sbin/telinit q` to get it
to reload.

<a name="thirdparty"> </a>
## Third Party Tools

It's possible to bring in a third-party program to supplement an init
that's less awesome than [launchd][launchd] and [smf][smf].  I
personally have limited experience doing this, but there's one in
particular that I've been using and found to do a good job.

<a name="daemontools"> </a>
### daemontools

[daemontools][daemontools] is [djb][djb] weird-ware that serves as an
excellent UNIX process supervision framework.

It's a bit weird out of the box, though.  It really wishes a file
structure existed that is just not natural on any UNIX system, but
some ports overcome that a bit.

However, it's very composable and has a lot of small tools that each
do one thing really well.

I've got an OpenBSD machine that's customized to the point where I
wrote my own `/etc/rc` from scratch.  This machine runs my DNS and
DHCP services as well as a few other things around the house.

I used to have a problem where it'd lose power or something and one of
the processes wouldn't come up cleanly -- very often DHCP, which made
things rather difficult for me.  I thought this would be a great place
to try daemontools for the first time.

It has so far made things much easier to deal with.

One service I have running, for example, is sample\_devices from my
[ibutton][ibutton] suite (thermometers &rarr; multicast, basically).
This needs to run as a user who can access `/dev/tty01` (I don't run
stuff as root unless absolutely required) and has a bit of init.

For this to work, I just have to create a `run` file in
`/services/sample_devices` which looks like this:

{% highlight sh %}
#!/bin/sh
mkdir /tmp/sample
chown uucp /tmp/sample
exec setuidgid uucp /usr/local/sbin/sample_devices \
        -b /dev/tty01 -c /tmp/sample \
        -m 225.0.0.37 -p 6789 -t 64 -s 2121
{% endhighlight %}

Note that the `exec` is important, as daemontools has a lot of control
utilities which requires it to know the pid of the actual running
process, not a shell that started it.  It's good practice anyway.

The one thing I don't like about daemontools is that the service
directories contain the startup scripts, control sockets, as well as
other lock states.  It'd serve me better if my service definitions
lived somewhere in `/etc/` and the runtime control lived somewhere in
`/var/run`, but I'm pretty happy with the results.

[god]: http://god.rubyforge.org/
[monit]: http://mmonit.com/monit/
[procmon]: http://www.yolinux.com/HOWTO/Process-Monitor-HOWTO.html
[tibco]: http://www.tibco.com/
[nagios]: http://www.nagios.org/
[init]: http://en.wikipedia.org/wiki/Init
[launchd]: http://developer.apple.com/macosx/launchd.html
[smf]: http://hub.opensolaris.org/bin/view/Community+Group+smf/WebHome
[upstart]: http://upstart.ubuntu.com/
[getty]: http://en.wikipedia.org/wiki/Getty_(Unix)
[daemontools]: http://cr.yp.to/daemontools.html
[djb]: http://cr.yp.to/djb.html
[ibutton]: http://bleu.west.spy.net/~dustin/projects/ibutton/
