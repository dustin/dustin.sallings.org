---
layout: post
title: Project Skyscraper
---

# Project Skyscraper

It occurred to me that there's a lot of value in building xmpp
services -- much like web services, but using existing connections and
xmpp instead of http.

In collaboration with [ga2arch][ga2arch], I launched an xmpp service
called skyscraper.im.  This has actually been running for a while now,
but I've been too caught up in writing code to write anything about
code.

## translate.skyscraper.im

<div>
  <img class="floatright" src="/images/skyscraper.png"
    alt="skyscraper" />
</div>

The first part of this service is an xmpp [adhoc][adhoc] interface to
google translate.  It actually does support IM, but that's incidental,
the real value is in the adhoc interface.

If you're unfamiliar with xmpp adhoc, you can think of it much like
CGI, but using xmpp as a transport.  You take a bunch of simple
key/multi-value pairs and send them to a resource somewhere, and it
sends you something back.  The nice thing about xmpp, though, is that
the mechanism for determining what things exist and what parameters
they take are very programmatically accessible.

You can discover available commands through `translate.skyscraper.im`
as shown in [this video][vimeo-adhoc], but I'll just tell you what
it'll tell you:

### The Input

There is one field called `in` which is the input language in the form
of a two-character language code.  You may have only one of these (it
is of type `list-single`).

There is one field called `out` which is the output language and is
also in the form of a two-character language code.  You can have as
many of these as you like.

Finally there's a field called `text` which is the stuff you want to
translate.  You may only have one of these.

### The Output

The response is a form much like the one you sent it, the keys are
language codes and the values are the text translated in that
language.

Note that you will not receive more language translations than you
asked for, but you may receive fewer in the case where the upstream
translation service can't perform such a translation.

The obvious benefit here over doing it yourself is that you get full
translations all at the same time without having to do any kind of
coordination as things are completing (i.e., I do that for you).

## conference.skyscraper.im

<div>
  <img class="floatright" src="/images/skyscraper-chat.png"
    alt="skyscraper chat"/>
</div>

A fun thing built atop the translate component is the skyscraper muc
-- an xmpp multi-user chat with automatic translation.

What this means is that you can have several people enter a room with
no room in common, all speaking and reading their native language.

Of course, the dream is limited by the translation service, but it
*does* work within the reasonable limits.

If you'd like to try it out, find a friend who speaks another language
and both join a chat room at `conference.skyscraper.im`.  Start by
each of you telling it your respective languages (e.g. `/lang en`) and
then talk.

I've spent very little time on this, so I imagine it falls apart in
all kinds of places, but it was *really* easy to get going with the
translate service from above, and as it's an xmpp server component, it
does all this with just one file descriptor and the necessary state to
keep up with who's in what room and what translations are outstanding.

[ga2arch]: http://github.com/ga2arch
[adhoc]: http://xmpp.org/extensions/xep-0050.html
[vimeo-adhoc]: http://www.vimeo.com/5558475
