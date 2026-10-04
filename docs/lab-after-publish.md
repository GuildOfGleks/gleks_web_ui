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

## 21.15.1

- **Accordion page: add the "An overlay inside the body" example.** Left out on 2026-10-04 because
  on 21.15.0 a select's list in an open body paints under the code block below the demo — fixed in
  21.15.1 (the settled body's transform, and `contain: layout` on the root). A `Profile` item and a
  `Region` item whose body holds a `gog-select` of time zones, in `layout="wide"`; the prose says
  the body clips only while it animates. Open it in a browser and check the list covers the code block before ticking.
- **Calendar page: say what the small sizes draw in the weekday row.** On 21.15.0 the sizes
  example shows the names running together at `xsm` and `sm`; from 21.15.1 those two sizes draw the
  narrow form (`S M T …`) and every column header is named by the whole day. Add a sentence to the
  sizes card (and the Accessibility section: the column's name is the full day, at every size),
  then look at the five calendars side by side in a browser before ticking.
- **Slider page: the `value` row's last sentence.** It reads "Also driven by Angular Forms … Ignored
  while range is true", which says the form control is ignored in range mode — the claim 21.15.1
  corrected in the library's JSDoc and AGENTS.md. Only the `value` model is ignored; the form
  control carries the `{ start, end }` pair (the `range` row already says so). Reword it to match.
- **Slider page, Accessibility: the pointer-target sentence.** It says range thumbs take the
  pointer "at about 16px, under the 24px WCAG 2.5.8 asks for" — stale since 21.15.0 for horizontal
  sliders, and since 21.15.1 for vertical ones too: each range thumb is a 24x24 target centred on
  the drawn thumb, in both orientations (`--gog-slider-range-target-size`). Rewrite it, and try the
  vertical range demo with a mouse before ticking.
