# `gleks-ui-lab` — what to update after each publish

`gleks-ui-lab` resolves `@guildofgleks/ui` from the **published npm package**, on purpose: its
examples have to reflect what a consumer can install today, not an unreleased local build. That
rule (see `gleks-ui-library.instructions.md` step 7) means lab edits are always *deferred* —
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

## 1. After publishing the release that ships `CHANGELOG.md`

The changelog is now listed in `ng-package.json`'s `assets`, so from that release on it exists
at `node_modules/@guildofgleks/ui/CHANGELOG.md`. That unblocks **layer 2 of
`docs/lab-versioning.md`** — a Releases page rendering the notes for the exact version the site
was built against, which is structurally incapable of drifting.

None of this can be done before the release: the file is not in 21.4.1, so the asset glob would
copy nothing and the route would render an empty page.

- **Asset glob** in `angular.json` (`gleks-ui-lab` → `build` → `assets`), the same pattern the
  three stylesheet globs already use:
  `{ "glob": "CHANGELOG.md", "input": "node_modules/@guildofgleks/ui", "output": "docs" }`.
- **A route and page** rendering it with the existing `app-markdown` component — the same one
  behind `public/docs/theming.md`. Fetch it the way `full-library-css.ts` fetches the
  stylesheets (`httpResource.text('/docs/CHANGELOG.md')`), so it is not bundled into the app.
- **Nav entry** in `components/shared/nav-data.ts`, under the General group next to the FAQ.
- **Slugged anchors** on the version headings come free — `markdown-renderer.ts` already slugs
  every heading, so `#21-4-0` works and a component page can link straight to a release.
- **Link the version badge to it.** `app.html`'s badge currently points at the package's npm
  page; the release notes for that exact version are the better destination, and
  `library-version.ts` already exports what it needs.

**The prerequisite this section used to carry is done:** every published version's changelog
heading now carries a real date (21.3.1 — 11.08.2026, 21.3.2 — 13.08.2026, 21.4.0 and 21.4.1 —
14.08.2026, checked 2026-08-15), so the Releases page will not tell readers that shipped releases
are "planned". Only `## [21.5.0] - planned` is undated, which is correct — it has not shipped.

## After the release that caps gog-calendar's width

`gog-calendar`'s host gains `max-width: var(--gog-calendar-max-width)`, default `max-content`,
which also sizes `gog-datepicker [inline]`. Two things to do once it ships:

- **Document the two new tokens** on the Calendar and Datepicker pages' Styling Tokens tables:
  `--gog-calendar-max-width` and `--gog-datepicker-panel-width`. The tables are generated from
  `token-reference-data.ts`, so regenerate rather than hand-editing.
- **Re-check the demo previews on both pages.** The lab centres preview contents from
  `styles.scss`, which is what currently makes those calendars look right; once the component
  caps itself the centring is doing less work, and a preview that looked fine only because of it
  may now read differently. Nothing should break — this is a look-at-it check, not a fix.

## After the release that fixes gog-table stickyHeader

The table page's "Sticky header" demo currently ends its description with a **Known defect in
21.4.2** paragraph explaining that the header rides away because the table's own internal
`gog-scroll` is the nearest scrollport (full diagnosis in `hardening-21.5.0.md`). **Delete that
paragraph** once the fix ships, and check the demo actually holds its header while scrolling —
the demo itself needs no change, it already puts the table in a 260px scrolling wrapper.

Same release, if it also fixes `[fullWidth]="false"` clipping the widest header: the "Full width"
demo states `width` on both columns and the description explains that fixed layout makes it
necessary. Once the component switches to `table-layout: auto` in that mode, drop the widths and
trim the explanation back to what `fullWidth` is for.

---

## Checking your work

`npm run build:lab` (the wrapper — the raw `ng build gleks-ui-lab` never exits; see
`running-commands.instructions.md`). After a publish, `npm install` at the repo root first, so
`node_modules/@guildofgleks/ui` is the new version rather than a stale one or a leftover local
build.
