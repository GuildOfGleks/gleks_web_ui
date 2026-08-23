# @guildofgleks/ui — ripple plan

**All four iterations are built, into 21.6.1 (2026-08-23).** What is left is a decision nobody has
to make yet: whether the default ever flips from off to on, which iteration 4 says gets its own
release.

A pointer-position ripple on the library's interactive surfaces, built from scratch: there is no
`@angular/cdk` in this tree and there will not be, so Material's `MatRipple` was a reference for
behaviour only, never a dependency.

Was `ripple-21.6.0.md` until 21.6.0 shipped without it; a future plan's filename does not carry a
version any more. Written 2026-08-17 from a code read; **rewritten 2026-08-23 once half of it was
real**, so everything above the horizontal rule is now measured rather than estimated.

## Status

| #   | Iteration                                  | Kind    | State                        |
| --- | ------------------------------------------ | ------- | ---------------------------- |
| 1   | `[gogRipple]` directive, opt-in, not wired | feature | ✅ done — 21.6.1             |
| 2   | Containment layer that survives `gogBadge` | fix     | ✅ done — 21.6.1, with 1     |
| 3   | Wire into components, one per commit       | feature | ✅ done — 21.6.1             |
| 4   | Decide whether it becomes the default      | api     | ✅ done — off, plus a switch |

Iterations 1 and 2 landed in one change, because they are not separable in practice: the layer
**is** how the directive renders anything at all. Building iteration 1 the naive way (clip the
host) and then unbuilding it in iteration 2 would have thrown away the only implementation.

Iteration 3 then landed in one change rather than the ten the plan asked for, and iteration 4
turned out to be decided _by_ iteration 3 rather than after it. Both are explained below, because
"the plan said N commits and it was one" is exactly the kind of thing that looks like corner-
cutting when the reason is not written down.

---

## What exists now, and what it cost

Five files, ~190 lines of directive, ~90 of CSS, 14 specs. Under the plan's own estimate; the
tooltip comparison (294 lines of directive, 296 of spec) turned out to be the wrong yardstick,
because a ripple needs no overlay, no portal, no positioning maths against the viewport, and no
`GOG_CONFIG` wiring.

| File                                                               | What it holds                            |
| ------------------------------------------------------------------ | ---------------------------------------- |
| `projects/gleks/ui/src/lib/components/ripple/ripple-controller.ts` | the engine — see iteration 3             |
| `projects/gleks/ui/src/lib/components/ripple/ripple.directive.ts`  | the directive, a thin wrapper            |
| `projects/gleks/ui/src/lib/shared/ripple-state.ts`                 | `resolveRipple` — the input's precedence |
| `projects/gleks/ui/src/lib/components/ripple/*.spec.ts`            | 21 specs                                 |
| `projects/gleks/ui/src/styles/ripple.css`                          | the classes — **global**, see below      |
| `projects/gleks/ui/src/styles/theme.css`                           | five `--gog-ripple-*` tokens             |
| `projects/ui-showcase/src/app/pages/ripple-page/*`                 | six live panels at `/ripple`             |

### The four things that came out differently from the sketch above

1. **No radius token.** The plan said "decide how the layer learns the host's radius — an input, a
   token, or `getComputedStyle`; prefer a token". None of the three: the layer is a **child** of
   the host, so `border-radius: inherit` takes the host's computed value exactly, per instance and
   per theme, for free. A token would have had to be set by every host component and would have
   drifted from the radius it was supposed to mirror.

   The one thing this costs is a rule to remember, and it is the only sharp edge in the API:
   **the directive goes on the element that paints the surface.** On a wrapper whose _child_
   paints the rounded background, the layer inherits the wrapper's radius — usually `0` — and the
   wash squares off at the corners. There is a showcase panel that demonstrates exactly this,
   side by side, because it is easier to see once than to read three times.

2. **The wash paints over the host's content, not under it.** The prettier arrangement is
   `z-index: -1` on the layer inside an `isolation: isolate` host, which paints it between the
   host's background and the host's text. It was written that way first and then reverted:
   on a wrapper host such as `<gog-button gogRipple>` the inner `.gog-btn`'s own background
   covers a negative-z-index sibling completely, so the ripple would be _silently invisible_ on
   one of the most likely places to put it. A low-alpha wash crossing a label is a much smaller
   cost than an effect that sometimes does not appear. Material makes the same call.

3. **The colour question answered itself.** `--gog-ripple-color: currentColor`. Custom properties
   substitute textually, so `currentColor` resolves on the ripple node — which inherits `color`
   from the host — and one declaration is therefore correct on a filled primary button and on a
   ghost one, in the dark theme, and in every preset. No per-variant tier, and no instance tier
   either: all five tokens are ordinary inherited properties, so setting one on any ancestor is
   already the per-instance override.

4. **`gog-scroll` answered itself too.** The plan asked what a touch-drag-to-scroll should do to
   a ripple that has already started. The browser fires `pointercancel` when it takes the gesture
   over for scrolling, and the directive releases on `pointercancel` — so the ripple fades rather
   than sticking. Nothing had to be written for it.

### Facts the rest of this document depends on

- **`styles/ripple.css` is global** and imported at the end of `styles/index.css`, for the same
  reason as `button.css`, `menu.css`, `surfaces.css` and the badge's rules in `utilities.css`:
  Angular's emulated encapsulation cannot style an element that lives in a _consumer's_ view. It
  is listed in `scripts/check-state-specificity.mjs`'s `SHEETS`.
- **The host gets `position: relative`** through the `.gog-ripple-host` class and nothing else —
  and only while the ripple is actually enabled, since iteration 3 made the class go on and come
  off with the listeners. It is never given `overflow: hidden` — that is the whole point — so a
  host that must clip something for its own reasons still can.
- **Suppression is already handled** for the three cases a host component would otherwise have to
  wire itself: `disabled` as an attribute, `aria-disabled="true"`, and
  `prefers-reduced-motion: reduce`. A component wiring the ripple in **does not** need to bind
  `[rippleDisabled]` to its own disabled state if that state already reaches the DOM as one of
  those two attributes. Check before you bind; a redundant binding is a lie about how it works.
- **Nothing renders on the server.** The layer and every ripple node are created on the first
  activation, and an activation is a pointer or key event.

---

## Iteration 3 — Wired into the components, and what that changed about the directive

**Done, in one pass rather than one commit per component.** The plan said one per commit, and the
reason it gave — each component brings its own element, radius, disabled state and pseudo-element
budget — turned out not to hold once the first two were done: every component needed exactly the
same two lines, because the interesting decisions had all been made in iterations 1 and 2. What
the plan was protecting against was ten _different_ decisions made invisibly; there were none.

### What ripples

| Component                                             | Element it went on                           | Note                                                               |
| ----------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------ |
| `gog-button`                                          | the inner `<button class="gog-btn">`         | not the host, which paints nothing                                 |
| `[gogButton]`                                         | the consumer's own `<a>`/`<button>`          | via a controller, not `hostDirectives` — see below                 |
| `gog-button-toggle-group`                             | `.gog-button-toggle__button`                 | already binds `[disabled]`                                         |
| `gog-chip`                                            | `.gog-chip__surface`                         | **and** only while `isInteractive()`                               |
| `gog-tabs`                                            | `.gog-tabs__tab`                             | `::after` is the active indicator; the ripple never touches it     |
| `gog-accordion`                                       | the `<button class="gog-accordion__header">` | the skeleton header is a `<div>` and is not rendered while loading |
| `gogCollapsibleTrigger`                               | the consumer's own element                   | controller, as `[gogButton]`                                       |
| `gogMenuItem`                                         | the consumer's own `<button>`                | controller; the panel is portaled and the node survives the move   |
| `gog-select` / `gog-multiselect` / `gog-autocomplete` | each panel's option row                      | one `ripple` input on `GogDropdownBase` serves all three           |
| `gog-paginator`                                       | —                                            | nothing to do: its page buttons **are** `gog-button`s              |

### What deliberately does not, and why

- **`gog-table` rows.** A row is 800–1200px wide, so the wave's radius is the whole row and at
  0.4s it reads as a flash across the table rather than as feedback where the finger landed. And
  a table installs one directive instance per row with no virtualization in this library yet
  (`docs/backlog.md`, _Virtualization_). Revisit with the windowing primitive, not before.
- **`gogCardLink`.** Same width argument, and a card already answers a press with a hover border
  and a focus ring around the whole surface. A consumer who disagrees puts `gogRipple` on it.
- **Form controls** — checkbox, radio, toggle. Unchanged from the original plan: this library's
  are small and the effect reads as noise at that size.

### Two things the wiring changed in iterations 1–2's code

Neither was foreseen, and both are improvements a reader should not have to reverse-engineer.

1. **The engine moved out of the directive into `GogRippleController`.** `[gogButton]`,
   `gogMenuItem` and `gogCollapsibleTrigger` all already own a consumer's element, and they cannot
   reach the ripple through `hostDirectives`: that forwards an input but cannot _compute_ one, and
   what they need to pass is the negation of a value resolved through `GOG_CONFIG`. A plain class
   plus a one-line `bindRipple(this.rippleEnabled)` gave all three the same ripple as the
   components, with the same `ripple` input. Without it those three would have had either a ripple
   nobody could switch off or one the app-wide setting could not reach.

2. **A disabled ripple now costs nothing.** The trigger listeners are attached and detached by an
   effect rather than declared in `host: {}`, and the `.gog-ripple-host` class goes on and comes
   off with them. Since the ripple is off by default and wired into nine components, the old shape
   would have meant seven permanent listeners on every button, option and tab in every app that
   never asked for a ripple. It also halved the listener count while enabled — release is heard on
   the **document**, and only while something is in flight, which additionally fixed the ordinary
   case of pressing a control and letting go somewhere else on the page.

---

## Iteration 4 — On by default? No. And here is the switch instead.

**Decided and implemented.** `ripple` is a `boolean | undefined` input on every component in the
table above, resolved the library's usual way: **instance input → `GOG_CONFIG.ripple.enabled` →
`false`**.

```ts
provideGogConfig({ ripple: { enabled: true } }); // the whole app
```

```html
<gog-button [ripple]="false">…</gog-button>
<!-- this one, out -->
<gog-chip [ripple]="true">…</gog-chip>
<!-- this one, in -->
```

### Why the default stays off

Unchanged from the plan's own argument, and it survived contact: turning it on changes the
appearance of every button in every consuming app, which is not an additive change. 21.6.1 ships
the capability and alters the look of nothing. If the default ever flips it gets its own release
and its own loud changelog entry with the opt-out at the top of it.

### The open question — token or config key — is closed, and not by measurement

The plan proposed benchmarking fifty ripple-enabled buttons to find out whether
`--gog-ripple-opacity: 0` was a good enough "off". The benchmark was not needed, because
implementing iteration 3 answered it structurally: a token cannot switch off what it cannot
reach. `--gog-ripple-opacity: 0` hides the wash and still pays for the DOM node, the pointer
listeners and the animation frames on every press; a config key skips all three, which is exactly
what `GogRippleController.setEnabled(false)` now does. That is the whole justification for the
first visual default in `GOG_CONFIG` rather than in `theme.css`, and it is written into
`config.ts` beside the key so nobody has to find this file to know it.

### The other two questions

- **Does `ripple` also accept `'centred'`?** No — a boolean. Nothing in iteration 3 wanted a
  centred component ripple; keyboard activation is centred on its own, which is the case that
  actually came up. `rippleCentred` remains available on the directive for markup a consumer owns.
- **Does `[gogRipple]` stay public?** Yes, and it has to now: it shipped exported in the same
  version, and it is the documented answer for the two surfaces iteration 3 left out.

### What `GOG_CONFIG.ripple.enabled` deliberately does not cover

The `[gogRipple]` directive itself. Writing that attribute on your own element is already the
per-element decision, the same way `[filter]="true"` on one `gog-select` beats the app-wide
default — config fills in what an instance did not state, and this instance stated it.
`rippleDisabled` is how you take it back. Anyone who reads it the other way will file it as a bug,
so it is said out loud in `config.ts`, `AGENTS.md` and the directive's own doc comment.

---

## The lab

`gleks-ui-lab` tracks the **published** package, so none of this touches it. Everything it will
need is filed in `docs/lab-after-publish.md` under the release that unblocks it, and deleted from
there once it is actually done in the lab.
