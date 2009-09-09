---
layout: post
title: Buildbot and Git Repositories
---

# Buildbot and Git Repositories

<div>
  <img class="floatright" src="/images/RefuseToApologize.png"
    alt="I refuse to apologize." />
</div>

In a recent conversation with the GitHub guys, I was talking about how
my [buildbot][buildbot] setup was hitting GitHub and how a recent
filesystem glitch of theirs caused my screen to turn red with
[growl][growl] alerts from [buildwatch][buildwatch].

The response was a tongue-in-cheek &ldquo;I refuse to
apologize.&rdquo;

The thing is, that response is absolutely the right one.   This is
distributed revision control.  Why did I have a screen full of growl
alerts because of a failure of a filesystem completely unrelated to
what I was doing?

I was relying on GitHub to be highly and quickly available to my
seventeen (and growing in number) buildbot slaves for this project.

*Most* of the time, there's nothing for them to actually get from a
centralized revision control -- quite simply, they were asking for
information that they had cryptographically verifiable assurance that
they already had.

Today I made a [small change][change] to buildbot that prevents the
slaves from ever talking to any network service to pick out a
reference version in our most common use cases, thus realigning myself
with the thing that initially sold me on GitHub's service: It enhances
collaboration without causing me to be dependent on the service.

For this failure, I am thankful.  This new code will always be faster
and more reliable for the common case even when GitHub works
absolutely flawlessly.

## See Also

[When GitHub Goes Down][down].

[buildbot]: http://buildbot.net/
[growl]: http://growl.info/
[buildwatch]: http://code.google.com/p/buildwatch/
[down]: http://ozmm.org/posts/when_github_goes_down.html
[change]: http://github.com/dustin/buildbot/commit/fabad2476cebc077d58c9293ce389d465648b019
