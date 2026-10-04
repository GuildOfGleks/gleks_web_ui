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

## 21.18.0

- **A new Breadcrumbs page**, in the D6 shape: the five sizes, a trail of `routerLink`s (the lab
  has the router, so the example is the real thing, not `href="#"`), collapsing with `maxItems`,
  `itemsBefore` and `itemsAfter` and the focus rule, `separatorIcon`, `dir="rtl"`, wrapping in a
  narrow container. Accessibility: the landmark and its label, `aria-current` set on your element,
  separators hidden, the `…` button's name, and why the current page is not a link. Route,
  navigation (Layout & Navigation), SEO, sitemap, Global Config note and labels list
  (`breadcrumbs`, `showBreadcrumbs`), theme generator catalogue and gallery, and a Breadcrumbs
  section in the token reference; regenerate `theme-starter.css`.
- **Consider using it in the lab itself**: a doc page under `/components/` is two levels deep and
  has no trail. Not required — decide by looking.
- **Counts**: 33 components becomes 34 on the comparison page, the FAQ and `nav-data.ts`; the
  whole-library bundle row is a re-measurement, not an edit.
