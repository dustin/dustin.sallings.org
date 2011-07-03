---
layout: post
title: Using Dropbox as a Work Queue
---

<div>
  <a href="http://dustinphoto.couchone.com/photo-public/_design/app/index.html">
    <img src="http://dustinphoto.couchone.com/photo-public/ebcf8d8b7e6c1a9680e2b108d2b0e1de/thumb.jpg" alt="photo"
        title="My dorkboard"
        class="floatright"/>
  </a>
</div>

I've been writing myself a web-based photo album for over a decade
now.  It's gone through many different technologies over the years as
I used it to learn new ways of doing stuff.

I'm finally shedding the years of java from it to do something that's
not only more lightweight, but also distributed.  The purpose of this
post isn't to describe the photo album, but a little bit of background
will help to understand the point of what's going on.

Most recently, my photo album is implemented as a [couchapp][couchapp]
which has been huge fun.

## My Photo Album

<div>
  <img src="https://github.com/dustin/photo-couch/wiki/photo-ng.png"
    alt="architecture" title="how the photo album works" class="floatleft" />
</div>

The [current version][source] has a basic [CouchDB][couchdb] backend
that lets me set up replication as shown in this image to the left
here.  Photos can be added or edited on any server (with the exception
of the [public instance][public], which is a replication target only)
and these adds and edits will eventually make their way to all of the
other servers.

Previously, pictures were added to the photo album by the means of a
[standalone OS X app][photoupload] that batches them into my local DB
which I then replicate out to others.

However, I haven't written such a thing for Android, so getting photos
I take on my phone while I'm out stored safely has been a bit more
difficult.  This is where Dropbox comes in.

## Dropbox As a Networked Spool

<div>
  <img src="/images/photo-dropbox-rep.png"
       alt="submitting through dropbox" class="floatright"
       title="From my phone to you." />
</div>

The Android app for Dropbox is really well done.  Apps that can share
files get a share button that will place the content directly into
Dropbox folders.

Dropbox itself delivers the files into their locations
[atomically][atomicdrop] -- that is, if a file doesn't sync up to
dropbox in its entirety, it won't be delivered, and a file will not
show up on any client machine until it's properly fully down and can
be moved in atomically (via `rename(2)`).

This seems like something worth taking advantage of, and the most
obvious way for me was to create a [spool][spool] within Dropbox.

### The Queue Processor

I wrote a simple uploader that grabs as much info as it can from the
photos that appear via dropbox, uses [PIL][pil] to do some scaling and
stuff and then sticks it in the local DB.

The recipe for safely and reliably processing items from a
[spool][spool] is relatively simple and well-known.  It is the
way print and mail processing systems have worked for decades.  The
wikipedia overview does a better job of explaining the concept, but
I'll go over the code I wrote for mine since I find it easier to
understand concepts with code than with English.

The actual queue processor based on the uploader is easy to understand
(almost the entire thing is shown below), but does have to take care
of failure modes, new things coming in while it's processing, etc...
For this, I end up with three directories:

1. The incoming directory
2. The work directory
3. The complete directory

The processor atomically moves an item from the incoming directory
(inside Dropbox) to the work directory.  It works on the item from
that location, then atomically moves it to the done directory once
it's done.

Here's what my spool processor looks like in python:

{% highlight python %}
def process(basename, processing, done):
    workfile = os.path.join(processing, basename)
    donefile = os.path.join(done, basename)

    # Move from the incoming directory to the work directory
    os.rename(basename, workfile)

    # Actual work happens here.
    doSomethingImportantWith(workfile)

    # Move from the work directory to the complete directory
    os.rename(workfile, donefile)

if __name__ == '__main__':
    incoming, processing, done = sys.argv[1:]

    os.chdir(incoming)
    for basename in os.listdir('.'):
        try:
            process(basename, processing, done)
        except:
            traceback.print_exc()
{% endhighlight %}

I'm catching all exceptions at the toplevel loop and just logging
them.  If anything goes wrong at any stage, the file will stay
wherever it was when it broke (usually the work directory).

Note that it *could* delete it when it's done instead of just moving
it to a `done` directory, but I don't want to automatically delete
stuff.

### Invoking the Processor

My script runs on Mac OS X, so I wrote a quick [launchd][launchd]
plist to read a sync dir and operate like a mail spool.  Basically, if
nothing's coming in, nothing happens.

My monitor plist looks something like the following:

{% highlight xml %}
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC -//Apple Computer//DTD PLIST 1.0//EN
          http://www.apple.com/DTDs/PropertyList-1.0.dtd >
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>net.spy.photoupload</string>
    <key>ProgramArguments</key>
    <array>
      <string>/path/to/script</string>
      <string>/Users/me/Dropbox/incoming-photos</string>
      <string>/Users/me/spool/work</string>
      <string>/Users/me/spool/done</string>
    </array>
    <key>WorkingDirectory</key>
    <string>/</string>
    <key>QueueDirectories</key>
    <array>
      <string>/Users/me/Dropbox/incoming-photos</string>
    </array>
  </dict>
</plist>
{% endhighlight %}

Place that in `~/Library/LaunchAgents` and have load it with
`launchctl load ~/Library/LaunchAgents/net.spy.photoupload.plist` and
we're up and monitoring (note that it'll automatically load on boot).

If you wanted to run something similar on a system other than Mac OS
X, you could easily write a queue manager that monitors the directory
using [kqueue][kqueue] or [inotify][inotify] or even just a cron job
poking around looking for new stuff.

[couchdb]: http://couchdb.apache.org/
[couchapp]: http://couchapp.org/
[source]: http://github.com/dustin/photo-couch
[public]: http://dustinphoto.couchone.com/photo-public/_design/app/index.html
[photoupload]: https://github.com/dustin/photoupload
[PIL]: http://www.pythonware.com/products/pil/
[launchd]: http://en.wikipedia.org/wiki/Launchd
[atomicdrop]: http://forums.dropbox.com/topic.php?id=21246
[kqueue]: http://en.wikipedia.org/wiki/Kqueue
[inotify]: http://en.wikipedia.org/wiki/Inotify
[spool]: http://en.wikipedia.org/wiki/Spooling
