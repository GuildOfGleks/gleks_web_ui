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

**Both halves of that turned out to be wrong in the same way, and 21.7.1 corrected them —
read the shipped `theme.css` header, not this paragraph.** A flat declaration *above* a mixed
one does not fall back for a **custom property**: the property is validated when it is
substituted, not when it is parsed, so the unsupported declaration still wins and `var()` on it
resolves to nothing. `@supports` is the only mechanism that gates a custom property on feature
support, and that is what shipped. And the `browserslist` was added and then removed again
(`aec38ac`): the floor it stated was *below* Angular's own, so every build printed "unsupported
browsers" warnings. Angular's baseline is the policy; the interesting fact is that Firefox 112
is inside that baseline and has no `color-mix()`, which is what makes the fallbacks
load-bearing rather than a courtesy. **Do not restore a `browserslist` from the sentence above.**

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

**Shipped in 21.8.1 as `horizontalWheel`, opt-in.** The trap this entry named turned out to be
the feature rather than an obstacle to it: the condition "there is room left in the direction of
the turn" is what makes it safe, because at the content's end the event is left alone and the
page picks it up. Intercepting unconditionally would have made the wheel go dead over a
scrolled-to-the-end row — a worse bug than the one being fixed, and the reason this could not be
a two-line handler. Three more conditions came out of building it, none of them in this entry: a
horizontal delta is already correct (a trackpad swipe, `Shift`+wheel), `ctrlKey` is pinch-zoom,
and the vertical check has to read live geometry rather than the `axis` input, or `axis="both"`
stops scrolling down. Firefox's line-mode delta needed scaling too, which is the classic version
of this bug — three pixels per notch instead of three lines.

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
| 2   | ~~`gog-button` pressed state~~ **done, 21.8.1**  | Shipped as the `:active` colour, per variant, plus the eight other pressable surfaces. The `aria-pressed` toggle *look* shipped in the same release — an inset ring, `--gog-button-<variant>-toggled-shadow` — so it is closed too; what is still open is the same gap on `gog-chip`, see `docs/backlog.md` | S–M  |
| 3   | Input masking (phone, barcode, …)                | **Needs a plan before code** — see below                            | L    |
| 4   | ~~Horizontal wheel handling in `gog-scroll`~~ **done, 21.8.1** | Shipped as `horizontalWheel`, opt-in. The scroll-chaining trap is handled by the condition that turned out to be the feature's core: at the content's end the event is left alone, so the wheel never goes dead. Also skipped for a horizontal delta, for `ctrlKey`, and whenever the viewport can still scroll vertically | M    |
| 5   | Whole-row click when `gog-table` selection is on | Behaviour change on an existing input; conflicts with `gogRowClick` | M    |

**On the mask (item 3), the reporter already asked the right question** — extend `gog-inputfield`
or build a new component? That is exactly the question `panel-card.md` answered for the card, and
its test applies here: _what does it own that an input and a directive do not?_ My read is that a
mask is a value transform, not a control — so it wants to be a directive (`gogMask`) that works
on `gog-inputfield` **and** on a consumer's own `<input>`, the same argument that made
`[gogButton]` a directive. But that is a plan to write, not a conclusion to act on.

**Estimate: one session per item, plus one for the mask plan.** Four items, not five, since
2026-09-03.

---

## The lab — after 21.7.0 is published — ✅ all done (2026-09-02)

All 11 LAB items, plus Q2. Added to `docs/lab-after-publish.md`, which is where lab work already
queues. **Q1 and Q3 turned out not to belong here** — Q1 didn't reproduce, and Q3 was a library
bug fixed directly in `@gleks/ui` (see both rows below); neither needed a `gleks-ui-lab` edit.

| #   | Item                                                                                       | Size     | Note                                                                |
| --- | ------------------------------------------------------------------------------------------ | -------- | ------------------------------------------------------------------- |
| 1   | No horizontal scroll on code blocks on phones                                              | **done** | **Fixed 2026-08-30.** Root cause: `gog-scroll`'s `axis` input defaults to `'vertical'`, and neither `code-tabs.html`'s template nor `markdown.ts`'s dynamically-mounted instance ever set it — so `viewportOverflowX()` deliberately left horizontal `overflow: visible` (gog-scroll's documented behaviour for an axis nobody asked for), and long lines spilled out unclipped and unscrollable instead of wrapping in a scrollbar. Not a library bug: `gog-scroll` did exactly what it was told. Both call sites now pass `axis="both"`, matching `.code-block__scroll`'s existing `max-height` (which already implied vertical scroll was wanted too). Verified live: forced a narrow `.content-container` and confirmed via `ng.getComponent()` that `showTrackH()` flips to `true` and a horizontal thumb renders. |
| 2   | Expose `AGENTS.md` for reading/download                                                    | **done** | **Fixed 2026-08-31.** New `general/agents` page, mirroring `releases-page`'s pattern for `CHANGELOG.md`: `AGENTS.md` copied out of `node_modules/@guildofgleks/ui` at build time (new asset glob in `angular.json`), fetched and rendered live so it can never drift from the installed version, plus a `[gogButton]` "Download AGENTS.md" link to the same served file. Added to `GENERAL_NAV_ITEMS` (picked up by the sitemap generator automatically) and linked from Getting Started's "Building with an AI agent" section, which previously only named an inaccessible `node_modules` path. |
| 3   | Russian labels in the global-config example                                                | **done** | Fixed 2026-08-29 in the repo copy; the lab picks it up on publish   |
| 4   | Theme generator missing component examples                                                 | **done** | **Fixed 2026-08-31.** Six components had no tile in the gallery and no entry in the "fine-tune a single component" dropdown: Card, Collapsible, Menu, Panel, Ripple, Scroll — all present in the sidebar's 34, none in `generator-catalog.ts`'s 27. Added all six (`--gog-card-*`/`--gog-collapsible-*`/`--gog-menu-*`/`--gog-panel-*`/`--gog-ripple-*`/`--gog-scroll-*`), alphabetically, matching every existing tile's minimal-markup pattern — Menu and Ripple need a click to show anything, the same way the existing Dialog tile does. Verified live: all 33 tiles render themed, Menu's portal opens with the current palette, Scroll's thumb is visible via `[autoHide]="false"`. **Completed 2026-09-01:** a 34th, Text Area, which had been invisible in a different way — its nine `--gog-textarea-*` tokens were listed under Input Field, so they were editable but nothing in the gallery rendered a `gog-textarea` to show the edit. It is now its own entry (Input Field keeps `--gog-input-*`, the block both components render) with its own tile, and the generator's list finally matches the sidebar's 34. The same pass removed a duplicated `'--gog-multiselect-'` in that entry's `prefixes` and the comment above it, which still claimed `--gog-ms-*` resolved "until the old name is removed in 21.5.0" — a find-and-replace leftover from the 21.5.0 rename, harmless only because `extractTokenNames` dedupes through a `Set`. |
| 5   | "Full technical comparison" is stale                                                       | **done (2026-09-02)** | 2026-08-31 was a targeted fix (the "154 deprecated" claim, wrong once 21.7.0 shipped) with the byte/bundle re-measurement deliberately deferred. That measurement is now done: full bench re-run against `@guildofgleks/ui@21.7.2`, `@angular/material`+`@angular/cdk@22.1.5` and `primeng@22.1.0` — real `npm install` in 3 isolated folders, `esbuild`, `zlib` gzip. Two real deltas, not just refreshed numbers: this library's own gzip size *dropped* (113.6→112.8 KB) because 21.7.0 emptied the 154-entry `GOG_DEPRECATIONS` manifest while that release's other work is pure CSS; and PrimeNG's `@primeui/license-manager` no longer pulls `@noble/ed25519`/`@noble/hashes` into the install tree (verified by reading its own `package.json` — both moved to `devDependencies`), so PrimeNG's "packages added" count corrects from 13 to 11 rather than carrying the old crypto-stack claim forward. Also refreshed: PrimeNG's component-selector count (187→240), the token count (1289→1312, from the published `TOKENS.md`), and the short `/general/compare` page's three duplicated figures. Verified live on both `/general/compare` and `/general/compare-full`. |
| 6   | FAQ is stale                                                                               | **done** | **Fixed 2026-08-31.** Two answers were wrong, not just dated. "Is right-to-left supported?" said "Not yet — treat it as unsupported, a full pass is planned" — RTL shipped in 21.5.0 (`docs/hardening-21.5.0.md`) with its own live `/general/rtl` page; rewritten to describe what actually ships (logical properties everywhere, portaled panels' scoped `dir`, the two deliberately-physical APIs) and link there. "What's deprecated right now?" still described the three abbreviated CSS prefixes as "nothing breaks yet... they come out in 21.7.0" — 21.7.0 already shipped and removed them; rewritten past tense. This was also `docs/lab-after-publish.md`'s queued "removal's prose goes stale" item — its `theming-page.html` half needed no edit (already computed live off `GOG_DEPRECATIONS`, which is `[]`, so the stale block just stopped rendering on its own); deleted the now-empty section from that file. |
| 7   | Full-width examples need a dashed outline to show the container                            | **done** | **Fixed 2026-08-31, corrected 2026-09-01.** `paginator-doc-page` already had the pattern (`border: 1px dashed var(--gog-border-color)` on its comparison box); nine other pages did not. The first pass put it on `.width-demo` on all nine, which was right on only four of them: on **button, checkbox, chip and tag** `.width-demo` *is* the full-width demo's box (one use each, and the prose already says "wrapped here in a narrower box to show it"). On **input field, multiselect, select, slider and textarea** it is the page's generic narrow column for field demos — 3 to 6 uses each — so every field demo got a dashed frame while the one demo actually about container width ("Auto width" / "Full width", which uses `.demo-card__preview` or `.field-row`) got none. Those five now carry a separate `.container-demo` instead, on the width demo only, and each demo's prose names the outline the way `paginator-doc-page`'s does. `align-self: stretch` is part of it: `.demo-card__preview` centres its children, and a frame that shrink-wraps the control inside it shows no container at all. Pages where `fullWidth` only shows up in an API table, or where the demo already fills its natural container (toggle's settings-list row, table's `fullWidth=false` shrink demo), needed nothing. Verified live on all six changed pages. |
| 8   | Per-page "global config for this component" section, or a note saying there is none        | **done** | **Fixed 2026-09-02.** New `GlobalConfigNote` shared component, one insertion point (between API Reference and Styling/Style tokens) on all 34 pages. Its data table isn't transcribed from `@guildofgleks/ui`'s own `config.ts` JSDoc — verifying that first (grepping every `globalConfig.<key>` read, cross-checked against each reading component's own template) found the JSDoc's "Applies to …" sentences incomplete in four places (`control.size`, `control.errorDisplay`, `dropdown.appendToBody`/`direction`, `floatLabel`/`control.clearable` all omit `gog-datepicker` and/or `gog-autocomplete`, which read them through the same shared base classes as the components the comment does name). Filed as a defect in `docs/backlog.md` for a future library session — JSDoc-only, out of scope for this lab one. Verified live against three shapes: a component with many entries, one with none, and the one hand-written note (`gog-ripple`'s "not covered" caveat). |
| 9   | Header search over component names and keywords                                            | **done** | **Fixed 2026-09-02.** `search-index.ts` flattens `NAV_SECTIONS` and reuses each page's existing SEO description as its keyword text, so no hand-maintained keyword list. Icon button + panel beside the other two header toggles; label matches rank before keyword matches; arrow keys move through results, Enter navigates. Verified live: "modal" finds Dialog by keyword alone. |
| 10  | RTL toggle in the header next to the theme switcher                                        | **done** | **Fixed 2026-09-02.** Scoped `[attr.dir]` to `.content-container`, not `<html>`: the library mirrors through logical CSS properties, but the lab's own chrome (header, both sidebars) is physical left/right and was never part of the RTL story — flipping the whole document would break the chrome instead of demonstrating the library, the same choice the Right-to-left doc page's own demo already makes on a smaller region. New ghost `gog-button` (accent-colored while active) beside the palette switcher. Verified live on `/components/checkbox`: label and box swap sides, header and sidebars stay put. |
| 11  | Accordion loading example broken                                                           | **done** | **Fixed 2026-09-01, and it was the lab, not the library.** With `loading` on, the accordion shrank to a ~55px column in the middle of the card. Cause: `.demo-card__preview`'s centring rule in `styles.scss` (`align-items: center`) sizes a block-level flex item to its content, and a loading accordion's content is skeleton placeholders with no intrinsic width — the text that sizes it in every other state is exactly what `loading` removes. The demo's accordion now sets `align-self: stretch`, which fixes both states at once, so the demo no longer changes width when the toggle is pressed. Library item 8 (the skeleton's own contrast against the header strip) shipped separately in 21.7.1 and is unrelated. |
| Q1  | `gog-menu` portal draws over the footer; menu forced downward                              | —        | **Closed, not reproduced (2026-08-30).** Tested live against published 21.7.1 in `gleks-ui-lab`: both `gog-select` (20-option panel) and `gog-menu` (`longMenu`, the branch list) flip **up** correctly when placed just above the lab's real footer, at desktop width. The footer sits in normal flow with no `z-index` of its own, so a panel that *did* open down would legitimately paint over it — `--gog-dropdown-z: 300` versus the footer's `auto` is by design, not a bug. Not reproduced at desktop width; narrower/mobile layouts untested. |
| Q2  | Checkbox `indeterminate` example reads right-to-left                                       | **done** | **Fixed 2026-09-01. Same root cause as row 11 — not the component, and nothing to do with RTL.** A select-all is a hierarchy read off the left edge; `.demo-card__preview` centres each row on its own text, so the parent checkbox sat to the *right* of the three it governs, and `.checkbox-doc__group` had no styles at all — no indent, no left edge. The preview now carries a second class (which takes it out of that rule), left-aligns its contents, and indents the group under the parent's label by `calc(var(--gog-control-checkbox-box-size-md) + var(--gog-space-sm))` — logical, so it indents from the other side under `dir="rtl"`. |
| Q3  | Multiselect `+N` chip sits above the text baseline                                         | **done** | **Fixed 2026-08-30**, library + `ui-showcase` (not yet published). Root cause: `.gog-ms` centers children by box height (`align-items: center`), and the `+N` badge's smaller font-size (14px vs. the value's 16px) put its visual center above the value text's baseline. Added `align-self: baseline` to `.gog-ms__value` and `.gog-ms__overflow` (not to `.gog-ms__actions`, which stays box-centered for its icons). New "Overflow summary" example added to the multiselect showcase page to keep it reproducible. |
| +   | Padding at the bottom of the component list, so the browser's status bar does not cover it | **done** | **Fixed 2026-09-01.** `.nav-scroll .nav-list` gains `calc(24px + env(safe-area-inset-bottom, 0px))`. On the scrolled content rather than on `.nav-scroll`: `gog-scroll` measures its host to size the viewport and thumb, so padding there would move the scrollbar, not the last row. |

**All items in this table are done as of 2026-09-02.** The lab-side worklist from the 21.6.1
hands-on pass is closed; what remains on the project is the 21.8.0 new-API items in the section
above, tracked separately.

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
