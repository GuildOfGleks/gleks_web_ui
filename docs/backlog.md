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

Nothing open. **Four closed 2026-08-28, all the same family** — a `var(--gog-…)` with no fallback
naming a property nothing declares, which makes the token holding it guaranteed-invalid so the
declaration reading it computes to nothing, silently, in every consumer. Three were found while
surveying 21.7.0's token-prefix removal (`gog-multiselect`'s focus glow had never rendered; the
filter box inside both `gog-select` and `gog-multiselect` had no border and the wrong text colour)
and fixed the same day as iteration 0 of `docs/token-prefix-removal.md`, which has the full detail
and the before/after browser verification. The fourth, closed earlier that day, was the one that
led to finding the other three: `gog-multiselect`'s JS-computed panel height reading token names
(`--gog-ms-*`) that `theme.css` never declares, silently falling back to `0` for the option gap
and options padding on every open since the 21.5.0 rename. Fixed in `multiselect.component.ts`,
its four `GogDropdownBase` token overrides now spell out `--gog-multiselect-*`, matching the
pattern `select.component.ts` already used correctly. Covered by a regression test in
`multiselect.component.spec.ts` (forces `dropdownDirection="up"` with a huge available space so
the rendered `max-height` is a direct readout of which token name was read) and confirmed in a
real browser against `ui-showcase` — `getComputedStyle` on a live
`gog-multiselect` showed the new names resolving to `4px`/`4px`/`260px`/`40px` and the old names
resolving to `''`, exactly as diagnosed.

---

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
- **`(click)` vs `(gogClick)` on `gog-button`.** A native click bubbles from the inner `<button>`
  to the host, so a consumer writing `(click)` silently bypasses the debounce guard. Worth a
  README warning now; a real fix means stopping propagation, which is its own trap.
- **`DIALOG_DATA` typing.** `dialog.tokens.ts` is `InjectionToken<unknown>`, so every dialog
  component casts on injection. A generic `DialogService.open<TData, TResult>()` threading the
  type through would be nicer, but the cast is a one-liner and Material has the same wart.

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

Filed from use on 2026-08-16, none started. **Not one release's worth.** Numbering is the original
filing's, kept so the request stays recognisable; item 1 of the list was a bug and is closed.

2. **A filter box in `gog-multiselect`, matching `gog-select`.** Note the two share
   `GogDropdownBase` and neither declares a `filter` input on its own component class today, so
   check where select's filtering actually lives before assuming it can be lifted across.
   `AGENTS.md` lists `filter`/`filterPosition` under the `dropdown` config group for both, so the
   gap may be smaller than it looks.
3. **Virtual scrolling in `gog-select` and `gog-multiselect`.**
4. **Virtual scrolling in `gog-table`.**

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
