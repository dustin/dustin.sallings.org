---
layout: post
title: Monads are Tedious in Go
---

# Monads are Tedious in Go

<div>
    <img src="/images/gonad.png" alt="mqtt"
        title="Monads in Go"
        class="floatleft" width="200" height="272" />
</div>

Most of my personal projects are written in Haskell these days.
I've heard people say "Haskell is hard" or whatever for a long time,
but the reason I write most of my projects in Haskell isn't because
I'm smart and want to do the most impressive smart person thing
possible, but because I'm dumb and want better tools to help me
understand things more easily and avoid the kind of bugs that dumb
people like me write a lot.

On any given work day, I review at least one piece of
[go](https://golang.org) code.  Go kind of has a similar thing in
theory about not having "clever" features that might confuse people.
Some of this is really nice, but some of it is tedious.  I'm going to
get into the latter a bit here.

Much of the code I end up reviewing contains many reimplementations of
`<$>` or `>>=`, sometimes buggy.  These are scary looking things to
someone who doesn't write any Haskell, but they're so fundamental to
what most code is doing that you just absorb them quickly.

This post isn't meant to be a tutorial on Haskell operators, but `<$>`
is also spelled `fmap` and basically means "apply this function inside
that thing."  e.g., you might apply a function to each element of a
list, or to the value inside an optional (think nullable pointer).
`>>=` is the monadic "bind" operator and basically is used to combine
monadic actions.

At this point, you're either confused by jargon or angry for my how
inaccurate my descriptions are.  I intend to make things clearer as I
write.  I'm actually intending to write more about go, so let's get
going.

## Error Handling in Go

I actually rather like how error handling works in go.  Mostly.  I've
worked in lots of languages with exceptions and I've disliked most
exception handling I've encountered (including Haskell).  You either
end up with a completely opaque error path that you are unable to
reason about (e.g., any line of code may fail with any exception) or
you end up with an incomplete list of exceptions you might have to
care about, but generally can't do anything about at a particular site
(e.g., java checked exceptions which is always an incomplete list).

In go, a function that might fail will return an error.  This is
really nice.  You can see what might fail and decide what to do about
it.  In most cases, you just pass it up, but you don't have the
situation where you've forgotten to handle a particular exception type
and your program crashes instead of just failing gently.

There are two downsides, though:

1. You have to add the dreaded `if err != nil { return err }` code
   everywhere.
2. You have to check errors and ignore values on error by
   *convention*.

The first point is mildly annoying.  It seems unnecessary and there's
been [exhaustive discussions][try] around how to
improve the particular case.  Looking at it with my Haskell glasses
on, it seems really weird to even consider writing a special case
built-in just to cover what is a super generic concern.  This all for
what is just a special use case of `>>=`.

The second point comes up a lot in code review. You're not supposed to
use values if you also got an error.  You're not supposed to *return*
a useful value if you wish to return an error.  This is a bit beyond
the scope of what I wanted to discuss here, but it's something you
have to consider every single time you return a `(T,error)` and every
time you receive one.  The easy way to demonstrate what this code
*could* be accidentally doesn't have this problem either, so I wanted
to bring it up.

## Idiomatic Go is the Either Monad (sort of)

In go, if you want to return a value of type `T` or an error, you
generally return `(T, error)` and expect the user to only use one of
those values.  I'm going to contrast this to Haskell's `Either` type
which is *almost* the same.  `Either a b` can give you either `Left a`
or `Right b` (`a` and `b` are types here).  The primary difference is
the second point above...  you *can't* get both values.  You either
get an error or value.

As a Monad, `Either a` will effectively short-circuit any failure and
continue forward with any value.

Let's look at an example where we have a function that takes two
numbers as strings, adds them together, and returns the value as a
string:

```go
func readInt(s string) (int, error) {
	return strconv.Atoi(s)
}

func add(a, b string) (string, error) {
	ai, err := readInt(a)
	if err != nil {
		return "", err
	}
	bi, err := readInt(b)
	if err != nil {
		return "", err
	}
	return strconv.Itoa(ai + bi), nil
}
```

(I included `readInt` just so the types are visible)

This is pretty straightforward, idiomatic go.  The rough equivalent in
Haskell would look something like this:

```haskell
readInt :: String -> Either String Int
readInt = readEither

add :: String -> String -> Either String String
add a b = case readInt a of
            Left x -> Left x
            Right ai -> case readInt b of
                          Left x -> Left x
                          Right bi -> Right (show (ai + bi))
```

That's kind of worse in that it seems to march off to the right.  What
if we wanted to add three numbers!?

But `Either a` is a monad, so we can use `>>=` to get things done.
This is the equivalent function without `case`:

```haskell
addM :: String -> String -> Either String String
addM a b =
  readInt a >>= \ai ->
  readInt b >>= \bi ->
  pure . show $ ai + bi
```

This does the same thing -- we'll either get ai as an int, or it'll
short-circuit the rest of the function and return the error we got
from trying to parse the value.  i.e., it does all the `if err != nil
{ return err }` bits for you.

Much like in the iniital version, `ai` is the `Int` form of of the
`String` `a` as `bi` is for `b`.  `ai` and `bi` are arguments to
lambda functions that do stuff with those `Int` values.  It should be
clear here that there's no possible way to get `ai` if `readInt`
returned a `Left` (error), so the only thing the code *can* do is
return that error and not push the value into the next lambda.
There's not a way to get this wrong.

In the wild, you'd probably be more likely to see this written in the
`do` syntax, which is just syntactic sugar for the above:

```haskell
addM' :: String -> String -> Either String String
addM' a b = do
  ai <- readInt a
  bi <- readInt b
  pure . show $ ai + bi
```

Note that this isn't a Haskell language feature that knows how to do
fancy stuff with `Either a` -- that's just how the library is
defined.  You can make your own monad that works differently (as long
as it's [lawful](https://wiki.haskell.org/Monad_laws)).

Of course, I wouldn't write it that way either, since monads are also
applicative functors.  My brain automatically rewrites that using
[liftA2][liftA2]:

```haskell
addA :: String -> String -> Either String String
addA a b = show <$> liftA2 (+) (readInt a) (readInt b)
```

Again, same error handling, etc...

## Monadic Go

Now, imagine we had a similar monadic functionality in go.  We'd
write something like:

```go
func add(a, b string) (ErrorOr[String]) {
	ai ⩴ readInt(a)
	bi ⩴ readInt(b)
	return strconv.Itoa(ai + bi)
}
```

This is similar to the [try][try] specification mentioned earlier, but
with the dream of having an arbitrary binding mechanism that lets
specific types (in this case, `ErrorOr[T]`) decide what it means to
either move values forward or fail.

## Tedium

I wasn't thinking about this because I want to sell people on Haskell.
It's more about how I see the same stuff written in go (and other
languages) every day and have to be super vigilant to make sure nobody
is introducing bugs in their error handling.  I catch bugs in code
like this regularly.  These types of bugs can't be expressed in code
that will compile if they just embraced the monads they were
reinventing and got to work at a higher level.

The terminology is probably confusing to folks from strange lands, but
much like the olde Gang of Four patterns, we see the same stuff a lot
and name the patterns.  Except we also make libraries that just *do*
the patterns, so we don't have to reinvent things so frequently.

[try]: https://github.com/golang/go/issues/32437
[liftA2]: https://hackage.haskell.org/package/base-4.15.0.0/docs/Control-Applicative.html#v:liftA2
