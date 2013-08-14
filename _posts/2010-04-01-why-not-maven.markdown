---
layout: post
title: Why I Don't Use Maven
---

# Why I don't Use Maven for my Java Projects

(and what you can do about it)

<div>
     <img src="/images/maven.png" alt="maven" class="floatright"/>
</div>

I used to really like [maven][maven].  A long time ago.  Around version 1.x.
It had lots of great features I liked in a build system and required
very little work to do just about anything.  Then there was maven 2.

I often try to find an image to characterize my blog posts well.  In
this case, I just took the first image I saw on the maven site itself
and felt that it pretty accurately summed my experience with maven.

It's a guy sitting on a table with his back to his computer looking
out a window contemplating the jump.

"Will it hurt?" he asks himself.  "Will it hurt more than writing one
more XML element describing how my `.java` files get turned into
`.class` files?"

OK, so perhaps it's not as bad as the imagery on their site makes it out
to be, but I do have actual real reasons I'm not using it.

## Why Not?

I'm going to assume you know the virtues of maven.  I get complaints
from users of [my memcached client][spymemcached] for not directly
supporting their build tool of choice, so I'm just going to focus on
the parts that keep me away.

### Build De-automation

The absolute number one reason I've not put any effort into converting
my build into maven is because it would *increase* my work.  Not just
to do the conversion, but in an ongoing way.

<div>
    <img src="/images/manual.png"
      class="floatleft" alt="manual labor" />
</div>

I've asked many of the people who have wanted me to run my builds with
maven if they'd do the conversion for me.  I had two small requests
that I didn't think were unreasonable: It shouldn't increase my work
and it shouldn't reduce the features in my software.

Nobody has delivered this to me, and I can't see a way to do it myself.

Apparently, The Maven Way is to edit `pom.xml` for every release to
put the version number into that file (then, of course commit it in my
SCM) and then build and then do my normal tagging.

I have to write the version number out twice.

In contrast, here's the line to figure out the version of the software
I'm producing from the [buildfile][buildfile] I use when
I build my project using [apache buildr][buildr]:

    VERSION_NUMBER = `git describe`.strip

That's how every version I've released has worked since I switched to
git.  Before I used git with buildr, I used hg with buildr.  Before I
used hg with buildr, I used hg with maven 1.  Before hg and maven 1, I
used gnu arch and maven 1.  Never in the history of this project have
I had to modify the build system when I change version numbers.  I
think that's an important feature.

### My Build System is Not My SCM

There's a workaround for the above -- you use the [maven SCM plugin][mavenscm]!

Except, it's as backwards as a guy sitting on a desk facing away from
his computer.

<div>
    <img src="http://chart.apis.google.com/chart?cht=p&amp;chs=250x140&amp;chd=s:jSGBB&amp;chl=Trond|Dustin|Sean|Patrick|Steve"
      class="floatright" alt="contributors" />
</div>

The SCM plugin makes maven a user interface to my SCM.  I cannot tell
you how much I don't want another interface to my SCM.  I can,
however, tell you that I carefully make my tags and I have tools that
do neat stuff with my carefully created tags like generate a nice
useful [changelog][changelog].

I don't use my build tool to write my code.  I certainly don't use it
to commit my code or show me a diff.

What I *do* want is for it to appropriately interact with my SCM to
get the information it needs to do a build.

### Missing Build Automation

One of the features they added to maven 2 was you can't script.  You
can't script feature is great because, [according to the
site][m2excuse], they believe it's *better* to write a formal plugin
in java because not only is it less work for them (once), but you'll
probably find someone else has that to do the same thing you're doing
and you'll want to share it!

One of my projects has a rather large `maven.xml` file because it
builds a compiler code generator that it uses to generate code under
the current environment.  It's *very* specific to that build and the
code that goes with it.  I'm not writing and hosting a full-fledged
plugin in java to do what I used to do with a little jelly script (and
ant before that and make before that).

### Missing Build Plugins

This is a half-answer, but I'm missing features I want.  One could
write them, but nobody has.  This, again, was a jelly script back in
the data, and is now a buildr plugin, but for any given java library I
write, you have the ability to do this:

    dustinnmb:/tmp 794% java -jar x.jar
    spy.jar  on Fri Nov 13 10:47:00 PST 2009
    Build platform: java 1.6.0_15 from Apple Inc. on Mac OS X version 10.6.2
    Tree version: 2.5rc1
    (add -c to see the recent changelog)

That "Tree version:" listed there is straight out of the SCM.  If you
add the `-c` option, you get what is effectively my git log.  You can
take a file in isolation and know which bug fixes you have and all
kinds of other junk.

It's not even clear to me how one would go about doing this in maven.

### Real Benefits Have Unrelated Dependencies

<div>
    <img src="/images/unrelated.png"
      class="floatleft" alt="unrelated picture" />
</div>

Most of the time, when people ask me for maven support it's not
because of how I build my software.  It's not because they're having
trouble building my software (though that does come up).

Most of the time, they want to download it from the internet.

It was trivial to host a maven 1 repo, maven 2 repos are a bit harder
because you have to generate a descriptor and a few other magic files
and a deeper filesystem hierarchy for each build and then tell users
how to configure up your repo.

It's far better to just stick them in the main, centralized
repositories, but you pretty much have to use maven itself to do
that.

It is of course *possible* to create artifacts using another tool
(such as [apache buildr][buildr]) and get them uploaded into one of
the well-known maven repositories, but I don't see any support for
this coming out of the maven community.

I just can't express the absurdity of such a thing.

This is like someone telling you that you can't distribute software in
ubuntu unless you use `bzr` as your revision control software.  It
just doesn't make sense.

## Think About The Users

I don't have anything against maven as a concept per se, but it's not
right for me.  Yay freedom of choice.

I would of course like my software to be easy to consume for people
who do choose maven.  I've put effort into making this so, and that
effort has been slowly thwarted over time.

I intend to continue my efforts to make this work as easily as
possible for everyone, but if you find my software being built through
maven, it's because of some hard work of others.

[maven]: http://maven.apache.org/
[buildfile]: http://github.com/dustin/java-memcached-client/blob/master/buildfile
[buildr]: http://buildr.apache.org/
[spymemcached]: http://code.google.com/p/spymemcached/
[mavenscm]: http://maven.apache.org/scm/plugins/index.html
[changelog]: http://dustin.github.com/java-memcached-client/changelog.html
[m2excuse]: http://maven.apache.org/maven1.html#m1-maven-xml
