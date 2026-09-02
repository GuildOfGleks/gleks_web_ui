# Backlog

**Everything known to be worth doing and not yet done.** One file, so there is one place to
look — this used to be a section two thirds of the way down a 1000-line plan document, where it
stopped being found.

The project's rule for what comes off the list first: **fixes and polish of what already ships,
before anything new.** A defect is something a consumer is hitting today; an unbuilt component is
only an absence. Nothing here is scheduled — the order is decided per session.

`docs/hardening-21.5.0.md` holds the write-ups of everything already closed, including the
measurements and the hypotheses that turned out to be wrong. That history is worth keeping and is
not worth carrying here.

---

## Defects — first

**One open, found 2026-09-02.** `shared/config.ts`'s own `GogGlobalConfig` JSDoc — the "Applies
to …" sentence on each key, which is the closest thing the library has to a source of truth for
which components read which config — is incomplete in four places, verified by grepping every
`globalConfig.<key>?.<field>` read across the library plus the templates that actually consume
each derived value (not just the ones that inherit it): `control.size`'s list omits
`gog-button-toggle`, `gog-toggle`, `gog-datepicker` and `gog-autocomplete` (all four genuinely
read it); `control.errorDisplay`'s list omits `gog-datepicker` and `gog-autocomplete`;
`dropdown.appendToBody`/`dropdown.direction`'s list ("gog-select and gog-multiselect") omits
`gog-datepicker` and `gog-autocomplete` — both read the same pair from `GogDropdownBase`, and
`autocomplete.component.html` genuinely branches on `resolvedAppendToBody()` for its portal;
`floatLabel` and `control.clearable`'s lists both omit `gog-datepicker` and `gog-autocomplete`
for the same reason. **`dropdown.filter`/`filterPosition` is not one of the gaps** — `gog-select`
and `gog-multiselect` both reference `resolvedFilter()`/`filterQuery()` in their templates,
`gog-autocomplete`'s template references neither, so config.ts's narrower "gog-select and
gog-multiselect" claim is correct for that specific pair alone, unlike the others. Found while
building `gleks-ui-lab`'s per-component "Global Configuration" section
(`docs/feedback-triage.md` item 8), which needed an accurate source before it could quote one —
the lab documents the corrected, code-verified list rather than the comment as it stands. Fix is
JSDoc-only, no behavior change: widen the four "Applies to" sentences in `config.ts`. A library
session, not this lab one — see `CLAUDE.md` rule 3.

**What was here, and what closing it cost.** Nine WCAG AA failures across five shipped theme
palettes, found by `docs/themes.md` iteration 2's `npm run check:contrast`. All nine are fixed,
and `check:contrast` is now a CI step — which is the part worth keeping: the script was
deliberately kept out of CI while any finding was open, because a permanently red step over a
known, tracked condition teaches everyone to ignore CI. Wiring it in was the reward for getting
to zero, not a separate task.

The fixes are recorded in `scripts/check-contrast.mjs`'s header and in each preset's own
comments. One decision inside them is worth restating here, because it traded away something
real: **`one-dark` and `one-light` reproduce a named third-party editor palette, and this
changed their colours.** `#5c6370` is One Dark's own comment colour — correct for code a reader
skims past, 2.32:1 against its own background, and well under AA for UI text a reader has to
act on. Fidelity lost to legibility, on the user's explicit call.

**Three of the nine were on a pair the script did not have** until the same day:
`accentText`/`accentBright`, the filled button's label against its _hover_ fill. In most themes
the hover colour is lighter than the accent, so white on it is strictly worse than the rest
state — the check had been measuring the easier of the two states. It caught a failure in
`slate`, which passed every pair the script previously had. If a future pair looks like it
"obviously passes because the related one does", that is the shape of this bug.

## Gaps — capability the library does not have

Each is additive: nothing here breaks an existing consumer, and none blocks another.

- **Missing components**, in rough order of how often a real site wants them: `alert`/`banner` (a
  persistent in-flow message — `gog-toast` is transient and cannot serve this), `avatar`,
  `breadcrumbs`, `stepper`, `file upload`, `rating`, `empty state`. Each is additive and
  independent; none blocks anything else. **`card` and `gog-panel` came off this list in 21.6.1**
  — see `docs/panel-card.md`. `empty state` is the next one with a plan waiting to be written, and
  that plan is the same argument as the card's: it has to own something a class cannot.

  When you write that plan, `panel-card.md`'s _Iteration 4, as it finished_ is the shape to copy:
  the card/panel split earned itself when the one showcase block in 250 that refused to become a
  `gog-panel` turned out to be exactly what `gog-card` was for. An `empty state` that cannot
  survive the same question — what does it own that a `<div>` and a class do not — is not ready.

- **`gog-table`'s ceiling:** no column resize or reorder, no sticky columns, no expandable rows,
  no grouping. Possibly the right boundary for a lightweight library — but state it in the README
  rather than letting someone discover it mid-project.

- **Virtualization.** Nothing in the library virtualizes: a 10 000-option `gog-select` and a
  10 000-row eager `gog-table` will both crawl. `gog-autocomplete`'s `gogLoadMore` covers the
  fetch half of the problem; `lazy` covers it for the table. The DOM half needs a windowing
  primitive, which is a genuine piece of engineering and its own plan.

  **Requested twice.** Items 3 and 4 under _Features_ below are this same primitive, filed
  separately from use. Build it once in `lib/shared` and adopt it in the dropdowns first — a fixed
  row height — before the table, which has variable rows, a sticky header and a selection column.

---

## Rough edges — small, and each has a reason it was left

Carried over from `consumer-dx-plan.md`'s backlog, which was the project's second live list until
2026-08-23. Not defects: each is a known wart with a stated reason for living with it, and the
reason may stop holding.

- **The lab's bundle budget has 4 kB of headroom, and that is why it was raised.**
  `gleks-ui-lab`'s initial bundle is 1003.85 kB against a `maximumError` that had to go from 1MB
  to 1.1MB (Angular reads 1MB as 1000 kB). Checked before accepting it: the heavy dependencies
  are already imported narrowly — FontAwesome icon by icon, `highlight.js` language by language
  — so there is no easy win sitting there, and the size is what an Angular SSR app with `marked`,
  `highlight.js` and FontAwesome costs. Not a release concern (the lab is not published), but the
  next thing added to the lab's initial bundle will fail the build, and the fix will have to be a
  real one: lazy-load the syntax highlighter, or move the docs renderer off the initial route.

- **`theme.css` payload.** Loaded whole even by an app importing three components — **106 521 B /
  20 227 B gzip in 21.6.1** (measured 2026-08-26), up from 99 492 B / 19 070 B at 21.6.0 and from
  the 92 596 B / 16 817 B this was filed against. 21.6.1's +7.1 % raw / +6.1 % gzip is `gog-card`,
  `gog-panel` and the ripple's tokens; it is the second consecutive release to add ~6–7 %.
  Splitting per component would break the "one stylesheet, one import" setup story, and 20 KB gzip
  still does not justify that trade — but this entry now has three data points trending one way,
  so the next component-shaped release is the point to re-argue it rather than re-measure it. The
  bench in `gleks-ui-lab/public/docs/compare-full.md` tracks the published figure.

  Note `themes.md` iteration 1 pulls the other way and is the cheaper lever: 510 of 1127 component
  token declarations are literals, and a character layer replaces per-component literals with
  inherited foundation tokens. Doing that first may make this entry moot.

---

## Structural — each needs its own deprecation cycle

Not defects, and not cheap: both change a consumer's import paths or public surface, so neither
can land without an announced removal window.

- **Incidental public exports.** `public-api.ts` re-exports two helper modules wholesale
  (`export * from './lib/components/datepicker/date-utils'` and `'./lib/shared/option-accessor'`),
  which puts ~20 free functions in the package's `.d.ts` — `buildMonthGrid`, `clampDate`,
  `withTime`, `getByPath`, `readOption`, `isSameOptionValue`, `defaultCompare`, … Some are
  deliberate (`AGENTS.md` advertises `formatDate`/`parseDate` and "a family of date-math helpers");
  the rest are along for the ride because the module also exports a type the public API needs
  (`GogDateRange`, `GogOptionAccessor`). Counted 2026-08-15. Nothing is broken by it, but every one
  is API someone can depend on and nobody decided to support, so the fix is a named export list —
  which is a breaking change and therefore needs its own deprecation window, not a slot in 21.5.0.

- **Secondary entry points** (`@guildofgleks/ui/select`, …). Filed twice — `consumer-dx-plan.md`
  had it as build ergonomics rather than bytes, which is the same conclusion from the other end.
  Raised by the paginator's dependency
  on `gog-select`: ng-packagr flattens everything into one FESM, so `@defer` inside the library
  produces no code-split (measured — see `consumer-dx-plan.md` iteration 6's follow-ups). Entry
  points are the only real fix, and they change every consumer's import paths, so they need their
  own deprecation cycle and their own decision.

---

## Features — each needs its own decision

Filed from use on 2026-08-16, none started unless noted. **Not one release's worth.** Numbering is
the original filing's, kept so the request stays recognisable; item 1 was a bug and is closed. Item
2 is closed too, found while surveying this list on 2026-08-28: `gog-multiselect` and `gog-select`
both extend `GogDropdownBase`, which already declares `filter`, `filterPosition` and `filterMatch`;
both templates already wire up `filterQuery()`/`filterPlaceholder()`/`filterEmptyMessage()` in
full, and `AGENTS.md`'s config table already listed both components under `filter`/`filterPosition`
— the filing's own closing line ("the gap may be smaller than it looks") turned out to be the whole
story. Confirmed live: a filter box opened and typed into on the multiselect page in `ui-showcase`. 3. **Virtual scrolling in `gog-select` and `gog-multiselect`.** 4. **Virtual scrolling in `gog-table`.**

3 and 4 are the same primitive twice, and the same one as _Virtualization_ under **Gaps**
above — which already says the DOM half of large-list performance "needs a windowing
primitive, which is a genuine piece of engineering and its own plan". That is this. Build it
once, in `lib/shared`, and adopt it in the dropdowns first (a fixed row height) before the
table (variable rows, sticky header, selection column). Do not start it as a table feature.

5. **A time zone setting for datepicker and calendar in `GOG_CONFIG`.** Today
   `GOG_CONFIG.datepicker` carries `locale` and `firstDayOfWeek`. Note the library is deliberately
   native-`Date`-only with no adapter, and `Date` has no time zone — so this is a design decision
   about what a zone even means here (formatting only? parsing too? `Intl.DateTimeFormat`'s
   `timeZone` option?), not a config key to add. Write the decision down before the code.
6. **More icons.** Cheap per icon, but it is the registry's size and the tree-shaking story that
   matter — check what `provideGogIcons` costs a consumer who wants three of them before growing
   the built-in set.
7. **More `gog-progressbar` variants (animations).** Smallest of the features; a good warm-up.

---

## What is not here

- **The lab's deferred work** lives in `docs/lab-after-publish.md`, because it is keyed to
  releases rather than to effort: the docs site tracks the published package, so its debt is
  always "what to change once version X ships".
- **Planned work that already has a design** has its own document — `docs/panel-card.md`,
  `docs/ripple.md`, `docs/themes.md`. A plan is not a backlog item; it is a decision
  already taken about how something gets built.
- **Anything closed.** An entry that outlives its work sends the next reader to re-verify
  something already correct.
