---
layout: post
title: Taranis and the Nano QX
---

# What's This?

<div>
    <img src="/images/qav400.jpg" alt="qav400"
        title="My QAV400 in a test flight"
        class="floatright" width="406" height="295" />
</div>

So, this isn't my typical programming post, but I wanted to write
about stuff I learn in my hobby time.  I fly things.

Building and flying is a fun, but I have a specific topic that might
be interesting.

To the right is a picture I took during an early test flight of a quad
I built.  Building and flying is pretty fun, but you need a lot of
space, big batteries, good weather, etc...

I want to write about some of my "development" work in the meantime,
though.  It's Christmas today.  The weather's not too bad, but it's a
bit windy.  Since it's winter, we also don't have as much light, so I
want something I can fly indoors.

<div>
    <img src="/images/fpvnanoqx.jpg" alt="fpv nano qx"
        title="The FPV Blade Nano QX is great for indoor training"
        class="floatleft" width="210" height="158" />
</div>

So I practice a lot indoors on my [Blade Nano QX][nanoqx] for both
<abbr title="line of sight">LoS</abbr> and
<abbr title="first person view">FPV</abbr> flying.  I slam it into
walls and people and what-not with minimal harm.

If you pick one of these up with one of the
<abbr title="ready to fly">RTF</abbr> kits, you get a *terrible*
radio controller.  It's OK to learn some basics, but won't get you
very far (literally, my tiny apartment exceeds the range of this
thing).

# Better Control

<div>
    <img src="/images/taranis.png" alt="taranis+"
        title="This is my radio, there are many like it, but this one is mine"
        class="floatright" width="240" height="250" />
</div>

My weapon of choice is the [Taranis+][taranis].  It's basically a
weird computer whose interface is a bunch of switches and knobs and
joysticks that you can use to control things over RF.

Note that the Nano QX requires [DSM2][dsm2] or [DSMX][dsmx] for
control and the Taranis won't do that natively, but I got an
[OrangeRx][orangerx] module that speaks the right protocols and
plugged it in as an external radio.

In order to get basic flight control of the Nano QX, you plug in the
module, and set up the following:

* Thrust on Channel 1
* Aileron on Channel 2
* Elevator on Channel 3
* Rudder on Channel 4
* Flight Mode on Channel 6

Note that flight mode is a toggle, so I mix it in from a momentary
switch (`SH`) on the Taranis.  This is a bit unfortunate, because it
means the radio has no way to tell what flight mode you're in -- you
have to just look at the stupid lights to see what it's doing.

Also note that aileron and rudder are reversed, so in the "servos"
config, you'll need to mark them as inverted.  e.g.:

<div>
  <img src="/images/taranis-qx-servo.png" width="424" height="128"
    class="centered" alt="inversed servos" title="Note inverted servos"/>
</div>

At this point, you should have basic flight operations.

# Advanced Mixing

But that's all background.  The main thing I wanted to write about is
how I use [OpenTX][opentx] to actually do interesting things with this
model.

## Taming Acro Mode

First, the acro mode on the Nano has been described as "fidgety."  In
that mode, rather than auto-leveling when you let off the sticks, the
pitch and roll are basically held such that aileron and elevator
control change the rate at which it rotates in the specified
direction.  Tiny, tiny adjustments will just about flip the thing.
This wasn't fun for me, so the first thing I did was make a curve I
could apply to pitch and roll to give me subtle controls in the
middle, but still allow me to do flips and stuff.

<div>
  <img src="/images/taranis-qx-curvy.png" width="424" height="128"
    class="centered" alt="control curve" title="Real controls have curves"/>
</div>

To apply this, I made a flight mode on the Taranis controlled by `SA`.
I only change ail and ele control in mixes.  For example, existing ele
control would be set for only flight mode 0.  The new mode (2 at this
point) gets a new mix that's only for flight mode 2 and works pretty
much like the default, but applies the curve defined above.  Repeat
for ail.

Now you jump into the right flight mode on the taranis and flip `SH`
until the light turns red and bam -- it's flyable.

## Auto Banking (via Super Advanced Mixing)

That was fun and practical, but I wanted see if I could automatically
bank the craft while flying when I try to turn only using yaw.

**Goal**: In isolation, yaw, pitch, and roll should all work normally.
But when pitched forward, yaw should proportionally also apply roll to
bank the aircraft.

**Secondary goal**: I have no idea how much to do this, so I want to
make the amount configurable on the fly via one of the sliders (I used
`LS`).

This was non-obvious enough to make me want to post about it.

### Flight mode Setup

We create `FM1` for this new flight mode.  For the initial goal, we're
not adjusting anything, so nothing special just yet.

### Limit Rudder (optional)

For `FM1`, I modify my `CH4` (Rud) mix to a weight of 50%.  This is
optional, but since my goal is to fly around and do circles and stuff,
I thought slowing down the pirouettes was helpful.

If you do this, this should override the existing rudder control.

### Make the Curve

We need a curve that takes us from zero in the middle to 100 at either
size.  A smoothed curve is good here.  I use the following:

<div>
  <img src="/images/taranis-qx-arcurve.png" width="424" height="128"
    class="centered" alt="autobank control curve" title="curving the roll"/>
</div>

This curve is used to grab an absolute distance from zero in elevator
control, as we want to bank proportionally to the pitch regardless of
the direction we're going.

### Configure Aileron Channel

So here's the kind of tricky part.  For the FM3 aileron channel
mixer, we want three inputs.

1. Rudder at 50%
2. Elevator at 50% with the above curve applied *multiplied* in
3. Aileron input *added* in

This allows us to mix the rudder and elevator to compute an aileron
while still giving us relatively normal aileron control, though it'll
be a bit exaggerated at speed if you try to bank manually and/or
difficult to flatten.

### Dynamically Changing Bank Amount

The 50% up there was an arbitrary number.  I don't actually know what
a good number is, and it sucks to reconfigure everything when you want
to experiment.  That's why we have knobs and sliders and stuff.

We can adjust weights with a global variable, so we just need a way to
adjust the global variable.  Firstly, have the global `GV1` variable
owned by the flight mode, as shown here, defaulting to 0.

<div>
  <img src="/images/taranis-qx-gvar.png" width="424" height="128"
    class="centered" alt="global variables" title="setting the global vars"/>
</div>

Because we want to adjust the weight from 0 to 100 (unless you want
counter-banking), we need a curve to adjust the slider input linearly
over that amount.

So basically this curve:

<div>
  <img src="/images/taranis-qx-adjcurve.png" width="424" height="128"
    class="centered" alt="adjustment curve" title="linear 0-100 curve for adjustment"/>
</div>

Applied to a new input with `LS` as a source (I used input slot 10
here just to separate from the radio channels):

<div>
  <img src="/images/taranis-qx-adjinput.png" width="424" height="128"
    class="centered" alt="adjustment input" title="adjustment input"/>
</div>

Then it's a simple matter of having a special function set the value
of `GV1` to the cooked output of this input (`IAAdj`).

Then just swap out the `50` weight above with the variable `GV1` and
you're done!

Rudder example:

<div>
  <img src="/images/taranis-qx-adjrud.png" width="424" height="128"
    class="centered" alt="adjusted rudder" title="adjusted rudder"/>
</div>

Repeat the same for elevator and enjoy the magic.

# But I'm Lazy!

You can look over the OpenTX [printout](/static/nanoqx-printed.html) of the
model, or just [download the model][model] directly to play with
it.

[taranis]: http://www.frsky-rc.com/product/pro.php?pro_id=137
[opentx]: http://www.open-tx.org/
[nanoqx]: http://www.bladehelis.com/Products/Default.aspx?ProdID=BLH7280
[orangerx]: http://www.hobbyking.com/hobbyking/store/__51704__OrangeRX_DSMX_DSM2_Compatible_2_4Ghz_Transmitter_Module_JR_Turnigy_compatible_US_Warehouse_.html?strSearch=orangerx
[dsm2]: https://www.spektrumrc.com/Technology/DSM2.aspx
[dsmx]: https://www.spektrumrc.com/Technology/DSMX.aspx
[model]: https://raw.githubusercontent.com/dustin/taranis/master/nanoqx.eepe
