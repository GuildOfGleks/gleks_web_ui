# `gleks-ui-lab` — what to update after each publish

`gleks-ui-lab` resolves `@guildofgleks/ui` from the **published npm package**, on purpose: its
examples have to reflect what a consumer can install today, not an unreleased local build. That
rule (see `gleks-ui-library.instructions.md` step 7) means lab edits are always _deferred_ —
work lands in the library first, and the lab catches up only once the version carrying it is
actually on npm.

This file is that backlog, and the rule that feeds it is in
`.github/instructions/agent-workflow.instructions.md`: a library change touches the library and
`ui-showcase`, and everything the lab will need lands here instead.

**It is a live checklist, not an archive. Delete each entry the moment it is actually done in
the lab** — do not tick it, strike it through, or move it to a "done" section. An entry that
outlives the work sends the next reader to re-verify something already correct, and a file that
does that twice stops being trusted. What is left in here is exactly the lab's outstanding
debt, and it should reach zero after each release is documented; when a whole section empties,
delete the section too.

---

## 21.20.0

- **Fields are narrower at the sides** (CHANGELOG 21.20.0, _Changed_): every text field's horizontal
  padding equals its vertical now. Regenerate `theme-starter.css` (`check:theme-starter` fails until
  then), re-read the token reference's `--gog-field-*-padding-x` and `--gog-control-padding-x` rows,
  and look at every field page and the theme generator's field tiles in a browser — any lab layout
  that compensated for the old 24px inset is now off by 12px.
- **A new Scheduler page** (`components/scheduler`) — the lab's first page for a component from
  `@guildofgleks/ui/scheduler`. Route in `app.routes.ts`, entries in `nav-data.ts`, `seo-data.ts`
  and the Components overview, examples under `src/app/examples/scheduler/` (one per page section,
  one page per commit — `docs/lab-stackblitz-plan.md`). Source of truth: `AGENTS.md`'s
  `gog-scheduler<T>` section and `docs/scheduler.md`. **Demo events must be built around today**,
  and in the locale's week — the showcase's first draft anchored on Monday and drew nothing on a
  Sunday under `en-US`. Watch the prerender: a page drawn around "now" is rendered at build time
  and hydrated later, so give prerendered examples a fixed `date` and `timeZone`, as
  `check:install`'s `SMOKE` page does.
- **Breadcrumbs page**: the array form first — `[items]`, the three accessors, `gogItemClick` with
  the router recipe, `gogBreadcrumbItem` — and `*gogBreadcrumb` after it, as the way to put
  `routerLink` on the element. Source: `AGENTS.md`, `docs/breadcrumbs.md` iteration 2.
- **Two new overlay pages, Popover and Context menu**, from the root — route, nav, SEO and
  overview entries as for any page, sourced from `AGENTS.md` and `docs/popover-and-context-menu.md`.
  The Menu page gains `openAt()` in its methods list. The Context menu page says a long press opens
  it on touch (iOS included) and that the release's click is swallowed. The Breadcrumbs page's
  router example leaves a Ctrl/Cmd/Shift/Alt click to the browser, as `AGENTS.md`'s does.
- **The Scheduler page also covers iteration 2** (`docs/scheduler.md`): bars across the week,
  `monthEventLimit`/`moreEventsAction`/`readonly` and the `GOG_CONFIG.scheduler` key, "+N more" in
  a popover, and an editable demo that applies `gogEventCreate`/`Delete`/`Change` to its own array.
  The Global Config page gets the `scheduler` key and the eight editing labels.
- **The Scheduler page also covers iteration 4** (`docs/scheduler.md`): `view: 'agenda'` and
  `agendaDays`, with a demo; `loading`, with a demo that loads on `gogRangeChange` (the showcase's
  900ms one is the model); drag-and-drop in the editing demo's prose — mouse and pen only, and why
  touch keeps the menu, which a long press opens on iOS too. Inputs table: `agendaDays`, `loading`,
  `views` defaulting to all four. Global Config page: `agendaView`, `noEvents`, `loadingEvents`.
  Token reference: the six new `--gog-scheduler-*` tokens.
- **Every place that describes the entry points**, rewritten for the per-component subpaths
  (`docs/component-entry-points.md`): four components are on their own entry point only (`/table`,
  `/datepicker`, `/dialog`, `/scheduler`), and **every other component, plus `/config`, `/date`,
  `/dropdown`, `/tokens`, `/theme` and `/ripple`, is on its own subpath and re-exported by the
  root**. The point the pages must make: an app now splits by route whichever path it imports from
  (the admin app: 143.5 → 116.6 kB initial transfer, no change to the app). Places: the Getting
  started / installation imports, the FAQ (`faq-data.ts` — any answer that says the root is one
  module or that only four components split), the comparison page's code-splitting section
  (`compare-full.md`, from line ~243, and the "root plus the three split entry points" bundling
  recipe near line 100 — the whole-library figure must still bundle every public entry point, now
  48), and each component page's import line where it names the root — optionally showing the
  subpath beside it, from `AGENTS.md`'s _Quick facts_ list. Re-measure the code-splitting
  section's numbers against the published package rather than quoting the admin app's.
- **Progressbar page**: `animation` (`'none' | 'stripes' | 'shimmer'`) in the inputs table, a demo
  of both (and of both under reduced motion: stripes stop, the shimmer goes), and the five new
  tokens in the token reference.
- **Datepicker and Calendar pages**: `timeZone` in both inputs tables and on the Global Config page
  (`GOG_CONFIG.datepicker.timeZone`), with a demo of one `Date` in two or three zones; the
  `gogToZonedTime`/`gogFromZonedTime` helpers where the date helpers are listed. Source:
  `docs/time-zone.md` and `AGENTS.md`'s _Time zone_ paragraph.
- **Global Config page**: the eight new `labels` fields (`previousPeriod`, `nextPeriod`,
  `schedulerViews`, `monthView`, `weekView`, `dayView`, `allDay`, `moreEvents`), and that
  `GOG_CONFIG.datepicker`'s `locale`, `firstDayOfWeek` and `timeZone` reach `gog-scheduler`.
- **Token reference** (hand-maintained, `token-reference-data.ts`): the `Scheduler` group and the
  progressbar's five; check every row against the installed package's `TOKENS.md`.
- **`theme-starter.css`**: regenerate — `check:theme-starter` fails until it is.
- **Comparison page**: re-measure this library's column; the scheduler is a new entry point, so
  the whole-library figure moves.

---

## Checking your work

`npm run check:app-contrast` — WCAG AA for both apps' **own** chrome, in all 11 themes. The lab
half resolves against the palettes of the _installed_ package, which is what the site renders
with; the showcase half against the workspace, which is why it catches a palette problem one
release earlier. `check:contrast` covers neither: it measures the library. Added 2026-09-03, when
it found the lab's sidebar hover label and two `code` chips under AA.

`npm run build:lab` (the wrapper — the raw `ng build gleks-ui-lab` never exits; see
`running-commands.instructions.md`). After a publish, `npm install` at the repo root first, so
`node_modules/@guildofgleks/ui` is the new version rather than a stale one or a leftover local
build.
