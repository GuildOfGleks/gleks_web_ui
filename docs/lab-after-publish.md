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

## After 21.5.0 — layer 4 of lab-versioning.md is unblocked

21.5.0 ships **`GOG_DEPRECATIONS`**: every deprecated symbol and token in the installed version,
with `since`, `sinceDate`, `replacement` and `removedIn`. That is the data `lab-versioning.md`'s
layer 4 was waiting for — a generated "deprecated, removed in 21.7.0" badge on an API or token
row, with nobody maintaining a second list.

Two things to know before building it:

- **In 21.5.0 the manifest is all tokens** (154 of them, the three abbreviated prefixes) and **no
  symbols** — iteration 3 removed every deprecated symbol. So the first useful badge belongs on
  the theming page's token rows, not on component API rows. Write the lookup so an empty symbol
  half is normal rather than an error state.
- It is read from the **installed** package, so the badge answers for the version the reader has.
  Do not hard-code 21.7.0 anywhere; take it from `removedIn`.

## After 21.6.1 — two new components and a directive to document

21.6.1 adds **`gog-card`** and **`gog-panel`** (plus `GogSurfaceVariant`, the
`gogCardHeader`/`gogCardMedia`/`gogCardFooter`/`gogCardLink` and `gogPanelHeader`/`gogPanelFooter`
slot directives, and `GOG_CONFIG.labels.togglePanel`), and **`gogRipple`**. The lab needs:

- **Two component pages**, under the layout group next to `gog-collapsible`. `ui-showcase`'s
  `card-page` and `panel-page` are the working demos to lift examples from — including the two
  that carry the argument: an interactive card whose footer button still receives its own clicks,
  and a non-collapsible panel holding an open `gog-select` (the dropdown escapes the panel's box).
- **`since` chips (layer 3 of `lab-versioning.md`) reading 21.6.1** on every input, slot and type
  listed above.
- **A theming-page note that `--gog-panel-*` names two things.** `--gog-panel-radius`,
  `--gog-panel-shadow`, `--gog-panel-border-width` and `--gog-panel-border-style` are the
  foundation surface tier _and_ the `gog-panel` component's chrome, on purpose. Whatever the
  theming page currently says about that prefix is now incomplete rather than wrong.
- **The "no card component" statement, wherever the lab makes one.** Grep for `card` in the lab's
  prose before writing the pages — the component inventory and any "what the library does not
  have yet" copy both move.

- **A `gogRipple` page**, next to the other directives (`gogTooltip`, `gogBadge`). Lift the six
  panels from `ui-showcase`'s `ripple-page` — and keep two of them in particular, because they
  are the ones that stop a reader misusing it: the badged surfaces (the reason the host is never
  clipped) and the wrapper-versus-surface pair (the wash squares off when the directive sits on a
  wrapper whose child paints the radius).
- **`since` chips reading 21.6.1** on `gogRipple`, `rippleDisabled` and `rippleCentred`.
- **Five new rows on the theming page**: `--gog-ripple-color`, `--gog-ripple-opacity`,
  `--gog-ripple-enter-duration`, `--gog-ripple-exit-duration`, `--gog-ripple-easing`. Worth a
  sentence that the colour defaults to `currentColor` rather than to a palette token — it is the
  only token in the catalogue that does, and it is why the ripple needs no per-variant tier.
- **Say plainly that it is off by default.** 21.6.1 wires the ripple into nine components but
  ships it switched off, so a reader who copies an example and sees nothing has not made a
  mistake. One line at the top of the page — `provideGogConfig({ ripple: { enabled: true } })` —
  is the whole answer.
- **`GOG_CONFIG.ripple.enabled` on the global-config page**, and in whatever list of config keys
  the lab keeps. It is the first _visual_ default in `GOG_CONFIG` rather than in `theme.css`, and
  the page already explains that boundary — so that explanation now needs its exception: a token
  can hide the wash but still pays for the node, the listeners and the frames, and a real off has
  to reach the TypeScript.
- **A `ripple` input row** on `gog-button`, `[gogButton]`, `gog-button-toggle-group`, `gog-chip`,
  `gog-tabs`, `gog-accordion`, `gogCollapsibleTrigger`, `gogMenuItem` and the shared
  select/multiselect/autocomplete table, each with a 21.6.1 `since` chip. Default `false`, via
  `GOG_CONFIG.ripple.enabled`.

## Checking your work

`npm run build:lab` (the wrapper — the raw `ng build gleks-ui-lab` never exits; see
`running-commands.instructions.md`). After a publish, `npm install` at the repo root first, so
`node_modules/@guildofgleks/ui` is the new version rather than a stale one or a leftover local
build.
