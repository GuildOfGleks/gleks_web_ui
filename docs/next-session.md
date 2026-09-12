# Where to start

**Read `docs/virtualization.md`'s status table and its two "as it finished" sections first.** The
prose above them was written before the work and three of its four named traps turned out
differently; the iteration notes say how.

## What is in flight

`21.13.0` is open in `projects/gleks/ui/CHANGELOG.md`, unreleased. Nothing about it is the user's
to cut yet — rule 1 stands.

## The one thing left on this plan

**Iteration 4: `gog-table`.** The plan deliberately gates it:

> Stop after 3 and re-read this file before starting 4. […] The backlog's own instruction is not
> to start this as a table feature, and the corollary is not to finish it as one either, on
> momentum.

That is why it was not started in the same session as 2 and 3. Nothing in the three dropdowns
exercised any of what the table needs: **variable row heights** (the window's whole arithmetic
assumes one pitch), a **sticky header** (which is not a row and must not enter the range), and a
**selection column** that spans the window. The plan says it may become its own plan, and on the
evidence of iterations 2 and 3 — where the predicted hard part was free and the real work was
somewhere else both times — it should be surveyed before it is designed.

`GogVirtualWindow` is still internal, not exported. If the table's adoption gives a consumer a
reason to hold one, that is when it becomes public API; `public-api.ts`'s rule is to export only
what a consumer should use.

## Before anything else, though

`docs/backlog.md`'s Defects section, per the project's own ordering. It is in good shape —
both defects this programme produced are closed — but read it rather than assuming.

## A trap that cost time here, and will again

**A hidden Chrome tab pauses `requestAnimationFrame`, and these components measure their rows in
one.** `docs/ripple.md` records the CSS-animation half of this; the rAF half is worse, because a
scripted check in a hidden tab silently reads the seed value and reports it as the measurement —
it does not fail, it lies. Foreground the tab (a `computer` click on the page does it), or shim
`requestAnimationFrame` to `setTimeout` in the page. If you shim it, note that hidden-tab timers
throttle to about a second: a 400ms wait reported "the window did not move" when it had moved
1.2s later.

## Not started, and not mine to start

`docs/lab-after-publish.md` has a full 21.13.0 section, including three new `virtualize` entries.
It cannot begin until 21.13.0 is on npm.
