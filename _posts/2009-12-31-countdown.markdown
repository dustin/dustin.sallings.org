---
title: Countdown Project
layout: post
---

OK. Last blog post of the year.

My TV is broken and my daughter said she wanted to celebrate the New
Year by watching some kind of ball dropping thing, so I had this sort
of "last minute" idea for something and searched around the house for
junk I could build it out of.

<div style="width: 425; height: 344px; margin-left: 10px; float: right">
<object width="425" height="344"><param name="movie"
value="http://www.youtube.com/v/Qv_ruj4lhXo&hl=en_US&fs=1&rel=0"></param><param
name="allowFullScreen" value="true"></param><param
name="allowscriptaccess" value="always"></param><embed
src="http://www.youtube.com/v/Qv_ruj4lhXo&hl=en_US&fs=1&rel=0"
type="application/x-shockwave-flash" allowscriptaccess="always"
allowfullscreen="true" width="425" height="344"></embed></object>
</div>

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

It's crap, but as it says in the comment in the python script, worse is better.

[rbb]: http://www.moderndevice.com/products/bbb-kit
[arduino]: http://www.arduino.cc/
[gist]: http://gist.github.com/267014
