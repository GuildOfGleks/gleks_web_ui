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

**Order matters for one item only** — the stylesheet path (§2.1) must not be changed until
21.3.2 is published, because the short path does not exist in 21.3.0 or 21.3.1 and the lab
build would break.

---

## 1. After publishing **21.3.1**

Nothing in the lab breaks, but these are undocumented — `global-config.md`'s table and the
per-component pages have not been touched since 21.3.0.

### 1.1 `public/docs/global-config.md` — the config table is missing four fields

| Key | Missing field | Applies to |
| --- | --- | --- |
| `autocomplete` | `openOnFocus` | `gog-autocomplete` |
| `scroll` | `showTrack` | `gog-scroll` |
| `textarea` | `resize` | `gog-textarea` |
| `inputfield` | `showSpinButtons` | `gog-inputfield` |

The `inputfield` key is missing from the table **entirely**, not just a field.

### 1.2 Component pages with new API to document

- **`gog-slider`** — `range` (two thumbs, `[(rangeValue)]` with a `GogSliderRange` pair,
  mutually exclusive with `[(value)]`), `startDisabled`/`endDisabled`, `startAriaLabel`/
  `endAriaLabel`.
- **`gog-autocomplete`** — `openOnFocus` (on by default), `gogLoadMore` (paging a large or
  server-backed option source).
- **`gog-tabs`** — `scrollActiveIntoView` (on by default), `showScrollTrack`.
- **`gog-scroll`** — `showTrack`.
- **`gog-textarea`** — `resize`.
- **`gog-inputfield`** — the built-in number spin buttons and `showSpinButtons`,
  `incrementLabel`/`decrementLabel`.
- **`gog-icon`** — the new `copy` glyph in the icon gallery.
- Consider linking the shipped **`AGENTS.md`** from the getting-started page: it is a
  consumer-facing reference for AI agents and nothing in the lab points at it.

---

## 2. After publishing **21.3.2**

Everything in `docs/consumer-dx-plan.md` iterations 1–4. Two of these are *corrections* — the
lab currently states things that stop being true.

### 2.1 Stylesheet path — `src/styles/` → `styles/` ⚠️ do this only after 21.3.2 is on npm

Both paths ship in 21.3.2, and `src/styles/` keeps working until **21.5.0**, so this is not
urgent — but the lab is the reference a consumer copies from, and it should show the short
form. Five places:

| File | What to change |
| --- | --- |
| `angular.json` (root, `gleks-ui-lab` → `build`) | two asset globs (`input: node_modules/@guildofgleks/ui/src/styles`, `…/src/styles/presets`) and four entries in `styles[]` |
| `…/getting-started-page/getting-started-page.ts:42` | the `"styles": [...]` snippet |
| `public/docs/theming.md:42` | the preset path in the theme table |
| `public/docs/theming.md:50–51` | the `"styles": [...]` snippet |
| `…/shared/full-library-css.ts:5,8` | two comments naming `src/styles/` and the `docs/styles` asset glob |

Worth mentioning in `theming.md` that `@guildofgleks/ui/styles/*` now also resolves from a SCSS
`@import` (the package's `exports` map lists it), which the old path never did.

### 2.2 Corrections — currently wrong after 21.3.2

- **`…/theming-page` / `public/docs/theming.md:84`** — the `ThemeSwitcher` example annotates
  `themeService.theme` as `// WritableSignal<string>`. It is now a read-only `Signal<string>`;
  writing to it was the bug this fixed. Update the comment, and note that `setTheme`/
  `toggleTheme` are the only way to change it.
- **`…/calendar-doc-page/calendar-doc-page.html`** (~line 91) — a whole paragraph built on
  `gog-calendar` "not reading `GOG_CONFIG` itself", telling the reader to set `locale` and
  `firstDayOfWeek` per instance or resolve them from `GOG_CONFIG.datepicker` by hand. That was
  the library bug, not a design choice, and 21.3.2 fixes it: the calendar now resolves both
  itself, and its labels from `GOG_CONFIG.labels`. **Delete the caveat and replace it with the
  ordinary instance → config → default sentence** the other component pages use — the advice as
  written now tells people to do work the component does for them.

### 2.3 New API to document

- **`GOG_CONFIG.labels`** (24 keys) and **`GOG_CONFIG.theme`** (`storageKey`, `defaultTheme`,
  `followSystem`, `lightTheme`, `darkTheme`) — both need rows in `global-config.md`'s table and
  a worked example. `labels` is the answer to "how do I translate this library", which is a FAQ
  entry too (`public/docs/faq.md`).
- **`gog-inputfield`** — `readonly`, `maxlength`, `minlength`, `pattern`, `inputMode`,
  `spellcheck`; the widened `type` list (`tel`, `url`, `search`, `time`, `datetime-local`) and
  the exported `GogInputType` / `GogInputMode`. Worth stating explicitly that `autofocus` is
  deliberately not forwarded, and why.
- **`gog-textarea`** — `readonly`, `maxlength`, `minlength`, `spellcheck`.
- **`gog-multiselect`** — `selectAllLabel`, `clearAllLabel`.
- **`gog-calendar`** — `hoursLabel` / `minutesLabel` / `secondsLabel`, and the fact that it now
  resolves `locale` / `firstDayOfWeek` from `GOG_CONFIG.datepicker` on its own (see §2.2).
- **`gog-inputfield`, number fields** — `clearable` and the stepper now coexist; the clear
  button sits left of the stepper and the gutter widens for the pair. Previously `clearable`
  was a no-op on `type="number"` unless `showSpinButtons` was off, so any lab example that
  worked around that can be simplified. `ui-showcase`'s inputfield page has a worked example
  (`Weight (clearable)`) to copy from.
- **`gog-paginator`** — the per-page button names come from `GOG_CONFIG.labels.page`, a
  `(page, isCurrent) => string` formatter. This is the one entry in `labels` that is not a
  plain string, so it needs its own line in the config table rather than being lumped in.
- **Accessibility note, probably on the getting-started or FAQ page** — form controls now
  generate their own `id`, so `inputId` is only needed when something outside the component has
  to reference the field. Previously omitting it silently produced an unlabelled field.
- **Toast** — announcements now come from two permanently-mounted live regions on
  `gog-toast-container`; individual toasts carry no `role`/`aria-live`. Only matters to anyone
  who was styling or querying those attributes.
- **`TOKENS.md`** — the generated token catalogue moved out of the README. The lab's theming
  page keeps its own `token-reference-data.ts`, so nothing breaks, but the "where is the full
  list" pointer should name `TOKENS.md`.

### 2.4 Peer dependency

`@angular/platform-browser` is now a declared peer. Any "install" instructions that enumerate
the peers (`getting-started-page`, `faq.md`) should say four, not three — and the "only three
runtime dependencies" phrasing, wherever it appears, is now wrong.

---

## Checking your work

`npm run build:lab` (the wrapper — the raw `ng build gleks-ui-lab` never exits; see
`running-commands.instructions.md`). After a publish, `npm install` at the repo root first, so
`node_modules/@guildofgleks/ui` is the new version rather than a stale one or a leftover local
build.
