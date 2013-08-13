---
title: Countdown Project
layout: post
---

OK. Last blog post of the year.

My TV is broken and my daughter said she wanted to celebrate the New
Year by watching some kind of ball dropping thing, so I had this sort
of "last minute" idea for something and searched around the house for
junk I could build it out of.

<iframe width="420" height="315"
        src="//www.youtube.com/embed/Qv_ruj4lhXo"
        frameborder="0" allowfullscreen>
</iframe>

A few LEDs, a servo, an [rbb][rbb] ([arduino][arduino] clone) and,
um, whatever scrap cardboard I could find and I was good to go.

If something looks ghetto, that's a feature.  I strongly encourage
people like myself who have perfectionist tendencies to just try to
make doing things poorly a goal now and then.  It helps.

I didn't really consider this much of a sustainable project, so I
really kind of hacked it together.  You can see the code that runs it
on [github][gist].

<div>
  <img alt="hot mess" class="floatleft" src="/images/countdown-back-small.jpg"/>
</div>
The python script initializes communication, synchronizes (which has a
corresponding visual effect across the LEDs) and then calculates the
time until the nearest target time (I've been rounding to the nearest
15s, hour, whatever).

One second before the countdown sequence starts, it pauses whatever
music I have playing and then turns the volume up.

After the command is sent, it waits a second and starts the music.
This causes the actual music to start just about in time for the clock
to strike midnight.

Then it blinks erratically.

It's crap, but as it says in the comment in the python script, worse
is better.

## Update (2010)

<div>
  <img alt="arted" class="floatright" src="/images/countdown-arted-small.jpg"/>
</div>
I made a few changes to it before we got to use it (actually, I was
playing with it until about 15 minutes before midnight :/ ).  Figured
I'd update this post with the details.

Summary of changes since the video:

1. It got a new face (thanks, kids).
2. I manually specified the angles instead of computing them to feel
more organic (and matched what the kids did).
3. Control side pushed sync commands through every fifteen seconds
during the last ten minutes.
4. I added some countdown vocals on the computer side to start us
going at `t - 10s`.

It was a great success.  It's now dismantled.

[rbb]: http://www.moderndevice.com/products/bbb-kit
[arduino]: http://www.arduino.cc/
[gist]: http://gist.github.com/267014
