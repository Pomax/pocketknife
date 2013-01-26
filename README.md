Tiny toolkit is a small (I'm trying to keep it near 10kb,
it's a little over atm, but at least it minifies to 5kb)
library that expands the JS API for HTML elements, element
creation, and element query selecting. Thing of it as a
pocket knife for DOM stuff, contrasted to jQuery's
squadron of helicopter gunships.

One thing it does quite well is not care about whether your
selector found zero, one, or multiple results. The API
will be the same, so none of that crazy $("p")[0] nonsense:
just use find("p") and if there's only one result, that
will be a normal HTML element. With extended API. If there's
more, it'll be an array. With the same extended API.

Most functions chain, meaning you can do things like:

    document.body.add(
      create("div", {id: "temp"}, "This is a temp div")
      .show(false)
    ).find("#temp")
     .parent()
     .get(0)
     .remove()

(yes, that's a very elaborate way to effect a net result
of no change - make div, add div, make div invisible, find
div in body, get div's parent, which is body, get body's
first child, which is div, then tell that to remove itself)

Note that tiny toolkit "installs" itself into the DOM API.
As such, it's not so much a library as bolt-on JS API
extension. It changes the Array and HTMLElement prototypes,
and this may break things. If you don't like that, don't
use this. Frankly, the Array and HTMLElement JS APIs are
long overdue for an update, and it was starting to annoy
me to no end. So this fixed that for me. Hopefully it
fixes things for you too =)

There's a battery of tests for the API, for both HTMLElement
and Array, and so far all tests pass on Chrome, Firefox,
Opera, Safari and IE. If you're doing something and you
run into a bug, file an issue and I can add a test for it,
then fix it (in that order).

- Pomax