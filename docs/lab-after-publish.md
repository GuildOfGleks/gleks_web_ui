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

---

## 21.12.0 — four new tokens, and two visible shapes

Small next to 21.11.0's section below, and it does not replace it: **21.11.0's entries are still
open**, because the lab is deliberately being left alone for now. Work through that section first
— it is the one whose two code entries break silently.

### Four new tokens for the hand-maintained reference

`pages/theming-page/token-reference-data.ts` is hand-maintained and none of these will appear on
their own:

- `--gog-select-panel-radius` and `--gog-multiselect-panel-radius` — the dropdown panel's own
  corner, defaulting to `var(--gog-radius)`. The point worth writing in the description is _why_
  they exist: the panel used to paint the field's radius, so overriding `--gog-select-radius` to
  shape the control also reshaped the overlay. They are separate boxes now. `gog-autocomplete` and
  `gog-datepicker` already had theirs, so if the reference lists those two, this is the pair that
  makes the family complete rather than a new idea.
- `--gog-select-options-padding` and `--gog-select-option-radius` — the gutter around the option
  list and the concentric row corner, matching what `gog-autocomplete` and `gog-multiselect`
  already had.

Nothing existing in that file needs correcting: checked, and no entry for `--gog-select-radius` or
`--gog-multiselect-radius` describes the panel.

### The select's dropdown looks different, and the chip's avatar is a different size

Both are the kind of change that reads as a regression to someone who does not know why, so check
the pages rather than only the token table:

- **The select panel's rows are inset by 4px and rounded to 4px**, where they used to run edge to
  edge with square corners clipped by the panel. The panel is also ~8px wider, since its content
  now carries a gutter. Visible on the Select page at any theme. This is the select catching up
  with the autocomplete and multiselect, not a new look for the library.
- **`gog-chip`'s avatar is `1.5em` at every size** — 16.5 / 18 / 21 / 24 / 27px against the
  14 / 16 / 20 / 24 / 28px it was. `lg` does not move at all; `xsm` grows 2.5px and `slg` shrinks
  1px. If the Chip page shows the five sizes side by side with an avatar, the small end will look
  slightly heavier than it did. The icon is unchanged in every rendered pixel despite its token
  changing to `1em` — do not report it as a diff.
- **`gog-chip`'s remove button is `1.125em` at every size**, the third of the same family. Measured
  live at all five: 12.4 / 13.5 / 15.8 / 18 / 20.3px of glyph type against the 12 / 14 / 16 / 18 /
  20px it was, so `lg` does not move and nothing else moves by more than half a pixel. Almost
  certainly invisible on the Chip page — listed so that a diff of the token table is not mistaken
  for a rendering change.

### The theme generator

`generator-catalog.ts`'s Select entry picks tokens up by prefix (`--gog-select-`), so the three new
select tokens arrive on their own; the multiselect's does too. Worth one look at the Select tile
after publishing to confirm the new panel radius is editable and does what it says — it is the
first select token that changes something _other_ than the field.

### theme-starter.css

Regenerate as always (`npm install` at the root, then `npm run generate:theme-starter`). None of
the four is a foundation token, so unlike 21.11.0's `--gog-text-2xs` there is no hand-written half
here — checked, not assumed: `check:theme-starter` against this tree still reports exactly the one
missing token it reported before this work, and it is `--gog-text-2xs`.

## 21.11.0 — the spacing scale, and the geometry sweep behind it

**This release changes rendered geometry across the whole library and deletes five tokens.** The
lab is the only place that still describes the old scale, and two of the four spots are code
rather than prose, so they break silently rather than read wrongly.

### The scale went from fourteen steps to ten

`--gog-space-2`, `-6`, `-10`, `-14` and `-18` are gone; `--gog-space-40` is new. Every remaining
step is a multiple of 4.

- **`pages/spinner-doc-page/house-spinner-demo.ts:102,109`** — the demo's own CSS reads
  `--gog-space-6` and `--gog-space-2`. Neither token exists after this release, and neither
  declaration has a fallback, so **both gaps silently collapse to nothing.** This is the one entry
  here that is a defect rather than a documentation update. `-6` becomes `-8` and `-2` becomes
  `-4`, following the library's own rounding direction (it rounded up everywhere).
- **`pages/theming-page/token-reference-data.ts:142`** — the hand-maintained token reference still
  reads `--gog-space-2 … --gog-space-48` and calls it "the 14-step scale". It is ten steps: 4, 8,
  12, 16, 20, 24, 28, 32, 40, 48. The five named aliases below it are unchanged and still correct.
- **`pages/theme-generator-page/theme-generator-page.html:25`** — "the fourteen-step spacing
  scale", twice in one paragraph.
- **`pages/theme-generator-page/foundation-tokens.ts:107`** — the comment explaining why the scale
  is not a field names `--gog-space-2` as the range's lower bound.
- **`public/docs/styles/theme-starter.css`** — half generated, and the generator does **not** fix
  it on its own. Run `npm install` at the root, then `npm run generate:theme-starter`; that
  rewrites the derived-layer block between the two markers, but the check reports a second
  finding it cannot touch: **`--gog-text-2xs` is declared in `theme.css` and missing from the
  starter's hand-written head**, so it has to be added by hand next to the rest of the type
  scale. `npm run check:theme-starter` fails until both halves are done — it is red on `master`
  as of 2026-09-09 and it is the **only** red check there, which is the reminder working as
  designed rather than a regression to chase.

### The worked example on the theme-generator page now prints different numbers

Same paragraph (`theme-generator-page.html:25`): it tells the reader to set `--gog-density: 0.85`
and look inside the Select panel, where "its option rows go from `10px 14px` of padding to
`8.5px 11.9px`". The option row derives from the shared field tier, and that tier moved from
`10/14` to `12/24` — horizontal padding is now exactly twice vertical on every control. **The
example still demonstrates exactly what it was written to demonstrate**; only the four numbers
change, to `12px 24px` and `10.2px 20.4px`. Re-read it against a real panel rather than trusting
this arithmetic — it is what the tokens say, not what was measured in a browser.

### Controls are wider, so any page that quotes a length is suspect

The button and the whole field tier went to `8 / 16 / 24 / 32 / 40` of horizontal padding across
the five sizes; the largest single change is a `slg` text field's side padding doubling. Nothing
in the lab is _generated_ from those values, which is the problem: a page that quotes one was
typed by hand. Check `lab-appearance-baseline.md`'s recorded preview geometry against the
component pages before assuming a diff there is a regression — for this release, a preview that
grew is the release landing, not the page breaking.

### Three corners changed shape, and one of them looks like a bug

Law 2 (concentric radii) joined the gate in this release, and five components moved. Two are worth
a look on the site rather than a token-table edit:

- **`gog-menu`'s item corner went 8px to 12px.** The panel paints `--gog-panel-radius` and insets
  its items by 4px, so the first and last items had been squarer than the corner they sit in.
  Visible on the menu page at the default theme.
- **The `gog-select` and `gog-multiselect` filter inputs now have square corners.** This will read
  as a regression to anyone who does not know why, so if either page says anything about that
  panel, it is worth one sentence: the filter is inset by exactly the panel's radius, and at that
  distance the inner box's corner point sits on the _centre_ of the panel's corner arc — a right
  angle there is equidistant from the whole curve, and it is the only corner that keeps the gap
  constant. It is not a value clamped to zero.

`gog-autocomplete`'s option row and `gog-scroll`'s thumb also changed, and neither is visible at
the default density: the first only differs once `--gog-density` leaves 1, the second is clamped
to a full pill at both track widths either way. The hand-maintained token reference needs no edit
for any of the five — none of its descriptions quote a value.

### Typography moved too, and one change is visible on the accordion page

Law 4 and D8 landed in the same release. Three things the lab may need to say:

- **The accordion chevron is a ratio now, not a px ladder**, so the chevrons at `xsm`, `sm` and
  `md` are identical — those three sizes all label with `--gog-text-xs`, and the chevron was the
  only thing distinguishing them. Visible on the accordion page's size examples. If that page
  shows the five sizes side by side, the three smallest will look closer together than they did.
- **The hand-maintained token reference gains a step and loses none**: `--gog-text-2xs`
  (0.6875rem, 11px), below `xs`. The Spacing entry needs nothing; this is the type scale.
- **Roughly forty-five new `*-line-height` tokens.** The reference lists token families rather
  than every token, so most need no entry — but the shared field tier is new and is the kind of
  thing that page does document: `--gog-field-line-height`, `-label-line-height` and
  `-error-line-height`, declared once and aliased by every field.

### The Theming page can say the laws are checked now

`npm run check:geometry` is a CI step as of this release, and it now runs five scripts, not the
two this paragraph originally described: the 4px grid, horizontal padding at exactly twice
vertical on every control, 24×24 CSS px of pointer target, concentric radii, the typographic
ratio, plus a second script over the icon registry (every glyph centres its ink in its own
viewBox) and a third over the four overlay max-widths (below). All five geometry laws this project
tracks are gated by the time this section is read. Worth a paragraph on the Theming page only if
it earns one; the audience there is a consumer choosing tokens, not an author of the library.

### Three overlay tokens cap themselves against the screen, and three move to `ch`

`--gog-tooltip-max-width`, `--gog-menu-max-width` and `--gog-toast-max-width` became
`min(<cap>, calc(100vw - <margin> * 2))` (`docs/component-geometry.md`, "D7 — taken").
`--gog-confirmation-dialog-max-width` deliberately did **not** — the dialog panel it renders inside
already caps at `90vw`, so a clamp on the child could never bind. Separately, the three caps whose
text wraps moved from `px` to `ch` — tooltip, toast and the confirmation dialog — so raising the
relevant font-size token now widens the bubble with it. Nothing here changes what a consumer reads off the
token names or what the token reference already says about them (checked: the existing entries for
`--gog-menu-min-width / -max-width` and `--gog-tooltip-max-width / -max-height` in
`token-reference-data.ts` are generic enough to still be accurate — neither quotes a pixel value or
a unit). Nothing to fix there. What is worth a look once the lab tracks this release: the tooltip
and toast pages' live demos, to confirm a bubble/card at the new width still reads correctly —
verified in `ui-showcase` already, but the lab renders against the _published_ palette and fonts,
which is exactly the case `check:app-contrast`'s own doc-comment gives for why the two apps are
checked separately.

### Two dialog titles now read the type scale, visible on the Dialog page

`gog-dialog`'s `<h2>` and `gog-confirmation-dialog`'s title/description previously rendered at
whatever the browser inherited rather than a token (`docs/backlog.md`'s confirmation-dialog
defect, fixed). Nothing here moves the plain dialog's title visibly — `--gog-dialog-title-font-
size` reads `--gog-text-xl`, which is exactly its already-rendered 24px — but the confirmation
dialog's description is a real, visible change: 16px to 14px (`--gog-text-sm`), a step smaller
than before. Live in `ui-showcase` at both densities and both a light and a dark theme: no
wrapping change, no overflow, the panel still reads comfortably. The lab's own dialog page should
get the same look once this version is published — a screenshot comparison against the page's
current state before assuming a diff there is a regression, the same caution `lab-appearance-
baseline.md` gives for the geometry sweep's own width changes above.

`--gog-confirmation-dialog-max-width` (51ch) does not move — a `ch` cap resolves against
`.confirm-dialog`'s own font (16px, inherited, untouched by the description's change), not a
descendant's — so nothing about the panel's width needs checking here, only its text.
