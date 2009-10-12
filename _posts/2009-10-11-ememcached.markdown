---
layout: post
title: EMemcached
---

# Why an Erlang Memcached Implementation?

<div>
  <img src="/images/a-o-k.png"
       alt="Memcached! Do you speak it?" class="floatright"/>
</div>
I wrote an [erlang implementation][ememcached] of a memcached server
speaking the binary protocol over the weekend.  You're all probably
wondering why.

It was half a learning exercise, and half a way to plug a
[memcapable][memcapable] interface into more applications.  In its
current form, I consider it a framework to take existing erlang
backend stores (e.g dict, ets, dets, mnesia, [riak][riak], etc...) and
put a memcached interface on them.  On its own, it's a little boring.

The first implementation of the binary protocol was in my
[memcached-test][memcached-test] project (which I still actively use
as a reference implementation when playing around with features and
testing clients and things).  It's a simple asyncore based server in
python (with a sample synchronous client).

A bit later, came the actual [production C][memcached] server version
we all know and love (which also had my [java client][spymemcached] to
talk to).

I wrote [twisted memcached][twistedmc] and built an S3-backed server
one weekend.

That leads us back to the present [erlang-based server][ememcached].

## But Wait, There's More!

If you have a basic understanding of erlang, you may find this
implementation to be the best documentation of the protocol in
existence.

In the main loop of a connection, all I'm doing is calling
`process_message` in a loop with the connected socket, a reference to
the storage server (an erlang `gen_server` implementation), and the
result of a call to `gen_tcp:recv(Socket, 24)`.  That last call will
either return `{ok, SomeData}` or `{error, SomeReason}`.

### The Fun Part

The only definition of `process_message/3` I have is shown below.  The
*only* valid way to call this is when the third argument is the `{ok,
Data}` tuple where `Data` in this case is a binary pattern.  Some of
the values are filled in (which means they *must* match for this
function body to be invoked), and some are bindings which will receive
the value.

In the code below (extracted from [mc\_connection.erl][mc-connection]),
you'll see that the first 8 bits must exactly be the defined
`REQ_MAGIC` constant, and then the next 8 bits are stored in `OpCode`,
and so on.

Any attempt to process a message not in this form will result in the
connection processing crashing (the effect of which is your client
being disconnected from it).

So you can see how erlang easily allows us to rip the bits we need out
of the header for dispatch, so the next thing is to ask for the
remaining data (extra headers, key, and body) before dispatching to
the storage server process.

{% highlight erlang %}
process_message(Socket, StorageServer,
                {ok, <<?REQ_MAGIC:8, OpCode:8, KeyLen:16,
                      ExtraLen:8, 0:8, 0:16,
                      BodyLen:32,
                      Opaque:32,
                      CAS:64>>}) ->

    % After the header is extras, key, and then body
    Extra = read_data(Socket, ExtraLen),
    Key = read_data(Socket, KeyLen),
    % Note that the length of the body from the header includes
    % the lengths of the key and extras.
    Body = read_data(Socket, BodyLen - (KeyLen + ExtraLen)),

    % Dispatch the read data to a gen_server process.
    Res = gen_server:call(StorageServer,
                          {OpCode, Extra, Key, Body, CAS}),

    respond(Socket, OpCode, Opaque, Res).
{% endhighlight %}

### The Storage Server

A storage server process is a `gen_server` implementation whose
`handle_call` implementations look will take a tuple of `{OpCode,
ExtraHeader, Key, Value, CAS}` and return a `mc_response` record.

For an example storage server, consider my two `flush` implementations
in my [hashtable store][mc-hash] (noting that flash has one 32-bit
integer in extra header, no key, and no value):

{% highlight erlang %}
% Immediate flush. Ignore the current state and make a new one.
handle_call({?FLUSH, <<0:32>>, <<>>, <<>>, _CAS},
            _From, _State) ->
    {reply, #mc_response{}, #mc_state{}};
% Delayed flush. Keep the current state and schedule a
% flush to occur (via handle_info) in the future.
handle_call({?FLUSH, <<Delay:32>>, <<>>, <<>>, _CAS},
            _From, State) ->
    erlang:send_after(Delay * 1000, self(), flush),
    {reply, #mc_response{}, State};
% More stuff Follows
{% endhighlight %}

That's pretty much it.  Even if nobody uses this code, it's useful to
me as a protocol reference since it's easier to read than even the
[binary specification][binaryspec].

[memcapable]: http://blogs.sun.com/trond/entry/memcapable
[memcached-test]: http://github.com/dustin/memcached-test
[ememcached]: http://github.com/dustin/ememcached
[riak]: http://riak.basho.com/
[memcached]: http://code.google.com/p/memcached/
[spymemcached]: http://code.google.com/p/spymemcached/
[twistedmc]: http://github.com/dustin/twisted-memcached
[mc-connection]: http://github.com/dustin/ememcached/blob/master/src/mc_connection.erl
[mc-hash]: http://github.com/dustin/ememcached/blob/master/src/mc_handler_hashtable.erl
[binaryspec]: http://cloud.github.com/downloads/memcached/memcached/protocol-binary.txt
