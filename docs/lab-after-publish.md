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

## 21.19.0

- **Table page**: `ariaLabel` in the inputs table, and a sentence in Accessibility — it names the
  table and, when the columns overflow, the scrolling region that puts it in the tab order.
- **Progressbar, Tabs and Scroll pages**: their accessibility sections say a missing name now warns
  in dev mode (one `console.warn` per component per page), and the lab's own examples of those
  three pass a name, so the site's console stays clean.
- **Skeleton page**: a labelled skeleton is now `role="progressbar"`, like the spinner — its
  accessibility section and any "status" wording change with it.
- **Slider page**: `valueFormat` in the inputs table, and an example — a price range in euros
  whose readout, min/max labels and `aria-valuetext` all come from the one function.
- **Radio Group page**: the three accessors in the inputs table, and an example passing the
  consumer's own objects; drop any wording that says the shape is fixed.
- **Table page**: a `gogTableEmpty` example with a `gog-empty-state` inside, `GogTableEmptyDirective`
  in the import snippet and the slots table, and a link from the Empty State page's answers section.
- **Chip page**: the avatar falls back like `gog-avatar` does — worth one example with a broken
  `avatarUrl` and an `avatarAlt`, showing initials.
- **Icon page**: 136 glyphs now — the gallery reads the installed set, but its prose, the
  page's SEO description ("41 built-in outline icons") and the comparison page's icon count need
  the number.
