# Feedback triage — the 21.6.1 hands-on pass

**Source:** three hours in the lab against the published 21.6.1, Chrome 150 with animations
forced off, plus a phone check in Samsung Internet. 30 items. This file sorts them by _what
release can carry them and why_, and records the four findings that changed the sorting.

**The headline: none of it blocks 21.7.0, and two thirds of it cannot even start until 21.7.0
is published.** Every LAB item lives in `gleks-ui-lab`, which resolves `@guildofgleks/ui` from
the **published** package (`CLAUDE.md` rule 3). Holding the release to fix them is not a trade —
it is a deadlock.

---

## What was verified in the code, not assumed

Four checks, because four of the reported symptoms have a different cause than the report
assumed, and the cause changes which release they belong to.

### 1. The cross-browser colour problem is `color-mix()` with no fallback — and it is one bug, not four

`theme.css` uses `color-mix(in srgb, …)` **37 times** and declares **no fallback for any of
them**. There is no `browserslist` in `package.json` or `.browserslistrc`, so nothing in the
build ever flagged it.

A browser that does not support `color-mix()` **drops the whole declaration**. The token then
falls back to whatever `var()` default the consumer's stylesheet has, or to nothing — which is
exactly "the colours are different in Samsung Internet" and "the colours are wrong in Firefox".
`color-mix` landed in Chrome 111, Firefox 113, Safari 16.2 and Samsung Internet 22; a phone one
or two Android versions behind is below that line.

**This is the single highest-value fix in the whole list.** It is one mechanical pass — every
`color-mix` declaration gets a flat fallback immediately above it, which older browsers use and
newer ones override — plus a `browserslist` so the question stops being invisible. It explains
several separate-looking complaints at once.

### 2. The select/multiselect chevron does not rotate _at all_ — reduced motion is a red herring

Reported as "with animations off, the chevron does not change position". The chevron has no
rotation in any state: `select.component.scss` has no `rotate`, no `transform` on
`.gog-select--open`, and the template renders a static `chevron-down`. It never moved, animated
or not.

`gog-accordion` **does** rotate its chevron (`--gog-accordion-chevron-transition-duration`), so
this is an inconsistency between two components, not a motion-preference bug. The fix is to add
the rotation — and to write it as a `transform` on the open state, so a reduced-motion user gets
the end state instantly rather than nothing.

### 3. The ripple is suppressed under reduced motion on purpose, and the lab never turns it on

Two separate things behind "the ripple does not work":

- Under `prefers-reduced-motion: reduce` the ripple is suppressed outright — in CSS
  (`.gog-ripple-layer { display: none }`) **and** in the controller, which checks `matchMedia`
  before creating anything. There is a test named for it. With animations forced off, no ripple
  is the designed behaviour, and the reporter guessed as much.
- **The lab never calls `provideGogConfig`**, and `ripple.enabled` is `false` by default. So the
  ripple is off everywhere in the lab except any page that enables it locally. "Does not work in
  Samsung Internet" most likely means "is not switched on", not a browser difference.

Fix is documentation plus a lab config, not library code.

### 4. `gog-scroll` does not intercept the wheel, by design

"I hover, the horizontal scrollbar appears, I turn the wheel and the page scrolls." The
component draws an overlay thumb over **native** scrolling and deliberately does not touch wheel
handling — its own comments say so. A vertical wheel over a horizontal container scrolling the
page is the browser's behaviour, not a defect.

It is still a real usability gap, and fixing it means intercepting `wheel` and translating
vertical delta to horizontal on a horizontal-only container. That is new behaviour with a
scroll-chaining trap attached, so it is a minor, not a patch.

---

## Ship 21.7.0 now — the recommendation

Nothing in the list is a regression in 21.7.0, and 21.7.0's own payload is complete and
verified. The list argues _for_ publishing sooner, not later:

- **11 of 30 items are lab-only** and are blocked on publication by rule 3.
- **4 more** are lab-side symptoms of library issues, so they need the published package too.
- The library items split into real defects (a patch) and new API (a minor). Neither wants to
  ride a release that is already done.

**One thing worth adding to 21.7.0 if you want it:** a sentence in `README.md`/`AGENTS.md` saying
the ripple is suppressed under `prefers-reduced-motion`. It is the reporter's own item, it is a
docs-only change, and it is the kind of thing that is annoying to discover twice. Ten minutes.

---

## 21.7.1 — defects, no new API — ✅ all nine done (2026-08-29)

**Every item below shipped.** Two of them were not what the report assumed, and one fix broke
another item two commits later — recorded per row.

**What the pass cost that the plan did not predict:** three of the nine fixes had to be corrected
after a human looked at the result. Tinting `elevated` collided with the hover tier and repainted
every panel; the shadow left behind hazed instead of lifting; and giving the accordion header a
background made its own loading skeleton invisible at 1.02 contrast. Each was caught by eye, none
by a check — so `check-tokens` gained rule I (a theme's three surface tiers must be three
different colours), which is the only one of the three that could be automated.

Everything here is wrong today against what is already documented. No new inputs, no new
components, so none of it needs a minor.

| #   | Item                                                                        | Where                 | Size                                                                           |
| --- | --------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------ |
| 1   | `color-mix()` fallbacks for all 37 declarations + a `browserslist`          | `theme.css`           | **M** — mechanical but wide; needs a real old-browser check                    |
| 2   | Chevron rotation on `select`/`multiselect` open state                       | 2 components          | S                                                                              |
| 3   | Table header does not separate from the body when scrolling                 | `table` tokens        | S — give the header its own background token                                   |
| 4   | Two expanded accordions run together; header and content share a background | `accordion` tokens    | S                                                                              |
| 5   | `elevated` card/panel is invisible on dark themes                           | `card`/`panel` tokens | S — a shadow cannot read on a dark ground; needs a border or a lighter surface |
| 6   | `textarea` shows the native scrollbar when squeezed, not `gog-scroll`       | `textarea`            | M — the two are different scroll hosts                                         |
| 7   | Toast gives no sense of remaining time when animations are off              | `toast`               | M — the reporter's countdown idea is good, but it is new UI                    |
| 8   | Accordion loading state: header and chevron do not show loading separately  | `accordion`           | S — reported as broken; reproduce first                                        |
| 9   | Document the ripple/reduced-motion rule                                     | README, AGENTS        | XS                                                                             |

**Estimate: 2–3 focused sessions.** Item 1 is half of it and deserves its own, because verifying
it means actually loading the lab in an older browser rather than trusting a support table.

---

## 21.8.0 — new API, each needs a decision first

| #   | Item                                             | Why it is a minor                                                   | Size |
| --- | ------------------------------------------------ | ------------------------------------------------------------------- | ---- |
| 1   | `gog-button` `severity` (warning / success / …)  | New public input, new token families per severity                   | M    |
| 2   | `gog-button` pressed state                       | New state to token, style and test across variants                  | S–M  |
| 3   | Input masking (phone, barcode, …)                | **Needs a plan before code** — see below                            | L    |
| 4   | Horizontal wheel handling in `gog-scroll`        | New behaviour, scroll-chaining trap                                 | M    |
| 5   | Whole-row click when `gog-table` selection is on | Behaviour change on an existing input; conflicts with `gogRowClick` | M    |

**On the mask (item 3), the reporter already asked the right question** — extend `gog-inputfield`
or build a new component? That is exactly the question `panel-card.md` answered for the card, and
its test applies here: _what does it own that an input and a directive do not?_ My read is that a
mask is a value transform, not a control — so it wants to be a directive (`gogMask`) that works
on `gog-inputfield` **and** on a consumer's own `<input>`, the same argument that made
`[gogButton]` a directive. But that is a plan to write, not a conclusion to act on.

**Estimate: one session per item, plus one for the mask plan.**

---

## The lab — after 21.7.0 is published

All 11 LAB items, plus Q2. Added to `docs/lab-after-publish.md`, which is where lab work already
queues. **Q1 and Q3 turned out not to belong here** — Q1 didn't reproduce, and Q3 was a library
bug fixed directly in `@gleks/ui` (see both rows below); neither needed a `gleks-ui-lab` edit.

| #   | Item                                                                                       | Size     | Note                                                                |
| --- | ------------------------------------------------------------------------------------------ | -------- | ------------------------------------------------------------------- |
| 1   | No horizontal scroll on code blocks on phones                                              | S        | Real bug — code is unreadable on mobile                             |
| 2   | Expose `AGENTS.md` for reading/download                                                    | S        | It already ships in the package                                     |
| 3   | Russian labels in the global-config example                                                | **done** | Fixed 2026-08-29 in the repo copy; the lab picks it up on publish   |
| 4   | Theme generator missing component examples                                                 | M        |                                                                     |
| 5   | "Full technical comparison" is stale                                                       | M        |                                                                     |
| 6   | FAQ is stale                                                                               | M        | Also carries the removal prose already queued                       |
| 7   | Full-width examples need a dashed outline to show the container                            | S        | Good idea; applies to every page                                    |
| 8   | Per-page "global config for this component" section, or a note saying there is none        | **L**    | The biggest lab item — every page, and it needs a source of truth   |
| 9   | Header search over component names and keywords                                            | M        |                                                                     |
| 10  | RTL toggle in the header next to the theme switcher                                        | S        |                                                                     |
| 11  | Accordion loading example broken                                                           | S        | Verify against library item 8 first                                 |
| Q1  | `gog-menu` portal draws over the footer; menu forced downward                              | —        | **Closed, not reproduced (2026-08-30).** Tested live against published 21.7.1 in `gleks-ui-lab`: both `gog-select` (20-option panel) and `gog-menu` (`longMenu`, the branch list) flip **up** correctly when placed just above the lab's real footer, at desktop width. The footer sits in normal flow with no `z-index` of its own, so a panel that *did* open down would legitimately paint over it — `--gog-dropdown-z: 300` versus the footer's `auto` is by design, not a bug. Not reproduced at desktop width; narrower/mobile layouts untested. |
| Q2  | Checkbox `indeterminate` example reads right-to-left                                       | S        | Likely example markup, not the component                            |
| Q3  | Multiselect `+N` chip sits above the text baseline                                         | **done** | **Fixed 2026-08-30**, library + `ui-showcase` (not yet published). Root cause: `.gog-ms` centers children by box height (`align-items: center`), and the `+N` badge's smaller font-size (14px vs. the value's 16px) put its visual center above the value text's baseline. Added `align-self: baseline` to `.gog-ms__value` and `.gog-ms__overflow` (not to `.gog-ms__actions`, which stays box-centered for its icons). New "Overflow summary" example added to the multiselect showcase page to keep it reproducible. |
| +   | Padding at the bottom of the component list, so the browser's status bar does not cover it | XS       |                                                                     |

**Estimate: 3–4 sessions.** Item 8 is a third of it.

Q1 and Q3 must be reproduced in `ui-showcase` first: if they reproduce there, they are library
bugs and belong in 21.7.1, not in the lab queue.

---

## The theme running under all of it

The closing remark — _"the library is missing visual feedback that the user pressed a button,
moved a slider, clicked a dropdown"_ — is not a 31st item. It is the same observation as button
pressed states, the chevron that never rotates, the ripple being off by default, and the toast
that gives no sense of time. **The library's motion and feedback story is opt-in and incomplete,
and it degrades to nothing rather than to something.**

That is worth its own plan rather than a scattering of fixes, and it has one hard constraint the
current code already gets wrong in one place: **reduced motion must remove the animation, not the
information.** The chevron that never moves and the toast with no remaining-time cue are both
that mistake. The ripple genuinely is decoration and is right to disappear; a chevron pointing
the wrong way is not decoration.
