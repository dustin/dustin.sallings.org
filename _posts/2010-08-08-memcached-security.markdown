---
layout: post
title: Memcached Security
---

<div>
  <img src="/images/joe-psa.jpg"
       alt="Stay in School"
       title="Put reflectors on your bike or be runover"
       class="floatright"/>
</div>

Memcached security is a hot topic since the sensepost guys released
[go-derper][derper] at blackhat.

The presentation was pretty good and informative, but it seems like
the hype around it has left a bunch of people confused.  Although much
of this was covered in the presentation, it needs to be restated as
much as possible.

## First and Always, Firewall

This is really part of the sysadmin placement test and has nothing to
do with memcached in particular, but I'm going to go ahead and mention
it anyway.

You always start by firewalling *everything* and then allowing only
stuff you need to pass through to the places you need it to pass
through.

I won't teach you how to use your firewall, but start with the setting
that disables all connectivity to your box.

If you're running a web server, allow connections to port `443`.  If
you also want non-ssl connections, allow port `80`.  If that's the
only service you're providing, then your firewalling is now complete!

I'd like to note that [Amazon EC2][EC2] does this *by default*, yet
enough firewalls are misconfigured that they felt the need to send out
a form mail to many of their users to let them know that they "have at
least one security group that allows the whole internet to have access
to the port most commonly used by memcached (11211)".

## Check Your Bindings

If your application only runs on one server (with the app and
memcached on the same box), you can bind it to localhost by adding

    -l 127.0.0.1

to the memcached flags.  Now even though you've firewalled access to
memcached, you have to be *on* the machine to even contact the cache
when someone breaks your firewall settings.

## If You Need It, Use SASL

The latest versions of memcached support [SASL][sasl] authentication.

Although you've already firewalled your memcached services off, you
can require clients to perform strong authentication before using the
service.

You can read more about setting this up in
[the SASL howto page of the wiki][saslhowto].

## Please, *Please* Do Not Run as Root

memcached *does not* want to run as root.  It tries hard to prevent
this.  Yet many people have a "workaround" that allows memcached to
start as root (which I will not repeat) just for the sake of making
their infrastructure less secure.

If someone somehow bypasses the firewall you have set up preventing
access to memcached and somehow manages to find a security hole in
memcached allowing code execution, do you *really* want to just hand
over root access?

There are no such known issues, but we don't audit the code to ensure
it's safe to run as root.  That's OK, though, because no responsible
sysadmin would ever run a service as root without very strong
justification, and probably a lot of work in creating a jailed
environment.

## Check Your Firewall Settings

Look, I'm not doubting that you know how to set up your firewall, but
just bear with me.

<div>
  <a href="http://nerduo.com/thebattle/"><img src="/images/thebattle.png"
       alt="Knowing"
       title="Knowing is Half the Battle"
       class="floatleft"/></a>
</div>

Grab [nmap][nmap] or similar.  Run a full port scan across your box --
one from a trusted system, one from a semi-trusted system, and one
from a completely untrusted system.

If there's any response for any service you cannot justify running,
you now know about it and can fix it.

That's not just memcached -- that's gearman, beanstalkd, snmpd, a mail
server, a DNS server, LDAP server, etc...

For any service you *do* have running and publicly available, make
sure you *completely* understand the security implications of running
this service.

Do not be embarrassed to ask if you don't understand everything.  It's
a lot better than being an example in a presentation at the next black
hat because you're running a service you didn't intend to and you
leaked important information.

[derper]: http://www.sensepost.com/blog/4873.html
[sasl]: http://en.wikipedia.org/wiki/Simple_Authentication_and_Security_Layer
[saslhowto]: http://code.google.com/p/memcached/wiki/SASLHowto
[nmap]: http://nmap.org/
[ec2]: http://aws.amazon.com/ec2/
