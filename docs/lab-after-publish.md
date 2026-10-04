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
- **A new Stepper page**, in the D6 shape: every state at once in both orientations, the sizes, a
  flow a reader can walk (the app marking steps complete, with `linear` on and off), RTL, and the
  narrow-container case answered by `orientation="vertical"`. Accessibility: `aria-current="step"`,
  the state words and their labels (`stepCompleted`, `stepError`, `stepOptional`, `stepper`), and
  why an unreachable step is text rather than a disabled button. Route, navigation (Layout &
  Navigation), SEO, sitemap, Global Config note and labels list, generator catalogue and gallery,
  token reference; `theme-starter.css` regenerated.
- **A new File upload page**, in the D6 shape: states and sizes, validation (`accept`, `maxSize`,
  `maxFiles` and `gogReject`, with the point that a drop bypasses the native `accept`), `multiple`
  off replacing the file, forms with `errorDisplay="auto"`, and accessibility (the input as the
  control, the live region, focus after a removal). Route, navigation (Forms & Inputs), SEO,
  sitemap, Global Config note and labels list (five keys), generator catalogue and gallery, token
  reference; `theme-starter.css` regenerated.
- **A new Rating page**, in the D6 shape: states and sizes (interactive and read-only side by side),
  read-only with fractional values drawn to the nearest half, choosing with `[(value)]`, `max` and
  `clearable` (a press or Space on the chosen star clears it), forms with `errorDisplay="auto"`, and
  accessibility (a radio group with each star named; read-only, one image named by the score).
  Route, navigation (Forms & Inputs), SEO, sitemap, Global Config note and labels list (two keys,
  `ratingStar` and `ratingValue`), generator catalogue and gallery, token reference;
  `theme-starter.css` regenerated.
- **A new Empty state page**, in the D6 shape: anatomy and sizes, the media and actions slots,
  the empty state as an answer (a live search that matches nothing, the last item removed), and
  accessibility (the polite region mounted empty and re-filled on every change, `live="off"` for
  one the page loads with, `headingLevel`). Route, navigation (Display & Feedback), SEO, sitemap,
  generator catalogue and gallery, token reference; `theme-starter.css` regenerated. No labels:
  every word in it is the app's.
- **Consider using it in the lab itself**: a doc page under `/components/` is two levels deep and
  has no trail. Not required — decide by looking.
- **Counts**: 33 components becomes 38 on the comparison page, the FAQ and `nav-data.ts`; the
  whole-library bundle row is a re-measurement, not an edit.
