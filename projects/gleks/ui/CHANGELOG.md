# Changelog

All notable changes to `@guildofgleks/ui` are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.0.0/); this project has not yet
reached 1.0, so breaking changes may land in minor versions.

## [21.13.0] - planned

### Added

- **`gog-table` windows its rows — `virtualize`, off by default, and it needed a second
  primitive.** The dropdowns' `GogVirtualWindow` takes one row height, and a table cannot supply
  one: **a table row's height cannot be pinned**, because `height` on a `<tr>` _and_ on a `<td>` is
  a **minimum** in table layout. One cell taken from 40 to 600 characters measured 39px → 173.75px
  under `table-layout: fixed`, with the column width unchanged, and neither `height` on the row nor
  on its cells moved it.

  So `GogVariableWindow` (internal, `lib/shared`): a height per row — measured where a row has
  rendered, estimated everywhere else — with a prefix sum, so the range is a binary search rather
  than a division. The three dropdowns keep the fixed-pitch one, which is exact where this is only
  ever as right as the rows it has seen.

  **It requires `maxHeight` and `fullWidth`, does nothing without either, and says which is missing
  in a dev-mode warning.** Both are measured constraints rather than preferences: without
  `maxHeight` the table never scrolls vertically on its own, so there is no viewport to window
  against; and `fullWidth="false"` means `table-layout: auto`, where the browser sizes columns from
  the rows that are _rendered_ — measured, rendering 2 of 24 rows moved columns by up to 7.8px, so
  a windowed table would shift its own columns as you scroll.

  The `<tbody>` spacers are `<tr>`s, since a table body takes rows and nothing else; a row honours
  an explicit height exactly, including at 400 000px. **The ceiling is Chrome's, not the
  library's:** an element clamps at 33 554 426px, about 745 000 rows at 45px — and a dev-mode
  warning says so once when a table passes it, because past that the rows stay correct while the
  scrollbar stops reaching the end of the data, which is not a symptom anyone traces back to a row
  count.

  **Three indices would have changed meaning silently, and all three are public promises**:
  `gogRowClick`'s `index` (documented as the index within the page), the `showRowNumbers` column,
  and `GogColumnBodyContext.index` in every consumer's cell template. Under a window `$index` is
  the position in the rendered slice, so each keeps its name, its type and its documentation while
  meaning something else. Specs fail without the fix with `expected +0 to be 196` and
  `expected '1' to be '197'`. Checked rather than assumed on the other side: `toggleAllOnPage` and
  the header checkbox still read the page, not the window — select-all would otherwise have
  selected the twenty rows on screen while claiming a thousand.

  **Two of the three things the plan called hard were not.** The sticky header lives in `<thead>`,
  which a window over `<tbody>` never touches — pinned exactly at the viewport top across 200 000px
  of scroll past a 400 000px spacer. The selection column is an ordinary `<td>` per row. That is
  the third release running where the predicted hard part cost nothing.

  **And one bug came out of the live pass that no spec would have suggested.** The effect that
  clears cached heights on a new page or sort calls `reset()`, and `reset()` _reads_ the
  measurement signal to decide whether it has anything to clear — so, called bare inside an effect,
  that read became one of the effect's dependencies. Measuring wrote the signal, the effect re-ran,
  and it cleared the measurements that had just been taken. **Nothing looked wrong**: the right
  rows rendered at the right heights, and only the scroll height was quietly the estimate times the
  row count, for ever. `untracked` is the fix and a regression spec now asserts it — it fails
  without it on a spacer that is exactly `982 × 30`, a whole number of estimates.

  The estimate is seeded from the **median** of the first rendered batch rather than its first row.
  Taking row 0 was the first version, and the showcase's own demo is why it is wrong: it makes
  every seventh row wrap, row 0 among them, so the estimate came out 65% high and all 10 000 rows
  were sized from the one row that least resembles them.

- **`gog-select` windows its option list — `virtualize`, off by default.** Measured in Chrome on
  one page holding two selects over the same 10 000 options: the eager panel takes **512ms** to
  appear and builds **10 000 rows to show six**; the windowed one takes **21ms** and holds **10**.
  Both scroll through an identical 450 008px of content, because spacers stand in for the rows
  that are not there. A per-field input, with `GOG_CONFIG.dropdown.virtualize` as the app-wide
  default.

  **Never automatic above some row count**, which is the same call `GOG_CONFIG.ripple.enabled`
  makes: a windowed list differs from a plain one under `Ctrl+F`, under a screen reader's "list
  all items", and under consumer CSS targeting `:last-child`, so flipping it when enough rows
  happen to arrive is behaviour that depends on how much data turned up — it works in development
  and surprises in production.

  Under it, `GogVirtualWindow` in `lib/shared` (added below, internal): the arithmetic and nothing
  that touches the page, so the component keeps its own scroller. The four things
  `docs/virtualization.md` said were easy to get wrong all needed work, and three of them landed
  differently from the plan:

  - **The count stays honest.** `aria-setsize` and `aria-posinset` carry the real list and the
    real index, so a listbox holding twenty rows is announced as ten thousand items. Set only
    while windowing — an unwindowed list has every row present and the browser's own count is
    both right and free.
  - **The keyboard moves an index, not an element.** ArrowUp from the trigger means option 10 000,
    which is not in the DOM to be focused: the index moves first, the scroll follows, and the row
    is focused after the render that stamps it. `nextRovingFocusIndex` already existed as the
    index half of the roving-focus helper, so the navigation rules — wrapping, skipping disabled,
    Home/End meaning first/last _reachable_ — did not have to be written twice.
  - **The panel's height is read from the scroller, not from a token.** The plan asked for a
    `ResizeObserver`; `gog-scroll` already runs one and already coalesces scroll and resize into
    one rAF-batched emission carrying both `scrollTop` and `clientHeight`, so `(gogScroll)` is the
    whole answer and a second observer would have measured the same element a frame later. A
    reported height of **zero** is ignored rather than believed: the scroller's first emission can
    land before the panel has a height, and taking it literally renders the whole list for a frame
    — the one thing the seed exists to prevent.
  - **Filtering resets the window and the scroller together** — and this one is narrower than the
    plan claimed. `GogVirtualWindow` already clamps a scroll position past the end of its own
    list, so filtering 10 000 options down to three cannot render rows 400–420 of a three-row
    list; the plan's own example is handled for free. The real case is a filtered list still long
    enough to scroll, where the old position clamps to a **valid** position in the new list and
    the search shows the end of its results. The first spec written for this passed with the reset
    removed, which is how that was found.

  One thing the plan did not have at all. **A row scrolled out of the window is unmounted, and an
  unmounted element holding focus drops it on `<body>`** — where an open panel has no keyboard:
  Escape does not close it and the arrows scroll the page. So a mouse scroll that would take the
  focused row away hands focus back to the trigger first, which Escape and ArrowDown both work
  from. It is checked before the re-render rather than after, because once the row is gone there
  is nothing left to ask whether it was the focused one. This is a cost a plain list does not pay
  and part of why windowing is opt-in.

  `gog-multiselect`, `gog-autocomplete` and `gog-table` do not window yet.

- **`npm run check:glyph-box` — the first check in this repo that measures a rendering.** Every
  other one reads source; this rule cannot be read honestly from source, because a glyph is
  `--gog-icon-size` (1.2em) of its element's resolved font-size and **an `em` attaches to the
  element carrying the property, not the one the value was written for**. Guessing that produced a
  "fix" 25% worse at `slg` in this very release. So it serves the prerendered `ui-showcase`, walks
  all 46 routes in Playwright against the installed Chrome, and compares every `<gog-icon>`'s
  `<svg>` to the element holding it. 580 icons.

  The rule has **no exemption list**, which no other check here can say: a box roomier than its
  mark is fine, smaller never is.

  **Two things went wrong in the check before it was right, and both are the lesson.** It first
  walked every route on one page, so findings depended on visit order — the showcase persists
  theme and density, and a route measured after the themes page inherited whatever it had left
  set. And it compared against the _content_ box, which reported `gog-checkbox`: a 12px tick
  spanning its own 2px outline, which is what a checkbox is. **The border box is the box.**

- **`npm run check:tokens` rule K — a token `theme.css` declares that nothing reads.** The mirror
  of rule F, which has always caught the opposite direction: a `var()` read with no declaration.
  Nothing caught a declaration with no reader, so a component could ship a documented knob wired to
  nothing and every gate this project has would pass. `--gog-menu-panel-gap` was exactly that for
  the whole life of `gog-menu` (fixed below).

  Reads are collected from component stylesheets, the global ones, `theme.css` itself **and
  TypeScript**, because a token read only from script is still read. That last half took two
  passes: TypeScript spells a token two ways — a bare name handed to `resolveLengthToken`, and a
  whole declaration built as a string (`'var(--gog-control-checkbox-box-size-lg, 32px)'`, which a
  host binding writes) — and the first version matched only the first shape, reporting **eight
  live tokens as dead**. A check that cannot read half its inputs is worse than no check, because
  its findings are what you act on.

  Five exemptions, all steps of a complete public scale (`--gog-elevation-0`, two spacing aliases,
  two type steps): a scale is offered whole or it is not a scale, and the consumer is the reader.
  **Nothing belonging to a component may be exempted** — that is the defect the rule exists for.

  It cannot see a dead _chain_: if A is read only by B's declaration and nothing reads B, both look
  live. The leaf case is the one that has ever happened here.

- **`gog-multiselect` and `gog-autocomplete` window too — the same `virtualize`, same default.**
  Verified live in Chrome on 10 000 options each. Multiselect: 8 rows in the DOM, a 490 004px
  scroll height matching the unwindowed list to the pixel, and row 2 036 sitting at 99 768px,
  which is `2036 × 49 + 4` exactly. Autocomplete: 12 rows, `End` reaching option 10 000 with
  `aria-activedescendant` on it and the panel scrolled to match.

  Two things were specific to these two rather than shared, and both were real:

  - **A spacer in a list that declares a row `gap` takes that gap on both sides of itself**, while
    the window's padding already stands in for every gap between the rows it replaces. So the
    spacer's height is the padding less one gap. `gog-multiselect` is the only one of the three
    lists with a row gap, and uncorrected the panel was two gaps too tall and every row sat one
    gap below where its index said. **A constant error, not an accumulating one**, which is why it
    would have survived a reading: at the shipped 4px nothing looks wrong, it is just 4px wrong
    everywhere.
  - **A combobox names a row by id, and the id has to be the index in the whole list.** Focus
    never leaves `gog-autocomplete`'s input, so the highlight travels by `aria-activedescendant`.
    With the id keyed to the rendered slice it restarts at zero on every scroll, so the input
    points at option 0 while the highlight paints a row in the middle — the two agreeing only
    while the window happens to be at the top. Its spec fails that way without the fix
    (`expected 'gog-autocomplete-35-option-10' to contain '-option-999'`).

  `gog-autocomplete`'s keyboard needed nothing else: its active row was already an index into the
  full list rather than an element, because the combobox pattern had put it there years before
  windowing existed. Only `scrollIntoView` had to go — it needs an element, and the window's whole
  point is that most of them are not rendered; the arithmetic knows where the row would be.

  **`virtualize` and `gogLoadMore` are different halves and compose.** One keeps the records the
  server sends small, the other keeps the rows the browser builds small; a `gogLoadMore` list that
  has loaded 10 000 records still stamps 10 000 rows without this. The spacers are also what keep
  `gogReachEnd` meaning the end of the data rather than the end of the window.

  `gog-table` still does not window.

- **`gog-alert` — a persistent, in-flow message**, and the thing `gog-toast` cannot be. No timer,
  no queue, no overlay, no service: it renders where you write it and stays until your app removes
  it. `severity` (the shared `GogSeverity`, defaulting to `'accent'`), an optional `heading`, a
  projected body, `dismissible` with a `dismissed` output, `iconName` with a `gogAlertIcon` slot,
  and `GOG_CONFIG.labels.closeAlert`.

  **`dismissed` means pressed, not removed.** The alert stays in the DOM and the app decides. A
  component that deleted itself would take the focused element with it and drop a keyboard reader
  onto `<body>`.

  **It announces through `live`** — `'assertive' | 'polite' | 'off'`, defaulting from the severity,
  with `GogAlertLive` exported. The announcement is a copy of the message in a **separate
  visually-hidden region**, empty until one render after the alert mounts, because a live region
  filled in the same pass as its own creation announces nothing — the trap
  `gog-toast-container`'s permanently-mounted regions exist to avoid.

  **Whether the component could pick `live` itself was measured, and it cannot.** The question was
  whether it can detect having been created during the application's first render, which is the
  one case the severity-derived default gets wrong. `@angular/core` exposes no stability member on
  `ApplicationRef` a component can read synchronously at construction, and `afterNextRender`
  reports its _own_ first render — which every alert has, whenever it mounts. So `live` is the
  consumer's call with a loud note: **set `'off'` for a message that is on the page when it
  loads.**

  One thing the plan called for and the code refused: **there is no `variant` input.** It was to be
  `GogSurfaceVariant` defaulting to `'filled'`, but `filled` in this library means _a tint_ and
  there is no per-status tint to draw it with — `--gog-accent-pale` exists, `--gog-success-pale`
  does not. Inventing that family here would make the alert the twelfth place a theme restates its
  red, so the severity is a leading edge and the icon over the ordinary surface, which is the shape
  `gog-toast` already reached for the same reason.

- **`--gog-button-focus-ring-color`**, and it is a fix as much as an addition. `gog-button` had a
  focus-ring width and a focus-ring offset but no colour, so `button.css` reached for
  `--gog-button-variant-hover-bg` — the _hover_ fill doing focus duty, which is the same defect
  eight other indicators had corrected in 21.12.0. It passed on `primary` and `secondary`, whose
  hover fill is a saturated accent, and failed wherever that fill is a wash: **`ghost` at
  1.07–1.16:1** and the **severity `outline`** combinations at **1.79–2.65:1**, eleven failures
  across `light`, `material`, `primeng` and `terminal`.

  It defaults to `--gog-accent-color` — one colour, not one per variant. A focus ring's job is to
  be visible against the page the button sits on, which does not change with the button's fill,
  and this ring already sits a pixel further out than the foundation's so it reads as separate
  even on a filled accent button. That is the answer the library's other fourteen rings give.

### Changed

- **`public-api.ts` names what it exports instead of re-exporting two modules wholesale.** The
  defect was never which symbols are public — it was that **adding one published it silently**. A
  helper written into `date-utils.ts` or `option-accessor.ts` became part of the package's `.d.ts`
  the moment it was saved, with nobody deciding that and no diff showing it.

  **Nothing is dropped from `date-utils`.** All twenty of its helpers and `GogDateRange` are
  listed by name, because `AGENTS.md` already advertises `formatDate`, `parseDate` "and a family
  of date-math helpers" — the set is supported on purpose. The list changes nothing a consumer can
  import; it changes who decides the next one, which is the whole point.

  `option-accessor` is the module where the accident had consequences, and its three functions are
  deprecated above.

- **A warning toast and an info toast were both the accent, and an info toast was pixel-identical
  to a plain one.** `--gog-toast-warning-color` read `--gog-accent-bright` and
  `--gog-toast-info-color` read `--gog-accent-color` — which is also what a _typeless_ toast
  paints. That token is the whole signal: it draws the leading stripe, the icon and the countdown
  bar. Three of the five toast states were the accent, in every theme, since the component
  shipped. Both now read their own role.

  **Surveyed rather than assumed, after the palette fix below raised the question.** All 45
  severity-named colour tokens across every component were resolved against their own role in all
  eleven themes; `gog-toast` is the only one that was wrong, and it was wrong twice. `gog-alert`,
  `gog-button`, `gogBadge`, `gog-tag` and `gog-progressbar` all derive correctly — which is what
  made this invisible, since nothing compared a token's _name_ against the root it reads.

- **`check:tokens` rule J — a token named for a severity resolves to that severity.** A text rule
  rather than a sweep: the declaration either names its own role or it does not, and that needs no
  colour maths. Scoped to the four suffixes whose job is to _be_ the role's colour (`-color`,
  `-bg`, `-fill`, `-border`); `--gog-badge-warning-color` is the _label_ on the warning fill and is
  in the exception list with that reason, beside `-wash`, `-ink` and `-buffer-bg`, which are
  percentages of a role rather than the role. Verified by putting the old value back and watching
  it fail.

- **`README.md` and `AGENTS.md` say where `gog-table` stops.** No column resizing or reordering by
  the reader, no frozen columns, no expandable rows, no grouping — stated where someone evaluating
  the table will read it rather than discovered halfway into a project. Documentation only;
  nothing about the component changes.

  **This list said "no virtualization" when it was written, and this release removed that line by
  building the thing.** Both entries are in this changelog, days apart, and for a while the release
  both added `virtualize` and advertised its absence. A limitations list is a claim with a shelf
  life, and the shelf can be one release.

  Each claim was verified against the code first, and one in `docs/backlog.md`'s filing was wrong:
  it said "no sticky columns" while the table has shipped `stickyHeader` since 21.6.0. Those are
  different axes — the header pins while rows scroll under it; the absent one is freezing a column
  against _horizontal_ scroll — and both documents now draw that line, because a limitations list
  that looks wrong on its first line teaches a reader to distrust the rest.

- **`check:oklch`'s R3 compares five severities, not four — and three themes were painting two of
  them as one colour.** `GogSeverity` is `'accent' | 'success' | 'danger' | 'warning' | 'info'`
  and the library paints all five as a set (`gog-button`'s `severity`, `gog-progressbar`'s
  `variant`, `gogBadge`, and now `gog-alert`, whose entire signal is the colour of one edge). R3
  was written against "the four status colours" and left the accent out, so four of the ten pairs
  went unmeasured.

  Two of the three findings are not close calls: the **dark** theme declared
  `--gog-warning-color: #fbbf24`, the same hex as its accent, and **terminal** declared
  `--gog-success-color: #3ddc5c`, the same hex as its. Nobody writes one value twice for two roles
  on purpose — it is what a palette typed role-by-role produces when nothing compares them.
  **parchment**'s danger sat 6.9° of hue and 0.052 of lightness from its oxblood accent, which is
  not a distance a reader can use.

  All three moved the **status**, never the accent: the accent is the theme's identity and the
  status is the role that has to be read. `dark`'s warning is ember orange `#ffac4e` — moved by
  hue rather than lightness, because darkening a status on a dark ground trades one defect for
  another. `terminal`'s success is `#00b330`, moved along its own hue because that theme's other
  three statuses already occupy yellow, red and cyan and the room left is in lightness.
  `parchment`'s danger is `#a24439`. `check:contrast` stays green on all eleven themes.

- **A disabled control is exempt from `check:contrast`, consistently and on purpose.** WCAG carves
  out "an inactive user interface component" in both SC 1.4.3 and 1.4.11 — a disabled control is
  meant to look unavailable, and holding it to 4.5:1 makes "unavailable" impossible to draw. The
  script had simply never had `:disabled` in one of its state regexes, with nothing saying why, so
  the omission read as an oversight.

  It also was not the exemption it looked like: **eight pairs reached the sweeps through compound
  selectors** — `.gog-accordion__item--disabled .gog-accordion__header:hover` enters on its
  `:hover` — and were gated. One predicate governs all three sweeps now, and such pairs are
  printed rather than dropped. Nothing in the library changes; all eight already passed.

- **`npm run check:oklch` gates that a raised surface has an edge (R4).** `*-shadow` colours were
  the last thing the palette gate did not read. `check:elevation` requires a theme to declare all
  ten elevation knobs, but a theme may declare all ten at zero and pass it — rendering a dialog
  with no boundary against the page behind it, with every check green.

  The rule is a disjunction, because four different things can mark that edge and the eleven
  shipped themes split on which: **six are carried by their shadow and five by their hairline
  ring**, so gating any single carrier would have failed half the catalogue for a choice it made
  deliberately. Whichever is strongest must clear ΔL ≥ 0.03 — the same threshold R1 already uses,
  because it is the same question. Observed 0.0852 (`light`) to 0.3465 (`material`): the weakest
  shipped theme clears it by 2.8x, and both figures are now printed per theme.

  Nothing in the library changes. This one is a gate against a theme a consumer writes, which is
  where the failure is silent.

- **`npm run check:contrast` resolves a boundary through the variant layer, and `.gog-btn` is
  gated by it.** The button was the one control deliberately outside the boundary sweep, because
  what identifies a button depends on its variant and the sweep resolved each painting rule once —
  on `.gog-btn` that meant reading `--gog-button-primary-border`, `transparent` in the base theme.
  It now resolves every boundary under each variant chain, the same machinery the variant sweep
  already used for fills and labels, so `outline`'s border is measured as `outline`'s and
  `ghost`'s transparent one is skipped. That is what found the focus-ring failures above.

  Two smaller corrections came out of building it. **`boundaryBlock` matched the first gated
  prefix rather than the longest**, and `.gog-ms` is a prefix of `.gog-ms__filter-input`: the
  multiselect's filter input was being measured against the _page_ rather than the panel it sits
  in, so the pair it reported was one nobody sees. And **the sweep now asserts that every block it
  gates actually matched a declaration** — the same discipline as the pattern self-test added in
  21.12.0, and it is what surfaced the prefix bug. A gated list whose entries match nothing looks
  exactly like a library with no defects.

### Deprecated

- **`getByPath`, `readOption` and `isSameOptionValue` are deprecated, removed in 21.14.0.** They
  are this library's own plumbing for reading a field off a consumer's object, and they became
  public API because `public-api.ts` re-exported their module wholesale. Nothing in `README.md` or
  `AGENTS.md` has ever mentioned them. `GogOptionAccessor` — the type every collection control's
  `optionLabel` / `optionValue` / `optionDisabled` input is declared with — stays, and is the
  reason the module was exported at all.

- **`--gog-slider-thumb-shadow` becomes `--gog-slider-thumb-glow-color`, removed in 21.14.0.**
  The thumb composes it as `box-shadow: 0 0 var(--gog-slider-thumb-glow-size) <this>`, so the
  token holds a **colour** and always has. Of the 31 `*-shadow` tokens the elevation audit
  classified for 21.12.0, it was the only one whose name was simply wrong — and the wrongness is
  not decorative: a consumer overriding it with a colour got what they expected, and one
  overriding it with a shadow got a declaration the browser silently dropped.

  `check-elevation.mjs` has carried it in `NOT_ELEVATION` with that reason since it was found;
  that entry now explains why it is still listed (the sweep keys on the `-shadow`/`-glow`
  families, not on what a token holds) rather than promising a rename.

- **`--gog-select-panel-offset` and `--gog-multiselect-panel-offset` become `*-panel-gap`,
  removed in 21.14.0.** Five components place a panel with `calc(100% + <token>)` and split three
  ways on what to call the value: `gog-autocomplete` and `gog-datepicker` said `-panel-gap`,
  `gog-select` and `gog-multiselect` said `-panel-offset`, and `gog-menu` said `-offset`. A
  consumer who learned one spelling guessed wrong on the next component.

  `-gap` wins because it is the true one: an offset is a displacement from where a thing would
  otherwise be, and this is the space between two things. `gog-menu`'s is renamed outright in the
  same release with no window, because that one was never read (see Fixed) — a deprecation cycle
  protects working consumer code, and there was none.

  **Both old names keep resolving until 21.14.0.** `theme.css` declares each new token as
  `var(<old name>, <value>)`, which is the mechanism the 21.7.0 prefix removals used: an override
  on the old name still wins, one on the new name wins over it, and everyone else gets the value.
  One minor rather than two, per `api-design.instructions.md` — the migration is a find-and-replace
  in a theme.

  **The ratchet had to grow a second half to hold this.** `DEPRECATED_NAMESPACES` can express
  `--gog-btn-*` becoming `--gog-button-*`, because the prefix moves and the suffix is carried
  through — it cannot express a rename, where the suffix itself moves and the replacement has to be
  named. `DEPRECATED_TOKENS` is that map, `check:deprecations` fails on an overdue entry the same
  way, and `GOG_DEPRECATIONS` now ships two entries where it shipped none. Verified by dating both
  to the current version and watching the check fail.

### Fixed

- **Six tokens were declared and read by nothing — one wired up, five removed.** Everything rule K
  found on its first run, each given a verdict rather than a blanket fix:

  **`gog-inputfield`'s clear mark was the wrong size**, and this is the one a consumer can see.
  Six controls offer a clear button and all six declare `--gog-<block>-clear-icon-ratio` at `0.7`;
  five read it and `gog-inputfield` did not, so its `×` rendered at the field's full type size —
  about **43% larger** than the identical mark on a select, multiselect, autocomplete, datepicker
  or textarea standing next to it. It now reads its own token, like its five siblings.

  **Five leftovers removed**, none of which any stylesheet could reach:
  `--gog-accordion-hover-ring` (the header's hover paints a colour and a background, never a ring),
  `--gog-multiselect-checkbox-bg` and `--gog-multiselect-checkbox-checked-color` (the option's mark
  is a glyph, so a background and a label colour have nothing to paint — the two tokens the mark
  _does_ read are untouched), `--gog-panel-elevated-shadow` (21.12.0 deliberately pointed the
  elevated variant at the foundation's own `--gog-panel-shadow`, which left this behind), and
  `--gog-toast-gap` (the stack uses `--gog-toast-stack-expanded-gap` and the row
  `--gog-toast-content-gap`).

  **No deprecation cycle for any of the five**, on the same reasoning as the menu's rename: a
  deprecation window protects working consumer code, and a token nothing reads has none to protect.
  Overriding any of them has always done exactly nothing, and still does.

- **Two more marks were bigger than the boxes holding them**, found by the check above rather than
  by eye — the same defect as the chip's remove mark, the select's chevron and the multiselect's
  arrow earlier in this release, in two places that audit did not reach.

  **`gog-table`'s sort icon was 9% wider than its slot**, and it is the _fourth_ time this library
  has paid for "a relative unit resolves against the element carrying the property".
  `--gog-table-sort-icon-width: 1.1em` reads as "a little wider than the mark" and is not: the
  `em` resolves against the element's own font-size, which the line below it had already reduced
  to `0.9em`, so the slot came out `0.99em` of the header while the mark is `1.2 × 0.9 = 1.08em`
  of it. The slot now takes a floor of `--gog-icon-size`, which states the invariant in the CSS
  rather than leaving it to a number someone has to get right. A consumer setting the token wider
  still wins.

  **`gog-textarea`'s clear mark was 20% wider than its button**, and this one is the largest of
  the four because its ratio is deliberately `1` — `theme.css` says why, and it is right: 0.7
  suits a dropdown's dense single-line trigger and reads as a speck on a multi-line box. So the
  **box grew and the mark did not move**, which is the same resolution the chip's got. The clear
  button's hit area is about 20% larger.

- **An `interactiveRows` table row answered a click and not a press.** It had a cursor, a hover
  tint and a focus ring, and nothing at all under the finger — 21.9.0 gave nine other pressable
  surfaces a `:active` colour and this one was not among them. `--gog-table-row-press-bg` now
  fills that, guarded on `--interactive` because a plain row is not a control, and a selected row
  keeps its own tint under the finger for the reason it already keeps it on hover.

  **A colour rather than a ripple, and that is the verdict on `docs/ripple.md`'s deferred table
  rows.** That plan left them out on two arguments and gated the revisit on the weaker one —
  "no virtualization in this library yet" — which `virtualize` has now removed. The other never
  depended on it: a wave whose radius is an 800–1200px row reads as a flash across the table
  rather than as feedback where the finger landed. A colour also survives
  `prefers-reduced-motion`, which was 21.9.0's other half.

- **`gog-menu`'s gap between trigger and panel was a token nothing read.** `--gog-menu-offset` was
  declared in `theme.css`, listed in `TOKENS.md`, and documented on the site as "gap between the
  trigger and the panel" — and the panel is placed in script, by a function that was called
  without its `gap` argument and fell back to its own hard-coded `4`. Setting the token did
  nothing, in every theme, since the component shipped.

  What it cost beyond the dead knob: the four other components that place a panel this way take
  their gap from CSS and follow `--gog-density`, so **a theme changing density moved four of the
  five and left the menu's gap at 4px.** The component resolves the token now, through
  `resolveLengthToken` — `parseFloat` would return `NaN` on the `calc(4px * var(--gog-density))`
  the density scale produces, which is the trap that file exists for.

  **Renamed to `--gog-menu-panel-gap` in the same change, with no deprecation cycle, on purpose.**
  A deprecation window protects working consumer code and there is none to protect: nothing a
  consumer wrote against the old name ever had an effect. Keeping an alias alive for two releases
  would be complexity spent guarding a promise that was never kept. The new name is also the one
  the other four already use — `--gog-<block>-panel-gap` — which is what the
  `-gap`/`-offset` split in `docs/backlog.md` is about.

  Found by sweeping `theme.css` for tokens nothing reads, after `--gog-menu-offset` turned up while
  auditing that naming split. **The sweep found twelve candidates out of 1482**, and no check
  covers the category: `check:tokens` rule F is the opposite direction — a `var()` read with no
  declaration — so a declaration with no reader passes every gate the project has.

- **A dropdown could open downward into a panel that does not fit.** The three controls on
  `GogDropdownBase` — `gog-select`, `gog-multiselect` and `gog-autocomplete` — size their panel
  from `--gog-*-option-height` and choose up or down from the result. That token calls itself an estimate; measured against a rendered row it is wrong in
  **all eleven shipped themes** — low in ten of them, by up to 8.38px a row — so the estimate
  systematically under-reported and a short list could be judged to fit below when it needed more
  room than there was.

  It only ever misfired on lists short enough to sit under the panel's max-height cap (roughly
  five rows), which is why it went unseen: above the cap the cap dominates and the error is
  masked. **No static token can fix it** — the same `parchment` row is 48.38px at
  `--gog-density: 1` and 42.38px at 0.85 — so the component now measures one real row a frame
  after the panel renders and re-places if the token disagreed, caching it so every later open is
  right from its first frame. The token remains as the seed for that first frame and its
  documentation is corrected in all three.

  Found by `docs/virtualization.md`'s iteration 0, which existed to check exactly this before
  anything new depended on it.

- **Two of the three dropdowns sized their panel from a gap that is not between the rows.** The
  height estimate that decides whether a panel opens up or down sums the rows _and the gap
  between them_, and it took that gap from `--gog-<block>-option-gap` — which on `gog-select` and
  `gog-autocomplete` is the gap **inside** a row, between the mark or icon and the label. Neither
  options container declares a gap between rows at all, so every row added 12px of panel that is
  not on the page: 48px on a five-row list, which is the length at which this decision is made at
  all.

  It is the same defect as the row-height one above and the opposite sign, which is why they were
  invisible together — one estimate ran low per row and the other ran high per gap. Fixing the
  first is what exposed the second, and that is the argument for measuring rather than deriving:
  **a sum of two wrong terms can place a panel correctly and does not stay lucky.**

  The gap is now measured from the rendered options container, in the same frame and from the same
  element as the row — the row's own `parentElement`, so no subclass has to declare a second
  selector. `gog-multiselect` is unaffected: its list is the one that really does declare a row
  gap, and it is the only one that still seeds from a token.

  **The token names are unchanged and so is what they paint.** `--gog-select-option-gap` still
  sets the space between the check mark and the label, which is what it has always done; only
  what read it for a different purpose has changed. All three now say in `theme.css` which gap
  they are.

- **`gog-progressbar`'s buffer had no edge, and its edge is the whole of what it says.** The
  buffer tier marks how much is loaded; where it _ends_ was under 3:1 against the track in **55 of
  55** shipped theme/variant combinations, worst **1.06:1**. That is a stronger result than the 51
  of 55 that justified marking the fill's edge in 21.10.0, and it has the same cause: the two
  tiers are the same hue by design — "the buffer tier is the same hue at low opacity, so it reads
  as _ahead of the fill_ rather than as a second, competing colour" — which is the right choice
  and exactly why a colour difference cannot carry the boundary.

  The buffer now draws the same two hairlines the fill has drawn since 21.10.0. **No new token and
  no palette change:** measured at the buffer's own edge across the same 55, the existing marker
  clears 3:1 everywhere, worst 3.25:1, carried by the ink line against the bare track — the pair
  `check:contrast` already gates. Visible wherever `mode="buffer"` is used.

- **Three icon buttons were smaller than the icon inside them** — `gog-chip`'s remove mark by 9%,
  `gog-select`'s chevron and `gog-multiselect`'s arrow by 5%, at every size and in every theme.
  Each set its box from one basis and let `<gog-icon>` draw the mark from another: the icon
  renders its `<svg>` at `--gog-icon-size` (1.2em) of its own font-size, and none of the three
  boxes was derived from that.

  **Nothing painted the overflow, so nothing showed it** — the boxes carry no background at rest
  or on hover. What it cost was the focus indicator. `:focus-visible` draws its outline on the
  box, so on the chip the ring was drawn _inside_ the mark it indicates and cleared it only
  because `--gog-chip-focus-ring-offset` happens to be 2px; measured at an offset of `0` — a
  value any theme may choose, and one the theme generator offers as a slider — the ring landed
  0.79px inside the glyph at `md`.

  All three now state the mark's font-size and its box on the same element, with the box reading
  the same `--gog-icon-size` the icon reads. The two cannot drift again for any ratio, or for any
  icon size a consumer sets.

- **`--gog-chip-remove-scale` now means what its name says, and its default is `1`.** It was
  `1.1`, and it multiplied the button's _font-size_ rather than the mark — so it produced a box
  9% narrower than its own contents, and any value under `1.2` did nothing visible at all. It is
  the ring around the mark now: `1` is the box the glyph occupies, and anything above it is
  padding. **A theme that overrides this token gets a larger box than before at the same
  number**, by a factor of 1.2.

  `--gog-select-chevron-icon-ratio` and `--gog-multiselect-arrow-icon-ratio` were wrong in the
  same way and are unchanged in value: both read `0.875`, which a reader takes to mean the
  chevron is seven eighths of the field's type. It was 1.05 of it, because `--gog-icon-size`
  multiplied on top. The mark does not move; the box around it grows 5% to contain it.

  One visible consequence: **a removable chip with no avatar is ~9% of its remove box taller** —
  1.2px at `xsm` to 2.0px at `slg`, measured at `--gog-density: 1`. The mark itself does not
  change size at any of the five. A chip with an avatar does not move at all, because the avatar
  is the taller element. On `gog-select` and `gog-multiselect` nothing moves: the chevron's box
  is not what sets a field's height.

## [21.12.0] - 10.09.2026

### Added

- **`npm run check:oklch` — the perceptual half of the palette gate**, and a CI step. WCAG's
  ratio is a luminance formula: it cannot say whether a state step is visible, whether a status
  colour has stopped being a colour, or whether two statuses are the same hue. Three rules, every
  threshold set after measuring all eleven shipped palettes rather than before. It found two
  defects on its first run, neither of which any contrast ratio would ever have caught — both are
  fixed below.

  **One rule `docs/backlog.md` asked for is deliberately not in it.** "Ramps must be monotonic and
  evenly spaced in L" fails eight of the eleven palettes, and eight of them are right: on a light
  ground the hover fill is _darker_ than the rest state, which is a decision taken in 21.7.0 with
  the numbers behind it. What is checkable is that the step exists, not which way it points.

- **`--gog-control-boundary-color`, and `npm run suggest:color`.** A foundation token for the edge
  that _identifies_ a control, separate from `--gog-border-color`, which draws dividers, table
  rules and panel outlines and is deliberately kept faint. `gog-chip`, `gog-toggle` and
  `gog-button-toggle` had been reading the decorative one as their own boundary; measured across
  all eleven themes they sat at 1.18 to 2.17:1, against the 3:1 WCAG SC 1.4.11 requires, and
  neither their border nor their fill carried it. All three read the new token now.

  Its eleven values are computed rather than chosen. `npm run suggest:color -- <ink> <ground>
[target]` takes a hex or a `--gog-*` token, resolves it per theme, and walks lightness in OKLCH
  — holding hue and chroma, so a gold comes back gold rather than brown — until the ratio clears,
  then verifies the answer by measuring it. It reports per theme, because a palette problem is
  almost never in one theme alone, and it says so plainly when a hue cannot reach the target at
  any lightness instead of returning a colour that silently misses.

- **An elevation ladder — `--gog-elevation-0` through `-5` — and the ten knobs a theme turns to
  place its own shadows on it.** Six heights, Z doubling: 0, 1, 2, 4, 8, 16. A step is two lights,
  a contact shadow that hugs the object and never moves and a key light whose offset is Z and
  whose blur is three times it. The library's own surfaces are placed on it: a toggle thumb at 1,
  an `elevated` card or panel at 2, anything anchored to a control at 3 (the four dropdown panels,
  the tooltip, the menu), a toast at 4, a modal dialog at 5.

  **What it replaces is the reason it exists.** Eleven themes hand-authored 22 shadow values with
  no relationship to each other, and three defects were living inside that: `--gog-menu-shadow`
  aliased `--gog-dialog-shadow`, so a dropdown menu carried a modal's elevation while the four
  dropdown panels beside it carried a panel's — two overlays of one kind, four steps apart;
  `material` and `primeng` each declared `--gog-dialog-shadow` byte-identical to their own
  `--gog-panel-shadow`, so on both a modal had the elevation of a card; and the same panel sat at
  4px of lift on the light theme and 10px on the dark one, with nothing anywhere stating that a
  panel has two heights. None of the three is a value anybody typed wrong. They are what happens
  when a number has to be restated by hand in a tenth file.

  **The blur is three times the offset, and that number was measured rather than adopted.** The
  ruleset this comes from specifies two (`docs/component-geometry.md`, L10). Every shadow the
  library shipped disagreed: across 26 layers the ratio runs 1.33 to 6.00, the median is exactly
  3.00, and 16 of the 26 are 3.00 on the nose. It lands well — at the top step the blur is 48px,
  which is the dialog's own shipped blur to the pixel, so what moves there is the height and not
  the softness.

  **A theme keeps its character, because the style is three of the knobs.** `--gog-elevation-key-x`,
  `-key-y` and `-key-blur` are multipliers per unit of Z, and between them they cover every style
  in the package: leave them for a soft drop shadow, set the two offsets to a fraction and the blur
  to `0` for `bevel` and `ledger`'s hard offset, set `-key-y` to `0` and keep the blur and the key
  light becomes `terminal`'s phosphor glow — the ladder never learns what a glow is. `parchment`
  climbs at a quarter of the rate, because paper does not float. Three of the four styles reproduce
  their theme's shipped panel exactly.

  The hairline ring and the top-edge catch light are deliberately **not** part of a step, and
  compose over one instead (`var(--gog-elevation-ring), var(--gog-elevation-3)`). An `elevated`
  card on a dark ground must not have a ring — a ring is what `outlined` draws, and with it the two
  variants render identically, which was a real defect fixed in 21.7.1. Folding it into the ladder
  would have reintroduced it.

  `npm run check:elevation` is a CI step from the day it went green. It checks the things that
  actually drift rather than the ladder's arithmetic, which is asserted by construction: a theme
  declares all ten knobs or none, no shadow token may be hand-written unless it is a named
  non-height (an inset ring, an accent glow), and no preset may write a shadow at all.

- **`--gog-select-panel-radius` and `--gog-multiselect-panel-radius`.** Both default to
  `var(--gog-radius)`, so nothing renders differently — what changes is that the dropdown panel
  and the field it hangs from are now two boxes with two tokens. They had been one: the panel
  painted `--gog-select-radius` / `--gog-multiselect-radius`, the _field's_ radius, so a theme
  that rounded the control into a pill rounded the overlay into one as well. The filter input's
  radius and the option row's radius both derive from the panel's corner, so they followed it
  too. `gog-autocomplete` and `gog-datepicker` already declared this token; this is the pair of
  the four dropdowns on `GogDropdownBase` that did not.

- **`--gog-select-options-padding` and `--gog-select-option-radius`**, the interior the select's
  panel did not have. Its rows were full-bleed and square inside a rounded panel, while
  `gog-autocomplete` and `gog-multiselect` inset theirs by `--gog-space-4` and round them
  concentrically — three panels on one base, three interiors. The select now matches: a 4px
  gutter and a `max(0px, panel radius - gutter)` row, derived rather than restated so it stays
  true once `--gog-density` moves the padding.

### Changed

- **`one-light`'s pressed state was the same colour as its rest state.**
  `--gog-accent-dim` sat 0.023 of OKLCH lightness from `--gog-accent-color` — under the ~0.03 a
  flat area needs to read as different at all — so a pressed button and a field boundary looked
  like the rest state. Both values passed WCAG comfortably and were still the same colour, which
  is the whole argument for measuring in a perceptual space. Now `#1e53c6`, same hue and chroma,
  six hundredths of lightness down.

- **`terminal`'s info and success colours were the same green.** 4.6 degrees of hue and 0.032 of
  lightness apart, so an info badge could not be told from a success badge — and greyscale did not
  separate them either. `--gog-info-color` is now a phosphor cyan (`#4dd0e1`), 61 degrees from
  success and 98 from warning. The theme already signalled in red and yellow, so a second phosphor
  is the consistent answer rather than a departure from its character.

- **Eight focus indicators were nearly invisible and now read the accent.** `gog-checkbox`,
  `gog-radio-group` and `gog-multiselect` drew their `:focus-visible` outline from
  `--gog-accent-pale` — a wash, measured at 1.38:1 against the light page — and it was the only
  thing marking focus on those controls. `gog-chip` reached for `--gog-chip-border`, its
  decorative hairline, because it had a focus-ring width and offset but no colour;
  `gog-accordion`'s header read `--gog-accordion-hover-ring`, so a hover-weight colour was doing
  focus duty. Fourteen of the library's focus rings already read `--gog-accent-color`; these were
  the outliers. New tokens: `--gog-chip-focus-ring-color` and
  `--gog-accordion-focus-ring-color`. Visible, and meant to be: a focused checkbox now carries a
  solid accent ring where it had a pale halo.

- **`material` and `primeng` give their form fields a boundary that can be seen.** Both pointed
  `--gog-input-field-border` and four siblings at `--gog-border-color`, the decorative hairline,
  putting every text field, select, multiselect and checkbox edge at 1.18–1.62:1. Each now carries
  its own grey at the lightness that clears 3.2:1 against the harder of its two grounds, computed
  by `suggest:color` with hue and chroma held, so both themes keep their own neutral. The
  decorative token is untouched in both.

- **`gog-menu`'s panel sits at the dropdown tier instead of the dialog's.** Its shadow was an
  alias of `--gog-dialog-shadow` (`0 24px 48px`, alpha 0.5 on the base themes) while
  `gog-select`, `gog-multiselect`, `gog-autocomplete` and `gog-datepicker` all read
  `--gog-panel-shadow`. A menu is the same kind of object as those four — an overlay anchored to
  the control that opened it — so it now reads the same token they do, four steps down. Visible:
  an open menu is noticeably lighter, and matches a select panel opened beside it. Override
  `--gog-menu-shadow` to put it back.

- **`gog-chip`'s avatar is one ratio of the chip's type instead of five px values.**
  `--gog-chip-<size>-avatar-size` is `1.5em` at every size — 16.5 / 18 / 21 / 24 / 27px against
  the 14 / 16 / 20 / 24 / 28px it was. Those five were 1.27, 1.33, 1.43, 1.50 and 1.56 of the
  label's font size: one relationship with five opinions, drifting monotonically, which is what
  a value picked by eye per size looks like. 1.5 is the ratio `lg` already held, and it keeps the
  intent the rest of the component is built on — the avatar reads larger than the label and hugs
  the chip's leading edge, which is what `--gog-chip-avatar-inset-ratio` exists for. The tokens
  stay per-size, so an override of one keeps working.

- **`gog-chip`'s remove button is one ratio of the chip's type instead of five px values.**
  `--gog-chip-<size>-remove-size` is `1.125em` at every size — 12.4 / 13.5 / 15.8 / 18 / 20.3px
  against the 12 / 14 / 16 / 18 / 20px it was. Those five were 1.091, 1.167, 1.143, 1.125 and
  1.111 of the label: non-monotonic and inside a 7% band, which is the signature of a px ladder
  converted to `rem` rather than of five judgements. 1.125 is the ratio `lg` already held, and it
  keeps what all five values agreed on — the mark a reader can press reads a shade heavier than
  the one that only decorates. `lg` does not move and no other size moves by more than half a
  pixel. This completes the chip: avatar, icon and remove are now three ratios of one type scale.

  **The painted box is computed differently as a result**, and that is the part a theme override
  can notice. `.gog-chip__remove` reads the token as its own `font-size`, so the box could no
  longer restate the token — in every property but `font-size`, `em` resolves against the
  element's _own_ size, and the multiplication would have compounded the ratio against the size it
  had just produced. It is `calc(1em * var(--gog-chip-remove-scale))` now, which is the same
  length by construction and stays correct whether an override is written in `em`, `rem` or `px`.

- **`--gog-chip-<size>-icon-size` is `1em`.** Nothing renders differently: the five rem values it
  replaces were 11 / 12 / 14 / 16 / 18px against a label of exactly 11 / 12 / 14 / 16 / 18px, so
  the ratio was already 1.00 five times over — stated by hand rather than by rule. Writing it as
  `em` also means an override of a single size's font-size now carries its icon along, which the
  rem ladder did not.

- **The select's option list gained a wrapper element**, `.gog-select__options`, to carry the
  gutter above. On the scrolled content rather than on `gog-scroll` itself, which measures its
  host to size the thumb.

## [21.11.0] - 09.09.2026

### Added

- **`--gog-space-40`**, the one step the spacing scale was missing. Added because the optical ratio
  requires it rather than because a design asked for it: horizontal padding is exactly twice
  vertical, `slg` controls carry 20px of vertical padding, and the scale went 32 and then jumped to 48. It multiplies `--gog-density` like every other step.

- **`--gog-text-2xs` (0.6875rem, 11px)**, the step below `xs`. `gog-chip` and `gog-tag` had both
  written that value as a literal at `xsm` — the same number chosen twice, independently, which is
  a missing rung rather than two opinions. Nothing renders differently; a theme moving the scale
  now moves both with it.

- **A leading token for every block that sets a font size** — around forty-five of them, and the
  reason is law 4 rather than tidiness: a block that changes its size while inheriting its leading
  changes the ratio silently. A `--gog-text-xs` numeric table cell inside a `--gog-text-md` page
  inherited the page's leading and landed on a ratio nobody chose. Where the role is shared the
  token is shared: `--gog-field-line-height`, `--gog-field-label-line-height` and
  `--gog-field-error-line-height` are declared once and aliased by every field, the way the padding
  tier already works. Six roles, one leading each — the full table is in
  `docs/component-geometry.md`.

### Removed

- **`--gog-space-2`, `-6`, `-10`, `-14` and `-18` are gone from the spacing scale**, which is now
  ten steps and every one of them a multiple of 4. This is the end of the sweep rather than the
  start of it: the five could only come out once the last of their 102 readers had moved, and each
  of those moves is a component entry above.

  **Three lengths stay off the grid on purpose**, each with the reason in its own comment: a toggle
  thumb's 2px inset, a scrollbar thumb's, and the 2px gap between the resize grip's three
  hairlines. A length _inside_ a single painted mark defines that mark's shape rather than spacing
  two things apart — at 4px the grip's stripes are a 20px block in the corner of every textarea
  instead of a 9px hint. `--gog-focus-ring-offset` was never part of the scale and is unaffected.

  If your app reads one of the five, replace it with the neighbouring step: the library rounded
  **up** everywhere, because it had seventeen pointer targets under 24×24 and none over.

### Changed

- **`gog-tag`'s padding lands on the 4px grid, at a ratio of exactly 2.0.** Horizontal padding is
  twice vertical at every size, which is the library's optical-ratio law (`styling.instructions.md`);
  the tag had been running 3.00 at `xsm` down to 1.60 at `slg`, five different opinions about one
  shape. New values, per size: `4/8`, `4/8`, `8/16`, `8/16`, `12/24` (block/inline), with the gap
  following the block padding as before.

  **Two adjacent sizes now share a padding**, and that is the finding this first component
  produced rather than an oversight. Five _distinct_ vertical paddings on a 4px grid would have to
  run 4, 8, 12, 16, 20, which doubles `slg` and makes a tag the size of a button. So the size step
  is carried by the type scale — 11, 12, 14, 16, 18px — and the padding repeats between adjacent
  steps rather than the geometry inflating to keep five distinct numbers. Every sized component in
  this release follows the same rule.

- **The shared control tier is on the grid, at a ratio of 2.0.** `--gog-control-padding-y`/`-x`
  go from `10/14` (a ratio of 1.40) to `12/24`, and `--gog-field-md-padding-*` derives from them —
  so an `md` input, select, multiselect, autocomplete and datepicker are all padded by this one
  pair. `--gog-control-icon-offset` follows from 10px to 12px, which also moves the four
  `*-actions-inset` tokens that read it.

- **`--gog-control-checkbox-padding` is 8px, not 6px**, which is the padding a checkable control's
  `<label>` carries around its box. It is part of the pointer target rather than decoration: a
  12px `xsm` box inside 8px of padding is a 28px target, and that is how the smallest checkbox,
  radio and toggle clear WCAG 2.5.8 without the painted box growing at all. The literal fallback
  in `checkable-control.config.ts` moves with it — a fallback that disagrees with the token is a
  second default nobody can find.

- **`gog-panel`'s four off-grid lengths move to the grid** — `xsm` vertical padding 10 to 12,
  `sm` 14 to 16 with its gap 10 to 12, `md` 18 to 20. A surface like the card, and outside the
  optical ratio for the same reason.

- **`gog-scroll`'s thumb hit padding is 8px, not 6px** — the invisible band around the thumb that
  makes it easier to grab, so the grid moves it in the helpful direction. **The thumb's 2px inset
  stays**, for the same reason the toggle's does: a length inside a single painted mark defines
  that mark's shape, and 4px on a thin scrollbar would leave the thumb barely wider than the
  hairline it rides in.

- **`gog-slider`'s thumb has a 24×24 pointer target and still paints at 16px**, and its gap goes
  from 6px to 8px. This is the one control in the library a pointer _drags_, and a 24px dot would
  cover the value it points at. It stops at 24 rather than 2.5.5's 44 on purpose: the track is
  clickable along its whole length, so the coarse-pointer story is "tap the track", not "hit the
  thumb". The AAA gap is written down in the stylesheet rather than left implicit.

- **`gog-datepicker` and `gog-calendar` are on the grid, at a ratio of 2.0.** The calendar's
  footer buttons go from 4/10 (a ratio of 2.50, the only block in the library padded _too_ wide
  for its height) to 4/8; the time row's gap 6 to 8 and its input 4/6 to 4/8; the datepicker's
  actions gap 6 to 8 and its panel gap 2 to 4.

- **`gog-autocomplete`'s option row is 8/16 at a ratio of 2.0**, from 8/10, with its gap 10 to 12,
  the actions gap 6 to 8 and the panel gap 2 to 4. An option row is a control — it is what a
  pointer picks — so it takes the ratio while the panel holding it does not.

- **`gog-multiselect`'s panel chrome is on the grid** — the controls row 6/10 to 8/12, the
  actions gap 6 to 8, the filter row 6 to 8 with its input at 8/16 (a ratio of 2.0, from 1.33),
  the empty state 10 to 12, the `+N` overflow chip's gap 6 to 8, and the panel offset 2 to 4.

- **`gog-select`'s panel chrome is on the grid** — the filter row's padding 6 to 8, its input
  8/16 at a ratio of 2.0 (from 1.33), the empty-state padding 10 to 12, the clear button's gap 6
  to 8, the option row's gap 10 to 12, and the panel's offset from the field 2px to 4px.

- **`gog-dialog`'s header padding is on the grid** — its bottom side goes from 14px to 16px, so
  the header is padded 16/20/16 rather than 16/20/14.

- **`gog-menu`'s item padding is 8/16 at a ratio of 2.0**, from 8/12, and the panel's own gap
  goes from 2px to 4px. A menu item is a control — it is the row a pointer activates — so unlike
  the panel around it, the ratio applies.

- **`gog-tooltip`'s padding is 8/12, not 6/10** — on the grid. A bubble around text rather than a
  control, so it stays outside the optical ratio.

- **`gog-toast` is on the grid** — the stack gap 10 to 12, its own padding 12/14 to 12/16, the
  content gap 10 to 12, the action row's gap 6 to 8 and the close button's padding 2/4 to 4/8. A
  surface, so outside the optical ratio; its two buttons are controls and are checked as targets.

- **`gog-card`'s four off-grid lengths move to the grid** — `xsm` side padding 10 to 12 and its
  gap 6 to 8, `sm` side padding 14 to 16, `lg` gap 14 to 16. The card is **outside** the
  optical-ratio law and stays at roughly 1.2: it frames projected content rather than balancing a
  label, and 2.0 would give it twice as much padding at its sides as above.

- **`gog-table`'s cell padding is on the grid** — vertical `4/4/8/12/16` per size and horizontal
  16px, from `2/2/6/10/14` and 14. A row is 2 to 4px taller at every density. The table is
  deliberately **outside** the optical-ratio law: a cell's padding is row density and a column
  rhythm, not a label balanced inside a control, and 2.0 would put 32px between every column.
  The sortable header cell is still checked as a pointer target, which is where the law that
  applies to it lives.

- **`gog-tabs` is on the grid at a ratio of 2.0** — `8/16`, `8/16`, `12/24`, `16/32`, `20/40`
  (vertical/horizontal), from 1.67, 1.75, 1.50, 1.50, 1.40. `xsm` and `sm` now share a padding and
  are told apart by their type, as everywhere else in this release.

- **`gog-accordion`'s header is on the grid at a ratio of 2.0**, and it had the widest drift in
  the library: 2.00, 1.67, 1.40, 1.14, 1.00 — by `slg` the header was padded equally on all four
  sides, which is a box rather than a row. Now `4/8`, `8/16`, `12/24`, `16/32`, `20/40`. The body's
  two off-grid paddings and the three 2px content gaps move with it.

  **An `xsm` header is 24px tall**, up from 20. It grows rather than inflating a hit area because
  headers stack directly on one another: an invisible target reaching past the row would overlap
  the neighbouring header's, and two targets claiming the same pixels is worse than one small
  target.

- **`gog-chip` is on the grid at a ratio of 2.0, and it is the one component whose paint had to
  grow.** Padding goes to `4/8`, `4/8`, `8/16`, `12/24`, `12/24` (block/inline) and the gaps to 4,
  8, 8, 12, 12.

  **A chip is 24px tall at minimum now**, which adds 0.8px at `xsm` and nothing at any other size —
  `sm` measures 24.4px on its own. Everywhere else in this release an undersized target grew an invisible hit area and
  the paint stayed put; a chip cannot do that, because `.gog-chip__surface` clips — the ripple and
  the pill shape both need `overflow: hidden` — so a hit area larger than the surface is cut off at
  the surface's edge. The same line is what gives the remove button room: a 24px target inside a
  21px box is impossible for exactly the same reason.

  **The remove button's target is 24×24 while its glyph stays between 13px and 22px.** An X drawn
  at 24px inside a chip would be the loudest thing in it.

- **`gog-toggle`'s state chrome is on the grid** — the offset of the on/off state labels and the
  gap between a state label and the thumb both go from 6px to 8px. **The thumb's inset stays at
  2px**, deliberately and now with the reason written next to it: at 2px the thumb is 83% of a
  24px track, which is what makes a switch read as a switch, and 4px would take it to 67%. A
  length inside a single painted mark is not spacing between two things.

- **`gog-radio-group`'s two gaps are 12px, not 10px** — between a radio and its label, and
  between the options in a group.

- **`gog-checkbox`'s gap between box and label is 12px, not 10px** — its one length off the 4px
  grid.

- **The shared field tier is on the grid, at a ratio of 2.0.** Every text-bearing control that
  reads it — `gog-inputfield`, `gog-textarea`, `gog-select`, `gog-multiselect`, `gog-autocomplete`
  and `gog-datepicker` — is padded `4/8`, `8/16`, `12/24`, `16/32`, `20/40` (vertical/horizontal).
  It had run 2.00, 1.67, 1.40, 1.29, 1.11 across the five sizes, drifting further from the ratio at
  every step up; `slg` gains the most, from 20px of side padding to 40px. The icon offsets follow
  the same grid — `xsm` 6 to 8, `lg` 14 to 16, `slg` 18 to 20 — which moves where the clear button
  and the chevron sit inside a field.

- **`gog-button`'s padding is on the grid, at a ratio of exactly 2.0.** Horizontal padding is twice
  vertical at every size step: `4/8`, `8/16`, `12/24`, `16/32`, `20/40` (vertical/horizontal). It
  had run 2.00, 1.75, 1.67, 1.50, 1.40 across the five — monotonic drift, which is what per-size
  eyeballing looks like from the outside. **`xsm` does not move and every other size gets wider**;
  `slg` gains the most, from 28px of side padding to 40px.

- **Every `gog-button` carries a 24×24 pointer target, whatever its padding says.** A transparent
  `::before` centred on the button supplies the size when the button is short, and no painted edge
  moves. It is inert whenever the button is already big enough — which, it turns out, includes
  `xsm` at its own padding: 4 + 12 + 4 is 20, but the button draws a 2px border on each side and
  `box-sizing` is `border-box`, so it measures 24 in a browser. What the rule is actually for is a
  button whose padding has been overridden, like `gog-toast`'s own two, which land at 20px at any
  size class.

- **`gogBadge` hangs 8px outside its host's corner, not 6px.** The badge's one off-grid length, and
  the commit that had to settle the tie-break behind all of them: every off-grid step this library
  used sat exactly halfway between two grid steps, so snapping to 4px is a _direction_ rather than
  a rounding rule. It rounds up. Here that is also right on its own terms — a 20px badge clears the
  host's corner radius at `--gog-radius: 8px` at 8px of overhang, and did not quite at 6px.

- **`gog-autocomplete`'s option row is concentric with its panel at every density.** The radius was
  `calc(var(--gog-radius) - 4px)`, which is the right number only where `--gog-density` is 1: the
  4px it subtracts is the list's own padding, and that padding scales with density while a restated
  literal does not. It now reads the two tokens it is derived from, so at `--gog-density: 0.85` the
  corner is 4.6px rather than 4px and the gap to the panel stays constant. Nothing moves at the
  default density.

- **`gog-menu`'s item corner is 12px, not 8px.** The menu panel paints `--gog-panel-radius`, which
  is the base radius plus 8, and insets its items by `--gog-menu-padding` (4px) — so a concentric
  item corner is 16 − 4 = 12px, and the item had been repeating the base `--gog-radius` instead.
  At the default theme the first and last items were visibly squarer than the corner they sit in.
  `--gog-menu-item-radius` now derives from the panel radius and the padding rather than restating
  a value, so a theme that changes either carries the item with it.

- **`gog-multiselect`'s panel interior is concentric with the panel — two corners, both derived.**
  The option row went from 6px to 4px (8px panel, 4px of list padding), and **the filter input's
  corner is now square**. The second one looks like a value clamped to zero and is not: the filter
  is inset by 8px, which is exactly the panel's radius, and where the inset equals the radius the
  inner box's corner point lands on the centre of the outer arc — so a right angle is equidistant
  from the whole curve, and it is the only shape that keeps the gap constant. Both now read the
  panel radius and their own padding rather than restating a number, which is also what makes them
  hold at a density other than 1.

- **`gog-select`'s filter input has a square corner**, for the same reason the multiselect's does:
  it is inset by exactly the panel's radius, and at that distance a right angle is the only corner
  that stays an equal distance from the panel's curve. `--gog-select-filter-input-radius` derives
  from the panel radius and the filter padding rather than repeating `--gog-radius`.

- **`gog-scroll`'s thumb derives its corner from the track**, `--gog-scroll-track-radius` minus
  `--gog-scroll-thumb-inset`, where it had repeated `--gog-radius`. **No pixel changes today**: at
  both track widths (10px and 6px, less 2px of inset per side) either radius already exceeds half
  the thumb's width and renders as a full pill. It matters to a theme that raises `--gog-radius`
  on a wide scroller, where the thumb would otherwise carry the same corner as the track it sits
  inside.

- **`gog-accordion`'s chevron is a ratio of its header instead of a px ladder, and it fits its box
  now.** Ten literals become two: `1em` for the em basis and `1.4em` for the surrounding box.
  Writing it as a ratio surfaced two bugs the ladder had hidden. It was **px beside a label in
  `rem`**, so raising the browser's text size grew the label and left the chevron where it was —
  and its box/label ratio drifted 0.92 to 1.29 across the five sizes. And **the glyph overflowed
  its box at every size**: the font-size token is the em basis for the `gog-icon` inside, which
  renders at 1.2em of it, so a 21.6px mark sat in a 20px box. The chevrons at `xsm`, `sm` and `md`
  are identical now, because those three sizes all label with `--gog-text-xs` and the chevron
  ladder was the only thing distinguishing them.

- **`--gog-panel-heading-line-height` is `snug` (1.3), not 1.25** — the one leading in the library
  outside `--gog-line-height-*`, which runs 1.2 then 1.3 with nothing between.

- **Eight literal `line-height` declarations in component stylesheets now read tokens**, so a theme
  can reach them at all: the checkbox and input icons, the three clear buttons, the toggle's state
  label and the textarea's own field, which is the one place the library renders a paragraph the
  consumer typed. The dialog's was dead code — its close button already read the token two lines
  below.

- **`gog-tooltip`, `gog-menu` and `gog-toast` cap themselves against the viewport.**
  `--gog-tooltip-max-width`, `--gog-menu-max-width` and `--gog-toast-max-width` each become
  `min(<cap>, calc(100vw - <margin> * 2))` — an overlay positioned against the screen itself rather
  than a container, where "no wider than the screen" is what the component is for. The margin reads
  the component's own edge-inset token where one exists (toast's `--gog-toast-stack-padding`)
  rather than a new one; menu and tooltip, which have none, read `--gog-space-16` directly.

  **`gog-confirmation-dialog` deliberately does not get one**, though an earlier draft of this
  release gave it one: it renders inside `.gog-dialog__panel`, which already defaults to `90vw`,
  and the dialog body pads 20px a side inside that — so the width available to it is
  `0.9 * 100vw - 40px`, tighter than any `100vw - margin` clamp above an 80px viewport. The clamp
  could never bind, and an inert declaration is worse than an absent one. Its cap is the measure
  alone. The three dropdown panel widths (`autocomplete`/`select`/`multiselect`, 420px) are
  unchanged for a related reason — each already tracks its trigger field's own width via
  `min-width: 100%`.

  **A `min-width` outranks a `max-width`, so each overlay's own floor still decides below a
  certain width**, unchanged by this release: menu at 212px of viewport, toast at 312px — both
  narrower than any device in use.

- **Three caps move from `px` to `ch`**: tooltip `43ch`, toast `53ch`, the
  confirmation dialog `51ch` — each the nearest whole character to what the cap already rendered,
  so a consumer raising the relevant font-size token now widens the bubble with it instead of the
  text silently dropping from 47 characters a line to 30. Menu stays in `px`: its items do not
  wrap, so a character measure would be measuring nothing. `docs/component-geometry.md`, "D7 —
  taken", has the survey and the reasoning, including a live-caught bug in the fix itself: `ch`
  resolves against the font of the element `max-width` is declared on, not a descendant's, which
  toast's own message/container split got wrong on the first pass.

### Fixed

- **`gog-dialog`'s title now states its own size.** `.gog-dialog__title` (the library's only
  `<h2>`) declared neither `font-size` nor `line-height`, so it rendered at the browser's default
  24px bold rather than a token. `--gog-dialog-title-font-size` reads `--gog-text-xl` — exactly
  today's rendered size, so nothing changes visibly — and `--gog-dialog-title-line-height` reads
  `--gog-line-height-snug`, law 4's `heading` role. A theme raising `--gog-text-xl` now resizes the
  dialog title with it, which it previously could not.

- **`gog-confirmation-dialog`'s title and description now read the type scale.** Both carried a
  dead utility class (`heading-md`, `body-sm`) with no CSS rule anywhere in the library, so the
  title rendered at the browser's default `<h3>` size (18.72px) and the description at the
  inherited 16px, neither following `--gog-text-*`. The classes are removed; the title now reads
  `--gog-text-lg` (18px, the nearest step to what already rendered — a dead class named `md` is
  not evidence it was meant to be one) and the description reads `--gog-text-sm` (14px, a visible
  2px shrink, the size every other muted secondary line in the library already uses). A theme
  moving the scale now moves both with it. `--gog-confirmation-dialog-max-width` (51ch) is
  unaffected — a `ch` cap resolves against the font of the element `max-width` is declared on
  (`.confirm-dialog`), not the description's, so the cap's pixel width does not change; only the
  measure it produces against the now-smaller description does, and it stays in L9's 45–75 band.

### Documentation

- **Every class a library template applies to its own markup is checked for the `gog-` prefix**
  (`npm run check:class-names`, a CI step). The confirmation-dialog defect above is exactly what an
  unprefixed class can hide: two utility classes with no CSS rule anywhere in the library. The
  check does not require every class to have a rule — roughly 50 of the library's own state and
  behaviour hooks (`gog-scroll--dragging`, `gog-select--floated`, …) legitimately have none — only
  that it be named as this library's own rather than a name that looks borrowed or invented in
  passing. Two legacy unprefixed names on shipped components (`confirm-dialog*`, `slide-left`) are
  named exceptions rather than renamed, since a rename there is a consumer-visible class change.

- **The icon set is verified centred, and the audit reversed the rule it was written for.** All 41
  built-in glyphs now pass a check (`npm run check:geometry`, second half): a glyph centres its ink
  in its own viewBox, so that centring the box centres the mark. Nothing moved — every glyph
  already passed, to within a hundredth of a unit horizontally.

  The audit is the interesting half. The rule had been planned against the ink's **centre of
  mass**, and by that measure the set looks broken: `arrow-right`'s mass sits 2.05 units right of
  centre and `download`'s 3.47 units low, on a 24 grid. Neither is a defect. A directional glyph is
  _supposed_ to carry its mass toward its head, and re-centring one would pull its tail off the
  edge of the box. What the eye reads in a uniform-weight set is the extent, so the extent is what
  is checked — with one branch for a **filled** mark, where a solid triangle's centroid genuinely
  sits a sixth of its width off the box centre. The registry has one filled glyph (`star-filled`,
  0.51 low) and that branch is what would catch a play triangle the day one is added.

- **`README.md` carries the recipe for making the library fluid**, which it had never stated and a
  consumer had to derive: the two-point linear interpolation, worked, applied to the root font size
  (the type scale is in `rem`, so one `clamp()` moves all of it) — with the reason the intercept
  belongs in `rem` rather than `px`, which is WCAG 1.4.4. It also says plainly why the library
  itself ships zero `clamp()`, zero `vw` and zero breakpoints, and how to carry the spacing scale
  along if you want gaps to grow with the type.

- **`AGENTS.md`'s dropdown section says when to turn `filter` on**, and the narrower half of the
  rule that most quotations of it drop: choice time grows with the log of the option count, so a
  panel past roughly seven options wants a filter — _unless_ the list is one the reader can
  predict, in which case they are searching rather than choosing and ordering it well is worth as
  much. `GOG_CONFIG.dropdown.filter` sets it once for an app.

- **`README.md`'s fluid-sizing section is corrected, and it was wrong before this release as well
  as after it.** It said the library ships zero `clamp()`, zero `vw` and zero breakpoints. The
  overlay caps above made the first half false; the second half had never been true — a dialog
  panel has defaulted to `90vw` and `--gog-dialog-max-height` to `90vh` for as long as both have
  existed, `gog-menu` falls back to `100vh`, and `gog-table`'s `maxHeight` takes `'60vh'` as its own
  documented example. The section now scopes the claim to _component sizing_, lists every viewport
  unit the library actually contains, and says why none of them is the recipe beside it: the recipe
  grows a size with the viewport, these only ever cap one against it.

  Worth keeping for the shape of the mistake rather than the fact: the claim was checked by
  grepping `.css` and `.scss`, and every counterexample but one lives in exactly those files. The
  one that does not — the dialog panel's `90vw` — is an inline `[style.max-width]` binding in a
  template, and it is the one that mattered, because it is what makes a clamp on the confirmation
  dialog unable to bind. `npm run survey:measure` now inventories viewport units across CSS, SCSS
  **and** templates, so the next such claim is measured rather than recalled.

## [21.10.0] - 05.09.2026

### Added

- **`gog-progressbar` marks where its fill ends**, with two hairlines rather than a colour
  difference — `--gog-progressbar-edge-color` (the theme's ink, outermost, against the track),
  `--gog-progressbar-edge-backing-color` (the surface colour, inside the fill) and
  `--gog-progressbar-edge-width`, 1px each. Both are inset shadows on the fill, so they cost no
  layout and cannot push a 100% bar past its own track, and they flip end under `dir="rtl"`
  through `--gog-direction-sign`.

  **The boundary is the value.** `showValue` is `false` by default, so nothing else states it, and
  WCAG 1.4.11 asks 3:1 of the part of a graphic that carries its meaning. The fill and track could
  not carry it: 51 of the 55 shipped fill/track combinations were under 3:1, and that is not a
  palette bug — the five fills straddle mid-luminance in every theme, so a track dark enough for
  the amber warning lands on the blue info. Sweeping the entire `--gog-text-color`-to-
  `--gog-border-color` axis, the best achievable worst-fill ratio is 1.58 to 3.45 per theme, and
  only `primeng` clears 3:1 at all.

  One marker tone does not work either (`--gog-surface-color` is 1.79:1 on `material`'s warning
  fill, `--gog-text-color` 1.06:1 on `one-dark`'s success). Two do, and `check:contrast` gates them
  as a pair: every neighbour — the track and all five fills — must clear 3:1 against the better of
  the two tones. Worst case across the eleven themes is 3.25:1.

  Found by rendering the component in greyscale, which is what a reader with achromatopsia sees:
  on `primeng`, success, warning and info had no visible boundary at all. The showcase's
  progressbar page carries that comparison as a toggle.

### Fixed

- **`GOG_CONFIG.spinner.component` now reaches `gog-spinner-overlay`.** The overlay forwards its
  own `variant` to the spinner it wraps, and that input defaulted to `'runic'` rather than to
  nothing — so the spinner inside read it as an instance asking for the built-in look, and the
  config, whose rule is that an explicit `variant` outranks it, correctly stepped aside. An app
  that had set a house spinner got it everywhere except on the one component it reaches for to
  cover a whole region while it loads. `variant` is now `GogSpinnerVariant | undefined` and
  defaults to unset, so "asked for nothing" survives being passed down; `size` and `ariaLabel`
  keep their defaults, having no config key to fall through to.

  Nothing changes for an app that configures no spinner: an overlay with no `variant` still
  renders `runic`. The type widens rather than narrows, so a binding that passes a
  `GogSpinnerVariant` still compiles; only code that _reads_ `overlay.variant()` now has to
  account for `undefined`.

  Found from the documentation side rather than from a report — the same way 21.8.0's four
  under-reported `GOG_CONFIG` keys were. `spinner-config.spec.ts` had mounted only `gog-spinner`
  and `gog-button`, which is why every test passed over a key that missed a third of its targets;
  it now mounts an overlay too, in four cases.

- **A disabled toggle button keeps its ring.** `.gog-btn[aria-pressed='true']` carried a
  `:not(:disabled)` guard, copied from the hover and press rules above it where the guard is
  correct. It is not correct here: `disabled` on a real `<button>` does not remove `aria-pressed`,
  so a disabled toggle announced itself as on and looked exactly like the off one beside it —
  which is the WCAG 1.4.1 failure the ring was added to prevent, in the one state nobody looks at.
  `gog-chip`'s `selected` ring never had the guard, and `docs/backlog.md` had the asymmetry filed
  with the chip named as the correct side; this settles it that way. The disabled opacity dims the
  ring with the rest of the button, which is the right amount of "unavailable".

  The guard was also paying for something invisible: it made the rule (0,3,0), level with
  `:hover:not(:disabled)`, which is what lets the ring survive a pointer by source order. The
  selector is now `.gog-btn.gog-btn[aria-pressed='…']` — the same doubled class `:focus-visible`
  and `:disabled` already use, which restores that and protects the state from a consumer's
  single-class rule.

  **`check:state-specificity` did not catch the weakened rule when it was tested against it**, and
  that turned out to be two bugs in the check: `[aria-pressed` was not in its list of states, and
  its specificity arithmetic read a quoted attribute value as an element name, floating
  `.gog-btn[aria-pressed='true']` from (0,2,0) to (0,2,1) — over the consumer floor it is there to
  enforce. Both fixed, `:not()` no longer counted as a class of its own, and the function now
  self-tests against eight selectors on every run, because a specificity check that miscounts does
  not fail loudly: it passes a rule it should have caught.

- **Five WCAG AA failures on shipped variants**, none of which any check had ever looked at.
  `check:contrast` took its pairs from rules that set `color` and `background-color`, and a variant
  class in this library sets neither — `.gog-tag--danger` re-points `--gog-tag-variant-color`,
  `.gog-btn--outline` re-points `--gog-button-variant-*`, and one painting rule reads that layer
  through a `var()` chain. The script now resolves the indirection (and a rest state with no
  modifier at all, which nothing measured either), taking it from 1155 pairs to 2187. What it
  found:

  - **`gog-tag`'s label was mixed toward literal `black`, at 82% of the status hue.** That is a
    light-theme assumption twice over: on a dark theme it darkened a label already sitting on a
    dark ground, and on a light one 18% of black cannot bring a bright hue down to text contrast.
    Eleven of the 55 shipped combinations were under AA — `one-dark`'s danger at 3.11:1,
    `material`'s warning at 2.49:1, `primeng`'s success at 3.06:1. `--gog-tag-color-base` is now
    `var(--gog-text-color)` so the mix follows the theme, and `--gog-tag-color-mix` is 50%: the
    same ratio, and the same argument, as `--gog-button-<status>-ink`. Worst pair is now 4.67:1.
    **This changes how every status tag looks** — the label is a softer, inkier version of its
    hue, and the background is untouched.
  - **The table's header labels** were the raw accent on a tinted strip: 4.15:1 in `light`, 4.32:1
    in `one-light`. `--gog-table-accent-color` now mixes 20% of the page's ink into the accent
    inside the `@supports` block, which lifts every theme (worst 5.09:1) and keeps the accent
    identity the header is drawn in. The flat fallback stays the raw accent.
  - **`slate`'s secondary button** filled with Tailwind sky-500 under a white label: 2.77:1.
    sky-600 does not clear either (4.10:1), so `--gog-secondary-color` moves two steps to sky-700
    — the same move the theme's three status colours made in 21.9.0.

  A false positive is recorded rather than silenced: `.gog-checkbox__box` states the tick's colour
  and the _unchecked_ box's background in one rule, and those never render together, so the sweep
  read 1.00:1 in `ledger`. It is the one entry in the script's `REST_PAIRS_NOT_RENDERED` list, and
  the pair that does render — the tick on the checked background — is measured and passes.

  `token-color.mjs` learned two things it needed for this: a `color-mix()` percentage that is
  itself a token (`--gog-tag-color-mix: 82%`), and the named colours `black`/`white`. Without them
  `gog-tag` resolved to nothing at all and its nine variant pairs were skipped in every theme —
  the checker failing open, which is the failure mode this change exists to remove.

### Documentation

- **`gog-table` is named among the spinners `GOG_CONFIG.spinner` reaches**, in `AGENTS.md` and in
  `GogGlobalConfig`'s own JSDoc. It renders a bare `gog-spinner` in place of its rows and has
  always honoured both keys; it appeared in no "Applies to" sentence because it reads no config
  itself, so a grep for readers never finds it. Documentation only — the behaviour was already
  correct, which is exactly what makes this class of defect quiet.

## [21.9.1] - 04.09.2026

### Fixed

- version and commit history

## [21.9.0] - 04.09.2026

### Added

- **`gog-button` and `[gogButton]` gain `severity`.** `severity` says what the action means;
  `variant` says how loudly it is drawn. The two are orthogonal, which is the whole design: this
  is not a fifth variant but a re-pointing of the colours all four are built from, so
  `variant="ghost" severity="danger"` is a quiet delete and `variant="primary" severity="danger"`
  a loud one. `'accent'` is the default and the absence of a claim — an existing button emits no
  new class and renders byte-for-byte as before. The `GogSeverity` union is shared with
  `gog-progressbar`, whose `GogProgressbarVariant` is now an alias of it.

  Two colour rules came out of measuring rather than choosing. A **filled** severity button's
  label is `--gog-<status>-text-color`, and hover and press deepen the fill _away_ from it via
  `--gog-<status>-shade`, so every state makes the label easier to read rather than harder — the
  first attempt deepened toward the page's ink unconditionally and cost `primeng`'s info button
  6.44:1 down to 4.23:1 on press, because there the label _is_ the ink. A **transparent** one's
  label is `--gog-button-<status>-ink`, the status hue mixed halfway toward the ink, because the
  raw hue is legible body text in only five of the eleven shipped themes; the 50% is the binding
  case (`material`'s amber) rather than a round number. All four severities, four variants and
  every state are gated by `check:contrast` — 1155 pairs across 11 themes, all passing.

- **A status colour is three tokens now, not one.** `--gog-<status>-color` is the fill;
  `--gog-<status>-text-color` is the label that reads on it, the way `--gog-accent-text-color`
  already did for the accent; and `--gog-<status>-shade` is the direction hover and press deepen
  in. Both new ones default to the accent's answer, so a theme states them only where its own hue
  disagrees — and the defaults are what nine of the eleven shipped presets still use. If you write
  a theme, this is the contract to know: setting a status colour alone is how a bright amber ends
  up under white text, which is exactly the defect in the Fixed section below.

- **`gog-scroll` gains `horizontalWheel`, so a vertical wheel can scroll a horizontal row.**
  Hover a horizontal-only region, turn the wheel, and the page moves instead — the browser's own
  behaviour, and the thing consumers report about this component most. The component draws an
  overlay thumb over native scrolling and had deliberately never touched wheel handling; this is
  the narrow exception, opt-in.

  It acts only when all of this holds: the viewport cannot scroll vertically (checked against
  live geometry, not the `axis` input, so `axis="both"` still scrolls down while there is down to
  go), the event carries no horizontal delta of its own (a trackpad swipe and `Shift`+wheel
  already work and translating on top would double them), `ctrlKey` is clear (pinch-zoom), and
  there is room left in the direction of the turn. **The last one is most of the feature:** at the
  content's end the event is left alone, so the page picks it up exactly as before. A region that
  swallowed the wheel at its own end would leave the page feeling stuck, which is a worse bug than
  the one being fixed. `overscrollBehavior: 'contain'` still contains — that boundary is the
  browser's and this never reaches past it.

  Off by default, because it changes what an existing instance does with a gesture it currently
  passes on; `GOG_CONFIG.scroll.horizontalWheel` turns it on app-wide. A line-mode delta (what
  Firefox sends) is scaled rather than applied raw, which would have moved the content three
  pixels per notch.

- **`gog-chip` gains `selected` — the filter chip.** A row of chips you toggle on and off could
  not be built from this component: it had `clickable` and `removable`, so a chip could be pressed
  or dismissed, but nothing said "this one is on". `[(selected)]` is that, and it is tri-state
  because the alternative would have changed every chip that already ships. `null`, the default,
  is not a toggle at all — no `aria-pressed`, no selected look, activation emits `gogClick` and
  nothing else. `false` is a toggle that is off, and states it: a chip with no `aria-pressed` is
  not a toggle to a screen reader, so "off" has to be said rather than left absent. `true` draws
  an inset ring, `--gog-chip-selected-shadow`.

  The look and the semantics ship together on purpose, which is the whole reason this waited:
  forwarding `aria-pressed` alone would have let a chip announce itself as on while looking
  identical to an off one — WCAG 1.4.1 from the other side, and the exact trap `gog-button` was
  in between 21.8.0 and 21.9.0. A ring rather than a fill for the same reason as the button's:
  `:hover` and `:active` already own this surface's background, so a selected chip painted with a
  fill would lose the one thing saying it is on the moment the pointer arrived.

  It is a `model`, so the chip flips it on click, Enter and Space and a filter row needs no click
  handler. `gogClick` still fires, after the flip, so a handler reading `selected()` sees the new
  value. A `disabled` chip keeps the ring and drops `aria-pressed`, which needs the `role="button"`
  a disabled chip does not carry — "on, and currently unavailable" is a real state, and hiding it
  would leave it announced and invisible. `check:contrast` gained the ring against both the hover
  and the press background, at 3:1 (WCAG 1.4.11, a boundary rather than text); all 11 themes pass.

- **`GOG_CONFIG.spinner.component` — one line replaces every loading indicator in the library.**
  Passing a component, not a value: it is rendered through `NgComponentOutlet` in place of the
  built-in look, wherever the library draws a spinner. That includes the two places a consumer
  could not reach at all — `gog-button` and `gog-autocomplete` render `<gog-spinner>` from their
  own templates and expose no input for it, so a house loader had no way in. It sits inside the
  same size wrapper as the built-ins, keeping the sizing, the overlay behaviour, `role="status"`
  and the accessible name; only the visual changes.

  Precedence is the library's usual instance-then-config-then-default, and the wrinkle is stated
  because it is the one people will ask about: an instance's own `variant` outranks both config
  keys, so `<gog-spinner variant="ring">` stays a ring in an app that has set a component.
  `spinner.variant` is there for an app that only wants to switch between the two built-ins.

  `variant` is therefore `GogSpinnerVariant | undefined` now, resolving through the same
  `resolveConfigured` chain as every other configurable input. `variant="custom"` with projected
  content is unaffected.

### Fixed

- **Leading is a character axis too: `--gog-line-height-none|tight|snug|normal|relaxed|loose`.**
  Twenty component tokens held a bare number — seven of them the same `1.4` — so roomier text
  meant finding and re-listing every one. Same values, nothing moves. `gog-panel`'s heading keeps
  its own `1.25`, off the scale on purpose the way an 11px chip is off the type scale, and rule G
  covers the family so the next bare number fails the build.

- **`--gog-control-clear-icon-ratio`: one number, not five.** The clear (×) button's glyph is the
  same part in `gog-autocomplete`, `gog-datepicker`, `gog-inputfield`, `gog-multiselect` and
  `gog-select`, and each carried its own `0.7`. `gog-textarea` keeps its own `1`: its clear
  button sits in a corner rather than in the field's icon row, which is a different problem and
  a different number.

- **Weight is a character axis now: `--gog-font-weight-medium|semibold|bold|heavy`.** Fifteen
  component tokens held a bare `500`/`600`/`700`/`900`, so a house style that wanted lighter
  chrome had to find and re-list every one — 21.7.0's character layer unified casing and tracking
  and stopped short of this. Same values, nothing moves; what changes is that four tokens now
  reach all fifteen. Four steps because four are used: no `normal`, since nothing in the library
  paints 400 and an unused token is API nobody asked for. `check-tokens` rule G covers the family,
  so the next bare number fails the build.

- **`--gog-z-base`: the whole stacking order moves as one.** `badge`, `toast`, `dropdown`
  (which dialogs and menus read), `tooltip` and the blocking `spinner-overlay` were five
  unrelated literals — 1, 100, 300, 400, 8000 — so an app that had to lift the library above its
  own chrome edited five tokens and hoped it had found them all. Each is `calc(var(--gog-z-base) +
N)` now: the numbers are unchanged at `--gog-z-base: 0`, and setting it to 10000 gives
  10001/10100/10300/10400/18000 — the same order, one number. The gaps are deliberate, so an app
  can still slot its own element between two library layers.

- **One disabled level, not four.** `--gog-disabled-opacity` (0.4) is read by nine components,
  while `gog-accordion`, the `gog-select` and `gog-multiselect` option rows (0.5) and `gog-chip`
  (0.55) each carried their own. One state should not have four opinions, and the three
  stragglers were invisible to rule G by construction — it flags a literal only when the value
  _matches_ the token's. **This is a visual change**: those four fade slightly further now.

- **The type scale gained the step it was missing: `--gog-text-slg` (1.25rem).** `gog-button` and
  the field controls both needed a size for their `slg` variant, the scale went straight from
  1.125rem to 1.5rem, and both wrote `1.25rem` as a literal — the same value chosen twice,
  independently, which is a missing rung rather than two opinions. Both read the token now, and
  rule G lists it, so the next component that wants 20px type cannot re-invent it. Named for the
  control size it serves rather than continuing the t-shirt run, because that is what asked for
  it.

- **Sixteen component font sizes now read the type scale, and rule G covers it.** A theme that
  retuned `--gog-text-*` moved most of the library and left `gog-button`, `gog-chip`, `gog-tag`,
  the dialog's close button, the toast's action and close, and the toggle's `lg` state label
  behind — each held a literal that was byte-for-byte a scale step (`--gog-button-md-font-size:
1rem` sitting beside `--gog-text-md: 1rem`). Same values, so nothing moves in any theme; the
  difference is that retuning the scale now reaches them.

  `check-tokens` rule G covered radii, strokes, casing and tracking but **not** font size, which
  is how sixteen of them accumulated. It does now, and the thirteen remaining literals are right
  to be literals: five are the accordion chevron's px ramp, and eight are off the scale on
  purpose — `slg` is 1.25rem in two components because the scale has no step between 1.125 and
  1.5, an 11px chip sits deliberately below `xs`, and the toggle's state label has its own
  four-step micro-ramp. Rule G flags only an exact match, which is precisely what keeps those
  out of it.

- **Three clear buttons ignored the theme's corner radius.** `--gog-input-clear-radius`,
  `--gog-select-clear-radius` and `--gog-multiselect-clear-radius` were a flat `2px`, so a theme
  that set `--gog-radius` moved every corner in the library except these. They are
  `calc(var(--gog-radius) / 4)` now: identical at the default 8px, so nothing moves in `light` or
  `dark` — but `bevel`, whose whole identity is square corners (`--gog-radius: 0`), had three
  quietly rounded controls and now does not.

  Found by counting rather than by looking: of 47 radius tokens, 30 already derived from
  `--gog-radius`, 8 are pills or circles (a shape, not a corner size), 5 are deliberately flat,
  and these 3 were the remainder. `check-tokens` rule G could not have caught them — it flags a
  literal only when its value _equals_ a character token's, which is what keeps a pill's `999px`
  from being called drift, and is exactly why a small arbitrary number is the shape of drift it
  cannot see. `gog-toast` and `gog-accordion` keep their flat corners, on the user's call: those
  are a chosen shape.

- **Error text was below WCAG AA in four themes.** `--gog-danger-color` is what every
  `--gog-<block>-error-color` resolves to, so it is the colour a validation message is printed in
  — text, needing 4.5:1, not the 3:1 a status accent gets away with. It cleared neither ground in
  `one-light` (3.51:1 / 3.67:1), `primeng` (3.60 / 3.76), `one-dark` (4.38) or `slate` (4.46).
  Each preset's red moves the smallest distance that clears 4.6:1 on both the page and a card:
  `#e45649`→`#c2493e`, `#ef4444`→`#ce3a3a`, `#e06c75`→`#e2737c`, `#dc2626`→`#d82525`.
  `check:contrast` gained the pair in the same change — it had none for `danger` at all, which is
  why a field error nobody could read was invisible to it. Found by pointing the new
  `check:app-contrast` at `ui-showcase`, which renders the library from source.

- **A toggle button now looks toggled.** 21.8.0 taught `gog-button` to forward `aria-pressed`,
  and nothing in the library styled it — so a toggle could announce itself as on to a screen
  reader while looking identical to an off one, which is WCAG 1.4.1 from the other side and
  exactly the reason `docs/backlog.md` gives for _not_ forwarding `aria-pressed` to `gog-chip`.
  `aria-pressed="true"` (and `"mixed"`) now draws an inset ring: new
  `--gog-button-<variant>-toggled-shadow`, with `--gog-button-toggled-shadow` as the per-instance
  override. A ring rather than a fill because `:hover` and `:active` already own the background —
  a toggled button that lost its state the moment the pointer arrived would be the same bug one
  layer down. It keys off the attribute, not an input, so `[gogButton]` on your own element gets
  it from the `aria-pressed` you already wrote there.

- **A button pressed with animations off now shows that it was pressed.** `:active` was a
  `transform: scale()` and nothing else, and the `prefers-reduced-motion: reduce` block switched
  that transform off — so the reader most likely to need the feedback got none at all. The ripple
  did not cover it either: it is off by default, and it is deliberately suppressed under reduced
  motion because it genuinely is decoration. `:active` now also deepens the button's background,
  one step past its own hover so a press is distinguishable while hovering, and reduced motion
  drops only the movement. New per-variant `--gog-button-<variant>-press-bg`/`-press-color`
  tokens and the usual `--gog-button-press-bg`/`-press-color` instance overrides. **Ghost presses
  to a filled `--gog-accent-dim`, like outline, rather than to a wash** — checked across all 11
  themes, and a wash cannot work there: ghost's own _label_ is the accent, so tinting its ground
  with the accent walks the two together, and a 24% wash put the label under 4.5:1 in seven
  themes. A filled press moves the label to `--gog-accent-text-color`, the pair `check:contrast`
  already gates, so no future theme can quietly break it. Reduced motion must remove the animation, not the
  information — the same rule the toast countdown was fixed under in 21.7.1.

  The family is spelled `press`, not `active`, because `active` already means two different
  things in this library — `--gog-tabs-active-color` is the _selected_ tab, while
  `--gog-scroll-thumb-active-bg` is the thumb being dragged. One name, one meaning. The shipped
  `--gog-button-active-scale` keeps its spelling: renaming a token consumers already override
  needs a deprecation cycle, and this is a patch.

- **`check:contrast` now measures composited washes, and found 24 more failures.** The script
  compared palette hexes, so any pair where one side was a `color-mix()` wash was invisible to it
  — which is both of the button failures above, found by hand instead. New `scripts/token-color.mjs`
  resolves a component token the way a browser does (the theme's own block, then the `@supports`
  mixed layer, then the derived layer, then the literals), composites it over the ground that
  component actually sits on, and the check measures the label against that. 385 pairs across the
  11 themes, up from 143.

  It then grew a second half that needs no table at all: `collectStatePairs` reads the compiled
  stylesheets and checks every label/ground pair the rules themselves state, so a component added
  later is covered without anyone remembering to list it. **627 pairs** in total now. That sweep
  found one further real failure across the whole library — `gog-autocomplete`'s **selected
  option** label, `--gog-accent-color` on its own tint, 4.12:1 in light (and `--gog-accent-dim` is
  worse again, 3.77:1 in one-dark). It is `--gog-text-color` now; the tint and `aria-selected`
  still mark the row, and `gog-select` keeps its accent label because its selected option has no
  tint behind it. Icons are held to 3:1 rather than 4.5:1, which is what keeps a spin-button glyph
  and a panel chevron — 4.35:1 and 4.40:1, both correct — from being "fixed" into near-black.

  Its first run failed 24 of them, all real, and all fixed here:

  - **A pressed tab's label leaves the muted tone.** A resting tab is deliberately
    `--gog-muted-text-color`, which has no headroom to spend on a tinted ground: 3.24:1 in
    one-dark and under 4.5 in six more. New `--gog-tabs-press-color`, the full text colour — which
    is what pressing a tab is about to make it anyway.
  - **An accordion header's label stops turning accent while hovered or held.** It took
    `--gog-accordion-accent-color` on an accent-tinted strip: 3.61:1 in light, 3.79:1 in one-light,
    4.09:1 in ledger, and worse once the press deepened the tint. New `--gog-accordion-hover-color`,
    defaulting to the header's own text colour; the lift is carried by the background alone. The
    same trade as the ghost button's hover, for the same reason.
  - **The press wash is 20%, not 22%.** Measured rather than chosen: at 21% one-dark's mid-grey
    text falls under 4.5:1 on three of the surfaces. 20% is the strongest wash that clears AA in
    every theme, and it is still a clear step past the 10-12% hover.

- **A ghost button's label was under WCAG AA on its own hover, in three themes.** `light`
  3.94:1, `primeng` 4.18:1, `one-light` 4.22:1. The variant's resting label _is_
  `--gog-accent-color` and its hover tints the ground with the same accent, so the two walked
  toward each other. **No background fixes it**, which is why this took a sweep rather than a
  nudge: a half-strength wash (4.28), a neutral `--gog-hover-color` (4.15), a text scrim (3.91)
  and an accent-dim wash (3.96) were all measured across the 11 themes, and `light` fails every
  one — `--gog-accent-color` as _text_ on that theme's background is 4.60:1 to begin with, so
  there is no headroom to spend on any ground at all. The label now becomes `--gog-text-color`
  while hovered, which clears 5.29:1 at worst (one-dark) and leaves the wash untouched, so the
  hover stays the subtle one this variant is documented to have. Ghost's three states now read
  transparent → tinted → filled, with a label chosen for each ground rather than one label
  hoping to survive three.

- **`bevel` had no accent ramp, so its buttons could not show a press.** That preset declared
  `--gog-accent-dim: #000080`, byte-identical to its `--gog-accent-color`. Harmless while `dim`
  was only a field border; once it became the pressed fill, a pressed button in `bevel` painted
  itself the colour it already was. Nothing failed — the token existed, resolved and passed every
  contrast pair. It is now `#00005c`, and **`check-tokens` rule I was widened from the surface
  tiers to any ramp**, so a theme whose rest/hover/press tones collapse into each other fails the
  build instead of shipping a state nobody can see. Found by sweeping all 11 themes rather than by
  the check that now catches it.

- **The other nine pressable surfaces had no press feedback either — now eight of them do.**
  `.gog-btn:active` turned out to be the _only_ `:active` rule in the library. `gogMenuItem`,
  `gog-chip`, `gog-tabs` headers, `gog-accordion` headers, `gog-button-toggle-group` options and
  the `gog-select` / `gog-multiselect` / `gog-autocomplete` option rows all acknowledged a press
  through the ripple alone — which is off by default and suppressed under reduced motion — so a
  default-configured app confirmed a press nowhere at all. Each now paints
  `--gog-<block>-press-bg`: a wash roughly double the 10-12% one its own hover uses, in the same
  ingredient, with a flat `--gog-border-color` for browsers without `color-mix()`. Two of them
  are not that shape and say so in place: a `gog-tabs` header paints no background in any other
  state (its hover moves the label colour only), and a _selected_ button-toggle option is already
  filled, so it deepens to `--gog-accent-dim` the way the filled button variants do.

  **`gogCollapsibleTrigger` is deliberately not in that list.** It is the consumer's own element
  and the library paints nothing on it — no background at rest, none on hover, only a cursor and
  a disabled state. A press colour there would be the library inventing a look for markup it does
  not own, and inventing it for one state out of three. The same reasoning `docs/ripple.md`
  records for `gogCardLink` and `gog-table` rows.

  The three option rows' press rules are guarded against the disabled modifier; their **hover**
  rules are not, and were left alone — a disabled option lighting up under the pointer is a
  separate decision from this one, and it is filed rather than folded in.

- **A disabled option no longer lights up under the pointer, and no longer ripples.** Two
  separate holes in the same place. `.gog-select__option:hover` and `.gog-ms__option:hover`
  carried no disabled guard, so a row that cannot be chosen took the same hover background as one
  that can — only its opacity and its cursor disagreed, and neither is what a hover is read for.
  `gog-autocomplete` already had this right (`:not([aria-disabled='true'])`), which is where the
  fix was copied from. And all **three** wired `gogRipple` with `[rippleDisabled]="!rippleEnabled()"`,
  taking no account of the option's own state: with the ripple switched on app-wide, a disabled
  row answered a press with a wave. The options are rendered `aria-disabled`, not `disabled`, so
  nothing else was stopping it. Same argument the library already applied to a non-interactive
  `gog-chip`: a wave is a promise, and these rows cannot keep it.

- **The outline button's label was unreadable while hovered, in every shipped theme.**
  `--gog-button-outline-hover-color` resolved to `--gog-primary-color`, the colour of text on the
  _page_, while the hover fill is the accent — pale parchment on bright amber in `dark` (1.41:1),
  light grey on blue in `one-dark` (1.11:1), and failing WCAG AA in all 11 themes, the best of
  them `light` at 3.65:1. It now resolves to `--gog-accent-text-color`, the token that means "text
  on an accent fill" and the one both filled variants already used. Found while adding the state
  above, which would have copied the same mistake into `:active`.

- **`check:contrast` gained the pair that hid both.** The script had no pair for a label on the
  accent _fill_ other than `accentText/accent`, so neither the outline label nor the new held
  state was covered. `accentText/accentDim(active)` is now checked at 4.5:1, and it immediately
  failed one theme: `one-dark`'s `--gog-accent-dim` moved from `#4b8fca` to `#5399d6` (4.05:1 →
  4.59:1). That token had only ever been a field border, which is gated at 3:1; making it a fill
  under a label is what raised the bar. The nudge moves it toward this palette's own `#61afef`,
  so unlike 21.7.0's two comment-colour corrections it costs no fidelity.

- **Ten pieces of geometry ignored `--gog-density`, and nine of the eleven themes set it.**
  `terminal` runs at 0.85, `one-dark`/`one-light`/`bevel`/`ledger` at 0.9, `primeng` at 0.95,
  `slate` at 1.05, `material`/`parchment` at 1.1 — so in every one of them these ten stayed at
  the pixel they were typed as while everything around them moved. The clearest case is the gap
  between a dropdown and its panel: `gog-autocomplete` and `gog-datepicker` read `--gog-space-2`,
  while `gog-select` and `gog-multiselect` restated `2px`, so in `terminal` two of the four
  panels drew closer to their field and two did not. Also converted: `--gog-menu-offset` (which
  sat between `--gog-menu-padding` and `--gog-menu-gap`, both already reading the scale),
  `--gog-input-clear-inset` (the textarea's clear button — the other four clearable fields place
  their chrome from `--gog-control-icon-offset`), the two error-line offsets, the toggle's
  in-track wording clearance, the badge's overhang, and the calendar's header and time-row
  margins. Each now reads its scale step, so all ten render exactly as before at the default
  density and follow the theme everywhere else.

- **Four focus rings did not follow `--gog-focus-ring-offset`.** `gog-button-toggle` restated
  its `2px` on the line directly after reading `--gog-focus-ring-width` from the foundation;
  `gog-button` used `3px`; `gog-calendar` and `gog-tabs` used `-2px` to sit the ring inside a
  cell, because both pack their cells edge to edge and an outward ring lands on the neighbour.
  All four now derive from the foundation token — `var(…)`, `calc(… + 1px)` and `calc(… * -1)` —
  so a theme that moves the ring moves them with it, and the two negative values now say in the
  file why they are negative. No rendered value changes.

- **`check-tokens` rule H only covered two of the six families that hold a spacing number.**
  The density check was written for `-padding` and `-gap`, the two the density work had just
  converted, and `-offset`, `-inset` and `-margin` went unwatched for three releases — which is
  where all ten literals above were hiding. The name filter now covers all six, and exempts the
  lengths that match a scale step by coincidence rather than by meaning: every
  `*-focus-ring-offset` (an accessibility affordance, which a compact theme must not shrink, and
  which a component should answer by reading the foundation ring rather than a spacing step),
  plus the scrollbar and toggle thumb insets, both fitted to a track whose own width is a fixed
  pixel value. The script's header now also lists rules H and I, which had been in it unlisted
  since they were added.

- **`gogBadge`'s status variants failed WCAG AA in four themes, and had since they shipped.** A
  status badge paints `--gog-<status>-color` and labelled it `--gog-accent-text-color`, which on
  a light theme is white: `material`'s amber measured **1.97:1**, `primeng`'s green 2.28:1, and
  `slate` and `one-light` failed on all three of success/warning/info — 11 pairs in total.
  `danger` passed everywhere, which is the tell: a danger pair was added to `check:contrast` on
  2026-09-03 and the palettes were tuned to it, while the other three statuses had never been
  measured against anything.

  Half the fix costs no fidelity: `material` puts near-black on its amber (8.69:1) and `primeng`
  does the same on all three of Aura's bright hues (6.44–8.31:1), which is what both design
  systems do themselves. The other half had no label to pick — neither white nor the theme's own
  ink reached AA — so the hue moved instead, one step down each theme's own ramp: `slate`'s three
  to Tailwind's 700s, `material`'s blue to Light Blue 800, and `one-light`'s three darkened, the
  same trade that theme already made on its accent and muted tokens in 21.7.0.

  **The reason no check caught it generalises past the badge.** `check:contrast`'s automatic
  sweep pairs a rule that sets `color` with the `background-color` beside it; a variant class
  sets neither, only `--gog-badge-variant-bg`/`-color` for the base rule to read. Every variant
  of every component is written that way, so the sweep had been reporting ~180 passing states
  without looking at one of them. Four explicit badge pairs close it for this component; the
  general fix is filed in `docs/backlog.md`.

- **Two fields put their error line 2px lower than the other six.** Every control that renders an
  error — `gog-inputfield`, `gog-textarea`, `gog-select`, `gog-multiselect`, `gog-autocomplete`,
  `gog-datepicker`, `gog-radio-group`, `gog-slider` — is a flex column whose own gap already
  separates the error from the field, the same gap that separates the label from it. Two of them
  then added `margin-top: 2px` on top: measured in a browser, `gog-inputfield` and
  `gog-multiselect` sat at 6px while `gog-select`, `gog-autocomplete` and `gog-datepicker` sat at
  4px from the identical gap. In one form, side by side, the six did not line up.
  `--gog-input-error-offset` and `--gog-multiselect-error-offset` now default to `0`, so one
  mechanism spaces the error line everywhere; both tokens stay, and setting one still pushes that
  field's error further than the rest.

## [21.8.0] - 03.09.2026

### Added

- **`gog-button` forwards ARIA state and relationships: `ariaPressed`, `ariaExpanded`,
  `ariaControls`, `ariaHasPopup`.** The component hides the real `<button>`, so
  `<gog-button [attr.aria-pressed]="on()">` puts the attribute on the custom element host —
  which has no role — and assistive tech never sees it. It compiles, throws nothing, looks
  right, and silently ships a toggle button that is not a toggle button; `ariaLabel` already
  existed for exactly this reason and was the only one. `null` (the default) omits the
  attribute, while `false` is forwarded as `aria-pressed="false"`/`aria-expanded="false"`,
  which is what an off toggle or a closed disclosure must say. New exported type
  `GogAriaHasPopup`. The `[gogButton]` directive needs none of this — it styles an element you
  own, so write the attributes there directly.

### Fixed

- **`GOG_CONFIG`'s own documentation now names every component that reads each key.** The
  `GogGlobalConfig` JSDoc — the closest thing the library has to a source of truth for which
  component honours which setting, and what your editor shows you on hover — under-reported four
  keys. `control.size` did not mention `gog-button-toggle-group`, `gog-toggle`, `gog-autocomplete`
  or `gog-datepicker`; `control.errorDisplay`, `control.clearable` and `floatLabel` did not
  mention `gog-autocomplete` or `gog-datepicker`; and `dropdown` claimed to apply to
  `gog-select`/`gog-multiselect` as a block, when `appendToBody`/`direction` also reach
  `gog-autocomplete` and `gog-datepicker` while `filter`/`filterPosition` genuinely do not.
  `AGENTS.md`'s config table was closer but stated outright that `gog-toggle` does **not** take
  `control.size`, which it does. No behaviour change — every one of these components already
  honoured the setting; only the documentation was wrong, in the direction of telling you a
  setting would not work when it does.

## [21.7.2] - 30.08.2026

### Fixed

- **`gog-multiselect`'s `+N` overflow chip now sits on the same baseline as the selection text.**
  `.gog-ms` centers its children by box height (`align-items: center`), and the chip's smaller
  font-size (`--gog-multiselect-overflow-font-size`, 14px against the value's 16px) put its
  visual center visibly above the value text's baseline rather than resting on it. `.gog-ms__value`
  and `.gog-ms__overflow` now both set `align-self: baseline`, leaving `.gog-ms__actions`
  box-centered as before so the trigger's icons are unaffected. An "Overflow summary" example was
  added to the multiselect showcase page, since the bug had no live example to be caught by.

## [21.7.1] - 29.08.2026

### Fixed

- **A toast now still shows how long it has left when animations are off.** The progress bar was
  switched off along with everything else under `prefers-reduced-motion`, so the toast vanished
  with no warning — the animation was carrying the information. It now runs in `steps(20, end)`:
  the bar still reports the time remaining, in twenty discrete jumps rather than a slide. Nothing
  appears to move, and nothing counts down in silence.

- **`gog-textarea`'s scrollbar matches `gog-scroll`.** It cannot _be_ `gog-scroll` — that
  component hides a container's native chrome and draws an overlay thumb over it, and a
  `<textarea>` scrolls its own text, so the overlay would sit on the editing surface and either
  swallow clicks or drift from the content. The real scrollbar is styled from the same
  `--gog-scroll-*` tokens instead, via `scrollbar-width`/`scrollbar-color` in Firefox and
  `::-webkit-scrollbar` in Blink and WebKit. Restyle `gog-scroll` in a theme and this follows.

- **`gog-accordion`'s loading skeleton is visible again.** Its placeholders are mixed against
  `--gog-surface-color`, which is what a skeleton normally lies on — but the header strip now
  paints `--gog-accordion-header-bg`, putting a `#261e16` placeholder on a `#241d17` strip on the
  dark theme. Contrast 1.02: the title and chevron placeholders were both invisible while still
  occupying their full 18px in the DOM. The skeleton inside that header is now based on
  `--gog-border-color` instead, the one palette tone guaranteed to sit above the strip.

- **Three surfaces that had no visual separation now have one.** All three were reported from a
  dark theme, where a shadow has nothing to darken:

  - **`gog-table`'s header** painted `--gog-table-surface` — the same colour as the body — so a
    sticky header slid over rows of identical background with only the accent colour and the caps
    to distinguish it. New `--gog-table-header-bg`, defaulting to `--gog-hover-color`.
  - **`gog-accordion`'s header and body** were both `transparent`, making several open items one
    continuous band with a hairline between them. `--gog-accordion-header-bg` now defaults to
    `--gog-hover-color`; the body stays transparent on purpose, so an accordion on a coloured
    surface still sits on that colour. (The token's own comment already claimed the body "reads
    slightly darker than the header" — that was only true under `data-theme="dark"`.)
  - **`elevated` cards and panels were indistinguishable from `outlined` on dark themes.** The
    dark `--gog-panel-shadow` carries a `0 0 0 1px` ring for overlays that need an edge against
    the page — and that ring is exactly what `outlined` draws, so the two variants rendered the
    same. `elevated` now uses a shadow without the ring in the three dark themes (`dark`,
    `one-dark`, `terminal`). Nor does it keep the wide black blur: black haze over a near-black
    page reads as smudge, not lift. Elevation is now stated the way a dark UI states it — a
    hairline of light along the top edge, over a tight, close shadow.
    **No background changed** — `gog-panel` defaults to `elevated`, so tinting that surface would
    have repainted every panel in every app. `--gog-elevated-surface-color` exists as a foundation
    token for a theme that wants to express elevation as a lighter surface instead, and equals
    `--gog-surface-color` unless a theme sets it.

- **`gog-select`'s chevron now turns over when the panel opens.** It never did — there was no
  rotation in any state, which looked like a reduced-motion problem and was a missing one:
  `gog-multiselect` and `gog-accordion` both already had it. Only the default chevron rotates; a
  custom icon supplied through the chevron slot keeps the orientation you drew, the same rule
  `gog-accordion` follows. The rotation is a `transform`, so with `prefers-reduced-motion` the
  arrow still points the right way and only the tween is dropped.

- **Colours no longer vanish in browsers without `color-mix()`.** 36 tokens in `theme.css` used
  `color-mix()` with no fallback, and **a custom property does not fall back the way an ordinary
  one does**: it accepts almost any value at parse time and only fails when substituted, so a
  second declaration always wins and `var()` on it then resolves to nothing at all. Measured in
  Chrome: an element styled that way with an unsupported function computed `rgba(0, 0, 0, 0)` —
  transparent, not the earlier value. That is why hover fills, focus rings, chips, skeletons and
  slider tracks looked wrong in Samsung Internet and older Firefox: the declarations were not
  falling back, they were disappearing.

  Every one of those tokens now has a flat palette value, with the mixed value moved into an
  `@supports (color: color-mix(…))` block — the only mechanism that gates a custom property on
  feature support. **Nothing changes in a browser that supports `color-mix()`**; below that line
  the library renders in flat colours: less depth, every surface still legible and every focus
  ring still visible. `package.json` now carries a `browserslist` stating that floor
  (Chrome 111, Firefox 113, Safari 16.2, Samsung Internet 22).

## [21.7.0] - 29.08.2026

### Added

- **Every shipped theme now meets WCAG AA, and the check runs in CI.** Nine gated failures across
  five palettes were fixed: muted text in `slate`, `one-dark` and `one-light`; the filled button's
  label, at rest and on hover, in `light`, `primeng`, `one-light` and `slate`. `check:contrast` is
  now a CI step — it was deliberately kept out while any finding was open, because a permanently
  red step over a known condition teaches everyone to ignore CI.

  **`one-dark` and `one-light` changed colour, and that is a trade you may notice.** They
  reproduce a named editor palette; `#5c6370` is One Dark's own comment colour and reads at 2.32:1
  on its own background — fine for code, well under AA for UI text. Muted text is now `#9099a8`
  (dark) and `#6e6f77` (light). If you depended on the exact original hues, set
  `--gog-muted-text-color` back in your own theme block.

- **Tokens read from TypeScript now resolve `calc()` instead of silently falling back.**
  `--gog-scroll-thumb-min-size`, `--gog-tooltip-gap`, `--gog-tooltip-z` and `--gog-dropdown-z` were
  read with `parseFloat`, which returns `NaN` for `calc(...)` — and every caller turned that into
  its default without a word. **This is a consumer-facing fix:** writing
  `--gog-scroll-thumb-min-size: calc(2rem + 4px)` in your own theme now works, where before it
  quietly became 32px. `rem`, `em` and `%` work too.

- **Two WCAG AA contrast fixes, both on a filled button's own label.** The library's own `light`
  theme: `--gog-accent-color` `#9e6f00` → `#926600` (white on the old value was 4.44:1, under
  AA's 4.5), and its hover fill `#c88e00` → `#7a5500` — the hover is now _darker_ than the rest
  state rather than brighter, because gold light enough to read as "a brighter gleam" cannot
  carry white text at all (the old hover was 2.87:1, worse than the rest state everyone had
  noticed). `primeng`: moved one step down Aura's own blue ramp, `#3b82f6` → `#2563eb`
  (500 → 600), rather than inventing a colour outside the palette it reproduces; 3.68:1 → 5.17:1.

  **If you were overriding either token, nothing breaks** — but a theme built on top of `light`'s
  gold may want to re-check its own derived shades. `check:contrast` now also tests the hover
  fill, which was never checked before; `one-dark`, `one-light` and `slate` keep their known
  findings on purpose (see `docs/backlog.md`).

- **Three new presets complete the catalogue: `terminal`, `bevel` and `parchment`.** Retro and
  Historical, the two families `docs/themes.md` had left unbuilt. `terminal` is green phosphor on
  an unlit screen, monospaced throughout, square, no motion. `bevel` is the early-web desktop —
  grey panels, raised buttons, sunken fields, navy — and is the first theme to use
  `--gog-border-style: outset`/`inset`, which is what the character layer carries a border _style_
  for. `parchment` is ink on laid paper: old-style serif, oxblood accent, roomy margins. Each is
  `@import '@guildofgleks/ui/styles/presets/<name>.css'`, then `data-theme="<name>"`. All three
  pass `check:contrast` on every gated pair.

- **Optional webfont files, and the rule they exist to keep: a preset never makes a network
  request.** Each preset sets a font stack that resolves to a real system face. Where a webfont
  is worth offering, it is a separate file the consumer imports _after_ the preset —
  `presets/terminal.fonts.css` (IBM Plex Mono) and `presets/parchment.fonts.css` (EB Garamond).
  Import the preset alone and nothing is downloaded.

- **`slate`, `one-dark` and `one-light` now set a character, not just a palette** — so every
  shipped preset does. They were palette-only, which made them recoloured defaults: they wore another product's
  colours on this library's shape. Each now sets the character layer and a density —
  `slate` becomes the catalogue's _soft modern_ entry (12px corners, hairline borders, roomier at
  `1.05`), and `one-dark`/`one-light` become editor chrome (4px corners, compact at `0.9`,
  sentence-case labels), deliberately identical to each other so a toggle between them changes
  tone and nothing else. **Palettes are unchanged**; `check:contrast` reports the same eight
  findings as before. See `docs/themes.md` iteration 4.

- **`--gog-density`: one number that sets the spacing of the whole library.** A theme makes
  every component tighter or roomier with `--gog-density: 0.9` — no component tokens named, no
  list to keep up to date as components are added. It multiplies a new fourteen-step spacing
  scale (`--gog-space-2` … `--gog-space-48`, named for their pixel value at density 1), and
  every padding and gap in `theme.css` now derives from that scale. The three shipped presets
  that carry a character layer use it: `ledger` at `0.9` (administrative software packed a
  screen), `primeng` at `0.95`, `material` at `1.1` (M3's posture is generous by design).

  The five existing `--gog-space-xs|sm|md|lg|2xl` names are kept as aliases with their exact
  previous values, so no existing theme or consumer stylesheet changes. **Nothing moves at
  density 1** except thirteen paddings that were never on a grid to begin with — five of them
  fractional `rem` values computing to 3.6px, 4.4px, 4.8px, 7.2px and 9.6px — which now round
  to the nearest 2px step. The largest single change is 4px, on `--gog-panel-slg-padding-x`.
  See `docs/themes.md` iteration 6.

- **A new shipped preset: `ledger`** — the square-cornered, hard-shadowed, system-font
  administrative-software identity. Beige and grey, a muted navy accent, uniform 1px borders,
  zero corner radius, a hard offset shadow with no blur, and every transition duration set to
  `0s`. `@import '@guildofgleks/ui/styles/presets/ledger.css'`, then `data-theme="ledger"`.
  Palette-plus-character-layer only, like `material`/`primeng` below but with no per-component
  overrides needed at all — see `docs/themes.md` iteration 4. Named `ledger`, not the plan's own
  "Classic" (that names the catalogue _family_, not this preset) — `ui-showcase` already uses
  "Classic" as the display label for `data-theme="light"`.

- **Two new shipped presets: `material` and `primeng`** — full visual identities (Material
  Design 3 baseline and PrimeNG's Aura), not just palettes, ported from `gleks-ui-lab`'s
  compare page. `@import '@guildofgleks/ui/styles/presets/material.css'` /
  `.../presets/primeng.css'`, then `data-theme="material"` / `"primeng"`. Unlike `slate`/
  `one-dark`/`one-light`, both set the character layer (corner rounding, border weight, casing,
  tracking) plus a handful of settings the character layer has no vocabulary for yet (a pill
  button, a table's header font). See each file's own header comment for what's per-component
  and why.

- **Four new foundation tokens give a theme somewhere to set corner rounding, border weight and
  emphasis casing/tracking once, instead of per component:** `--gog-text-transform` (default
  `uppercase`), `--gog-letter-spacing` (default `1px`), `--gog-border-width` and `--gog-border-style`
  (default `1px solid` — a third tier alongside the existing `--gog-control-border-*` for form
  fields and `--gog-panel-border-*` for raised surfaces, covering everything smaller and inline:
  chips, tags, badges, toggles, table rows, tabs, calendar cells). 40 component tokens across
  `theme.css` now derive from these plus the pre-existing `--gog-radius` — no default changed;
  every conversion was checked to render the identical pixel value before and after. Not
  converted, on purpose: pill/circle radii and deliberately-flat corners (a rounding axis
  shouldn't reshape a shape choice), and per-component values with no shared pattern to extract.
  `docs/themes.md` has the full audit. Setting any of the four in a `[data-theme]` block now
  restyles every component that reads it, with no per-component overrides to list.

- **`DialogService.open()` and `DialogConfig` gain an optional `TData` generic**, checked against
  `data` at the call site: `dialogService.open<TResult, TData>({ data: /* checked against TData */ })`.
  Supplying only `TResult` — the existing, common form — leaves `TData` as `unknown`, exactly as
  before; nothing about an existing call changes. This closes only the sending half of the round
  trip: the component you open still reads its data via `inject(DIALOG_DATA)`, one
  `InjectionToken<unknown>` shared by every dialog, so it still needs its own cast
  (`inject<TData>(DIALOG_DATA)`) — Angular's DI has no way to carry a per-call-site type through a
  single shared token. See `AGENTS.md`'s `DialogService` section for the full example.

### Removed

- **The three abbreviated token prefixes deprecated in 21.5.0 (21.3.0 for `--gog-ms-*`) are gone.**
  Each had been declared nowhere, honoured only as a fallback the spelled-out token wrapped:
  `--gog-button-x: var(--gog-btn-x, value)`. The fallback layer is deleted; the spelled-out name is
  now the plain declaration, with the same final value as before. Rename any of the following you
  still set, in your own stylesheet — a `var()` reference to a name nothing declares does not fail
  a build, it just silently stops matching anything:

  | Old               | New                           |
  | ----------------- | ----------------------------- |
  | `--gog-btn-*`     | `--gog-button-*`              |
  | `--gog-ms-*`      | `--gog-multiselect-*`         |
  | `--gog-confirm-*` | `--gog-confirmation-dialog-*` |

  `GogTokenName` (the exported type listing every `--gog-*` custom property) drops the 20 old
  spellings it used to include — a compile error on a variable annotated with one of them is the
  one part of this change your build will actually catch.

### Fixed

- **Four tokens that resolved to nothing, found while surveying this release's removal below.**
  Each was a `var(--gog-…)` with no fallback, naming a custom property nothing declares — which
  makes the token holding it guaranteed-invalid, so the declaration reading it silently computes to
  nothing. No build error, nothing to see except the missing style:

  - **`gog-multiselect`'s focus glow never rendered.** Its default read the deprecated
    `--gog-ms-focus-ring`, declared nowhere — now reads its own `--gog-multiselect-focus-ring`,
    matching `gog-input` and `gog-select`.
  - **The filter box inside `gog-select` and `gog-multiselect` had no border and the wrong text
    colour.** Both read a `--gog-{select,multiselect}-control-*` pair that was never declared
    anywhere in the library — now read `--gog-{select,multiselect}-field-*`, the tokens that were
    actually meant. The border loss was total (`border` is a shorthand, so one invalid part drops
    the whole declaration); the colour loss was invisible, because `color` just inherited instead.
  - **`gog-multiselect`'s JS-computed panel height silently used hardcoded defaults instead of the
    themed metrics.** Its `GogDropdownBase` token overrides named the deprecated `--gog-ms-*`
    prefix, which `theme.css` has never declared as a real property — so
    `getComputedStyle().getPropertyValue()` always read `''`. Now reads `--gog-multiselect-*`,
    matching the pattern `gog-select` already used correctly.

  A consumer who set `--gog-multiselect-focus-glow`, `--gog-select-filter-input-color/-border` or
  their `gog-multiselect` counterparts directly, to work around any of the first two being missing,
  keeps working exactly as before — an explicit override still wins over the (now real) default.

## [21.6.1] - 26.08.2026

### Added

- **`gog-card` — a surface for one self-contained thing.** A product tile, a summary, a search
  result. It paints a background, a border and a radius, which a CSS class of your own could also
  do; what it adds is what a class cannot:

  - **It names itself.** The heading you project as `gogCardHeader` becomes the card's accessible
    name — the card takes that element's id (minting one if it has none), points its own
    `aria-labelledby` at it and announces itself as a group. `role="group"` rather than `region`
    on purpose: a grid of twenty cards would put twenty landmarks in a screen reader's landmark
    list, which is worse than none.
  - **The whole surface can activate a link, without the card inventing a control.** There is no
    `interactive` input and no `gogClick` output. Put `gogCardLink` on the `<a>` the card is about
    — usually the one in its heading — and its hit area stretches over the card, with the focus
    ring drawn around the surface. The link stays yours, so `routerLink`, `href`, `target`,
    middle-click, "open in new tab" and Enter all keep working, and anything else focusable in the
    card still receives its own clicks. A card rendering its own `<button>` instead could hold no
    other control (a button may not contain one), could not navigate the way an app navigates, and
    would announce the card's entire text as its name.
  - **`loading` and `disabled` are folded in**, including `aria-busy`, the placeholder shaped like
    a title and body copy, and taking the card's link out of the tab order.

  Slots: `gogCardHeader`, `gogCardMedia` (full-bleed, rounds into the top corners), `gogCardFooter`.
  Tokens: `--gog-card-*`, with `--gog-card-bg`, `--gog-card-border-color`, `--gog-card-shadow`,
  `--gog-card-padding-y`, `--gog-card-padding-x` and `--gog-card-gap` left undeclared as the
  per-instance escape hatch.

- **`gog-panel` — a titled region of a page.** A settings section, a dashboard area, a form group.
  It differs from `gog-card` in behaviour, not only in size: it is a real landmark
  (`role="region"` named by its `gogPanelHeader` heading), it can **collapse**, and its surface is
  never itself a link, because controls live inside a panel.

  Collapsing **composes `gog-collapsible`** rather than repeating it, so the open/close state, the
  id wiring and the animation are the ones the rest of the library already uses. The heading stays
  a heading: the toggle is a separate `<button>` named by it through `aria-labelledby`, with its
  hit area stretched across the header row — so the pointer still gets "click the title to
  collapse", while a screen reader gets a heading _and_ a named expandable button instead of a
  heading swallowed by `role="button"`. A panel that cannot collapse undoes the collapse geometry
  it inherits, `overflow` included, so a dropdown opened inside one is not clipped.

  `loading` keeps the heading and the footer and replaces only the body — a page section is titled
  before its content arrives. Slots: `gogPanelHeader`, `gogPanelFooter`. New label:
  `GOG_CONFIG.labels.togglePanel`, used only by a collapsible panel with no heading to be named by.

  **`--gog-panel-*` now means two things, deliberately.** `--gog-panel-radius`,
  `--gog-panel-shadow`, `--gog-panel-border-width` and `--gog-panel-border-style` were already the
  foundation surface tier that dialogs, dropdown panels and tooltips read; the component adopts
  them instead of owning a fourth definition of "raised surface", so a theme's house radius and
  shadow reach it for free. The rest of `--gog-panel-*` is the component's own. Nothing was
  renamed and no existing override changes meaning.

- **`gogRipple` — a press wash for any element.** `<button gogRipple>`, `<div gogRipple>`, a
  `gog-*` host tag: a directive, so it adds no wrapper and changes no layout. Built from scratch —
  there is no `@angular/cdk` in this package and there will not be.

  The interesting part is not the animation. A ripple normally clips its host, and `gogBadge`
  pins its badge **outside** the host's box on purpose — so the first ordinary pairing anyone
  tries, a badged button, loses its badge the moment the ripple is installed. This one never
  clips the host: the wash lives in its own layer that clips itself, and that layer takes the
  host's corner radius through `border-radius: inherit`, per instance and per theme, with no
  token to set. The one thing to know follows from it — **put the directive on the element that
  paints the surface**, since a wrapper whose child paints the rounded background passes on the
  wrapper's radius (usually `0`) and the wash squares off.

  Inputs: `rippleDisabled`, `rippleCentred`. Suppressed with no wiring on a host that is
  `disabled` or `aria-disabled="true"`, and under `prefers-reduced-motion: reduce` — suppressed
  outright there, not merely shortened. Keyboard activation is centred, since `Enter` and `Space`
  carry no coordinates. Tokens: `--gog-ripple-color` (defaults to `currentColor`, so one value
  works on a filled surface and a ghost one), `--gog-ripple-opacity`,
  `--gog-ripple-enter-duration`, `--gog-ripple-exit-duration`, `--gog-ripple-easing`.

- **Every interactive surface in the library can ripple, from one switch.**
  `provideGogConfig({ ripple: { enabled: true } })` turns it on for `gog-button`, `[gogButton]`,
  `gog-button-toggle-group`, `gog-chip`, `gog-tabs` headers, `gog-accordion` headers,
  `gogCollapsibleTrigger`, `gogMenuItem` and the options inside `gog-select`, `gog-multiselect`
  and `gog-autocomplete` — `gog-paginator` follows, because its page buttons are `gog-button`s.

  **Off by default**, so this release changes the appearance of nothing. Each of those components
  also takes a **`ripple`** input that beats the app-wide setting in both directions:
  `[ripple]="false"` opts one control out of an app that turned it on, `[ripple]="true"` opts one
  in without switching the app over.

  `ripple` is the first visual default in `GOG_CONFIG` rather than in `theme.css`, and the
  exception is deliberate: `--gog-ripple-opacity: 0` hides the wash but still pays for the DOM
  node, the pointer listeners and the animation frames. A real off has to reach the TypeScript —
  and it does: a disabled ripple attaches no listeners and adds no class to its host.

  Two surfaces are deliberately left out, with `gogRipple` available if you disagree: **`gog-table`
  rows** and **`gogCardLink`**. Both are hundreds of pixels wide, so the wave has to cross the
  whole surface and reads as a flash rather than as feedback where you pressed — and a table
  installs one directive per row, with no virtualization in the library yet. A `gog-chip` that is
  not `clickable`, or is `disabled`, never ripples whatever the config says.

- **`GogSurfaceVariant`** (`'outlined' | 'elevated' | 'filled'`), shared by both, so the two agree
  on what each word looks like.

### Fixed

- **A loading `gog-table` and `gog-autocomplete` announce themselves.** Both now set
  `aria-busy="true"` while `loading` is on, which every component with a `loading` input is
  supposed to do. A loading table replaces its rows with a single spinner cell and dims its
  header; the autocomplete's spinner sits in its actions slot and is `aria-hidden`. Neither had
  anything to tell a screen reader that a wait was in progress — the table read as a table with
  no rows, and the field as idle. The autocomplete is the worse of the two, because unlike a
  button the user pressed, that wait is not something they started.

## [21.6.0] - 23.08.2026

### Fixed

- **A loading `gog-accordion` announces itself.** It sets `aria-busy="true"` while `loading` is
  on. Its skeleton bars are `aria-hidden` and the real headers are not rendered, so without it the
  component was not "loading" to a screen reader — it was **empty**, which reads as "there is
  nothing here" rather than "this is coming".

  The placeholder rows also gained the shape they were missing: **a chevron placeholder**, so the
  silhouette is the one that arrives instead of the chevron appearing out of nowhere, and
  **varying title widths** instead of every bar at a flat 55%, which read as a repeating progress
  artifact rather than as titles of differing length. Widths cycle by row index rather than
  randomising, so a server-rendered pass and its hydration agree.

  The geometry was already correct and is unchanged — measured at the same `size`, the skeleton
  header is 46px against the real 47px.

  **`gog-table` and `gog-autocomplete` still do not set `aria-busy`.** The rule is now written
  down in the repo's API guide along with which loading treatment belongs to which kind of
  component; those two are its known violations and are tracked.

- **The library no longer needs your `box-sizing` reset.** Everything it renders now sizes itself
  `border-box`, set once in `styles/utilities.css` on any element carrying a `gog-*` class.

  Without a reset the components quietly stopped honouring their own size tokens:
  `--gog-select-min-width` is `120px`, and a `gog-select` measured **148px**; its inner control
  went from 120px to 176px, and `gog-toggle__track` and `gog-checkbox__box` inflated the same way.
  Measured across four showcase pages, 12–16 elements per page came out a different size. Nothing
  looked broken, which is why it went unreported — a consumer without a reset simply got a
  differently-proportioned library.

  **If your app has `* { box-sizing: border-box }`, nothing changes**; the library was already
  rendering under it. The rule is a single class in specificity, so your own styles still win.

- **Disabled and focus styling can no longer be lost to an ordinary app stylesheet.** `[gogButton]`
  and `gogMenuItem` are applied to _your_ element, which is the element you style — and a plain
  `.my-button { cursor: pointer }` in an Angular component stylesheet is the same specificity as
  the library's `.gog-btn:disabled` once `[_ngcontent-…]` is stamped on it, so it won on source
  order. Measured: a disabled button reading `cursor: pointer` at full opacity — enabled-looking
  and enabled-feeling while disabled. For a menu item it is worse, because the arrow keys step
  over a disabled item: the pointer and the keyboard disagreed about what was there.

  Five rules across `styles/button.css` and `styles/menu.css` — the `:disabled` and
  `:focus-visible` pairs — now carry one more point of specificity. `:hover` and `:active` needed
  nothing; their `:not(:disabled)` already had it.

  **Restyling these is still yours**, it just has to be deliberate now: any selector of your own
  with two classes wins, as before. The base `.gog-btn` look is untouched and as overridable as
  it ever was — what is defended is state and focus visibility, where losing silently is a
  correctness and accessibility bug rather than a difference of taste.

- **A disabled `gogCollapsibleTrigger` shows a disabled cursor.** It carried whatever cursor the
  consumer had put on the element — usually `pointer`, since the trigger is their own button.
  The library's `cursor: not-allowed` was there, and losing: an ordinary
  `.my-trigger { cursor: pointer }` in a consumer's component stylesheet is the same specificity
  once Angular stamps `[_ngcontent-…]` onto it, and it comes later in the cascade. The rule is
  now scoped through `gog-collapsible`, which settles it without `!important`.

  If you added a `cursor` to your own trigger, you can drop it — the directive has set
  `cursor: pointer` since it started applying `.gog-collapsible__trigger`.

- **`gog-autocomplete`: the text can be erased again.** With a selection held, backspacing could
  not clear the field — nine backspaces on "Amsterdam" left "Amsterdam". Deleting the last
  character takes the text under `minLength`, which closes the panel; the effect that keeps the
  field showing its selection used `!isOpen()` to mean "the user is not mid-edit", so closing the
  panel made it write the selected label straight back into the input.

  The panel closes for reasons that are not "the user finished" — text under `minLength`, Escape,
  Tab — so editing is now tracked directly instead of inferred from it. The effect keeps its real
  job, which is syncing a value the component did not set: a form writing one in, or the options
  arriving after the value did.

  **`forceSelection` is unaffected.** It still snaps the field back to the selection on blur and
  on Escape, which is where that was always meant to happen; what stopped is the snap-back firing
  mid-keystroke.

### Added

- **`gog-table`: `maxHeight`** — any CSS length (`'420px'`, `'60vh'`), capping the table's own
  scroll viewport so the table owns its vertical scrolling. **This is what makes `stickyHeader`
  work**, and the two are meant to be used together:

  ```html
  <gog-table [value]="rows" maxHeight="260px" [stickyHeader]="true">…</gog-table>
  ```

  `stickyHeader` has never held while the table scrolled sideways. A sticky element resolves
  against its nearest scroll container; the table wraps itself in a `gog-scroll`, and the moment
  that scroller moves on one axis it is a scroll container on **both**, because CSS coerces
  `overflow-y: visible` to `auto` next to a scrolling `overflow-x` — and `clip` to `hidden`, which
  is also a scroll container. Measured in a browser: a header 147px out of view, with the
  component's own `overflow-y: visible` showing as a computed `auto`.

  So the header cannot be made to stick to anything outside the table, and the fix is to give the
  inside something to stick to. With `maxHeight` set the viewport is the vertical scrollport and
  the header pins to it — verified with both axes scrolling at once.

  An input rather than a `--gog-table-*` token, even though the value only lands in CSS, because
  it also decides whether the internal scroller handles the vertical axis. It has to for a capped
  table; it must **not** for an uncapped one, or every table becomes a scroll container and takes
  the consumer's own scrolling region out of its descendants' sticky chain — measured at 147px
  when tried that way. That is behaviour, not appearance.

  **Nothing changes for a table without it.** `maxHeight` defaults to `null`, the viewport stays
  at content height and its vertical axis stays inert.

### Fixed

- **`[fullWidth]="false"` no longer clips the widest column's header.** The table is
  `table-layout: fixed` and switches to `width: fit-content` in this mode, so the browser split
  that width evenly across the columns instead of measuring them against their content — and
  `overflow: hidden` on the cell cut whatever did not fit. Measured on a five-column table:
  "Component" was given 100px of 448px while needing 119px.

  It now lays out with `table-layout: auto` whenever `fullWidth` is false. Fixed layout only buys
  anything when the width comes from outside the table; at `fit-content` it comes from the content
  anyway, so there was nothing to trade away. The same table now gives "Component" 133px of 454px.

  **`fullWidth` left at its default is untouched** and still uses fixed layout. If you set `width`
  on a `gog-column` purely to work around the clipping, you can drop it — under auto layout a
  stated width becomes a suggestion the browser weighs against content, rather than a hard split.

## [21.5.2] - 22.08.2026

Documentation only, and specifically the copy of this file that ships inside the package: 21.5.0
and 21.5.1 were both published while their headings still read `planned`, so the changelog in the
tarball described two live releases as unreleased. Nothing in the code changed — there is no
reason to upgrade from 21.5.1 except to get a changelog that reads correctly.

### Fixed

- **21.5.0 and 21.5.1 carry their real release dates** (21.08.2026 and 22.08.2026, from the npm
  registry) instead of `planned`. This file is the only source that cannot drift from the package
  it documents, because it travels inside it — which is exactly why a wrong date in it is worth a
  patch. It is also what the documentation site renders on its releases page: that page reads
  `node_modules/@guildofgleks/ui/CHANGELOG.md` at build time rather than any copy of its own, so
  until this ships it shows "planned" beside the version its reader is running.

  `npm run release` now refuses to publish when the top heading's version does not match
  `package.json` or its date still says `planned`. Swapping that word for the date is a manual
  step at the end of a long list, which is a step that gets missed — twice, here — and nothing
  downstream could tell the difference.

## [21.5.1] - 22.08.2026

Two defects 21.5.0 shipped, both of the same shape: correct-looking CSS whose effect was cancelled
by something else in the box model, and neither visible to a test suite that runs without a style
engine. Both were found by opening the components in a browser while writing the documentation
site's pages for them. No input, output, type or public token changed, so upgrading from 21.5.0 is
a version bump with nothing to migrate.

### Fixed

- **`--gog-menu-max-height` now caps the panel.** It never did: `gog-menu` measured the room
  between its trigger and the viewport edge and wrote that onto the panel as an inline
  `max-height`, which beats the stylesheet rule the token feeds. Setting
  `--gog-menu-max-height: 150px` on a page with 500px of room changed nothing, and a menu of any
  length simply grew until it ran out of screen.

  The measured room is now handed to CSS as `--gog-menu-available-height` and `menu.css` takes the
  smaller of the two, so a panel's height is the least of its content, the token, and the room
  available. Lower the token to make a menu start scrolling sooner.

  A menu that flips **up** is now anchored by its `bottom` rather than by a `top` computed from
  its expected height. That is what makes the cap safe: with the old arithmetic, a panel the token
  cut short would have floated away from its trigger by exactly the height it did not take.

- **Text no longer runs underneath a field's own icon in RTL.** `gog-inputfield`, `gog-select`,
  `gog-autocomplete` and `gog-datepicker` each reserve a gutter for their leading or trailing
  chrome. The chrome is placed with `inset-inline-start` / `inset-inline-end` — logical — but the
  gutter was a physical `padding-left`/`padding-right`, so under `dir="rtl"` the two ended up on
  opposite sides: the icon at one edge, the space kept for it stranded at the other, and the value
  or placeholder rendering under the icon. A floating label offset itself by the wrong gutter for
  the same reason, and a clearable `gog-select` was padded on both sides at once.

  All four now use `padding-block` + `padding-inline`. `gog-inputfield`'s two internal properties
  are renamed to match what they now mean — `--gog-input-pl`/`-pr` became `--gog-input-ps`/`-pe`
  (inline **start** / **end**). Neither was ever public: they are not in `GogTokenName`, not in
  `TOKENS.md` and not declared in `theme.css`, so nothing a consumer can have written changes.
  Left-to-right rendering is byte-for-byte what it was.

  **`npm run check:logical-properties` now fails the build** on a `padding`, `margin`,
  `border-width` or `border-radius` shorthand that sets the two horizontal sides differently.
  21.5.0 converted 16 stylesheets to logical properties and still missed these four, because the
  sidedness lives in a value's _position inside a shorthand_ rather than in a `left`/`right`
  keyword — invisible to a grep, and invisible to a unit test with no style engine.

- **Documented the `position: fixed` containing-block caveat**, in one place plus a line on each
  overlay it affects. `gog-dialog`'s backdrop, `gog-toast-container` and
  `gog-spinner [overlay]` cover the viewport only while no ancestor establishes a containing
  block — `contain`, `transform`, `filter`, `backdrop-filter` or `will-change` above them
  retargets the overlay to that element's box, with no error and no warning. `gog-scroll` sets
  `contain: layout style`, so this library can trigger it on its own: a dialog opened inside a
  scroller dims the scroller. Nothing changed in behaviour; what changed is that the behaviour is
  now written down where you meet it — README's "Overlays and the viewport", `AGENTS.md`, and the
  TSDoc of each overlay.

- **The package's own front page was two releases stale.** `README.md` opened with "An Angular 21
  component library … 27 components", while `package.json`'s description had said Angular 21 and
  22 since 21.5.0 — two files in one tarball contradicting each other. It now says 21 and 22, 29
  components and 17 (not fifteen) directives beyond the five named ones, and mentions RTL, which
  it never did. `AGENTS.md`'s version marker still read `21.4.4` "plus the removals already landed
  for the unreleased 21.5.0"; it now reads 21.5.1, with the **Removed in 21.5.0** section framed as
  what it is — a migration table for code written against 21.4.x.

## [21.5.0] - 21.08.2026

**The breaking release** — the one version consumers have to read before upgrading into. It
carries the removals below and the token-prefix rename (`--gog-btn-*`, `--gog-ms-*` and
`--gog-confirm-*` spelled out; the old spellings keep working until 21.7.0). Everything
non-breaking that was ready earlier shipped in 21.4.4 instead, so a reader upgrading to 21.4.4 has
nothing to migrate and a reader upgrading to 21.5.0 has one list to work through rather than one
buried among fixes.

### Removed

Everything deprecated for this version is gone. **All of it was announced with a replacement in
21.3.0 or earlier**, and every replacement has shipped since then, so each item below is a
mechanical edit at the call site rather than a redesign. If you are on 21.4.x, your editor has
been striking these through already.

**Per-slot `TemplateRef` inputs → projected slot directives.** Declare the template where it is
used; it no longer has to be wired through an input, and it carries a typed context.

| Removed input                                        | Replacement                             |
| ---------------------------------------------------- | --------------------------------------- |
| `gog-checkbox` `[checkIconTemplate]`                 | `<ng-template gogCheckboxIcon>`         |
| `gog-tag` `[iconTemplate]`                           | `<ng-template gogTagIcon>`              |
| `gog-multiselect` `[clearIconTemplate]`              | `<ng-template gogMultiselectClearIcon>` |
| `gog-select` / `gog-multiselect` `[chevronTemplate]` | `<ng-template gogDropdownChevron>`      |

```html
<!-- before -->
<gog-tag [iconTemplate]="star">Featured</gog-tag>
<ng-template #star><gog-icon name="check" /></ng-template>

<!-- after -->
<gog-tag>
  <ng-template gogTagIcon><gog-icon name="check" /></ng-template>
  Featured
</gog-tag>
```

**`gog-inputfield`'s six legacy icon inputs** — `iconStartTemplate`, `iconEndTemplate`,
`iconStartFn`, `iconEndFn`, `iconStartLabel`, `iconEndLabel` — replaced by projecting a real
element into the field's leading or trailing slot. A projected `<button gogInputAddonEnd>` carries
its own click handler, its own `aria-label` and its own disabled state, which is why six inputs
collapse into none:

```html
<!-- before -->
<gog-inputfield label="Search" iconEnd="check" [iconEndFn]="run" iconEndLabel="Search" />

<!-- after -->
<gog-inputfield label="Search">
  <button gogInputAddonEnd type="button" aria-label="Search" (click)="run()">
    <gog-icon name="check" />
  </button>
</gog-inputfield>
```

`iconStart` / `iconEnd` stay, and are now unambiguously **decorative**: they render an
`aria-hidden` span, never a button. The only action button `gog-inputfield` still renders for
itself is the password reveal toggle, whose labels remain `showPasswordLabel` /
`hidePasswordLabel`.

**`gog-table`'s string-keyed template slot.** `<ng-template template="field" type="body">` matched
a column by a string the compiler could not check — a typo silently rendered the default cell.
Declare the template inside the column it belongs to instead:

```html
<!-- before -->
<gog-column field="status" />
<ng-template template="status" type="body" let-row>…</ng-template>

<!-- after -->
<gog-column field="status">
  <ng-template gogColumnBody let-row let-value="value">…</ng-template>
</gog-column>
```

The `TemplateDirective` export goes with it, along with the `GogTableBodyContext` /
`GogTableHeaderContext` types it carried — `GogColumnBodyContext` / `GogColumnHeaderContext` are
the typed replacements, and they are what the column-scoped templates have always used.

**The unprefixed table column names.** The `<column>` element selector and the `Column` const and
type are gone; use `<gog-column>` and `GogColumn`.

**The `GogSelectOption` and `GogMultiselectOption` type aliases.** Use `GogDropdownOption` — the
same type; both were aliases of it since 21.2.2. These two were announced for removal in **21.4.0**
and overran it by a minor: 21.4.0 through 21.4.4 all shipped with them still exported. Recorded
here rather than quietly re-dated, and `npm run check:deprecations` now fails the build on any
`@deprecated … Removed in <version>` tag whose version has already been reached, so no deprecation
can overrun its date again.

**The `@guildofgleks/ui/src/styles/…` asset path.** Stylesheets moved to `@guildofgleks/ui/styles/…`
in 21.3.2, with the old path documented as working until 21.5.0. The package no longer ships the
duplicate copy, and the `./src/styles/*` export is gone — if your `angular.json` still names the
long path, drop the `src/` segment.

### Fixed

- **`gogCollapsibleTrigger` is reachable by keyboard on any element.** Its own documentation
  invites a non-focusable host ("works on any clickable element"), and on one it used to apply
  `aria-expanded`/`aria-controls` and nothing else: a control that announces itself to a screen
  reader, with no tab stop and no response to Enter or Space — the one combination that strands
  the person relying on that announcement.

  On a host that is not natively operable the directive now also supplies `role="button"`,
  `tabindex="0"` (`-1` while disabled) and Enter/Space. A `<button>` or `<a href>` is untouched,
  since a second key handler would toggle twice in one press, and a `role`/`tabindex` you set
  yourself is respected rather than overwritten.

### Added

- **`GOG_DEPRECATIONS` — the deprecation manifest**, generated from the library's own source and
  shipped in the public API:

  ```ts
  import { GOG_DEPRECATIONS } from '@guildofgleks/ui';

  // → { kind: 'token', name: '--gog-btn-radius', replacement: '--gog-button-radius',
  //     since: '21.5.0', sinceDate: '2026-08-19', removedIn: '21.7.0' }
  ```

  It answers "is this still supported, and until when?" for tooling that has to mark an API row —
  a docs site, an editor plugin, a codemod — without anyone maintaining a second list. Symbols
  come from their `@deprecated` tags and tokens from the stylesheets that still resolve them, so
  it cannot drift from the code.

  In this release it holds **154 tokens and no symbols**: 21.5.0 removed every deprecated symbol
  the library had, and its deprecations are the three abbreviated token prefixes above. An empty
  symbol half is the healthy state, not a broken generator.

- **`gog-menu` — a command menu**, with `[gogMenuTrigger]` on your own button and `gogMenuItem` on
  your own items:

  ```html
  <button gogButton variant="ghost" [gogMenuTrigger]="rowMenu" aria-label="Row actions">
    <gog-icon name="more-vertical" />
  </button>

  <gog-menu #rowMenu>
    <button gogMenuItem (click)="edit(row)">Edit</button>
    <button gogMenuItem disabled>Transfer ownership</button>
  </gog-menu>
  ```

  The library created this gap itself: 21.4.0 added `more-horizontal`/`more-vertical` icons and a
  table built for row actions, with nothing to open with them. Everything else a consumer can
  assemble from what already ships; an accessible menu cannot be — it needs focus management,
  roving focus and overlay placement at once.

  Keyboard follows the WAI-ARIA menu button pattern: Enter/Space/ArrowDown open with the first
  item focused, ArrowUp with the last, arrows and Home/End move and skip disabled items, Escape
  closes and restores focus to the trigger, Tab closes and moves on.

  Disable an item with the native `disabled` attribute on your own button — the arrow keys step
  over it. The panel always renders into `<body>`, placed from the trigger's measured rect, so a
  menu inside `gog-scroll`, `gog-table` or any clipping ancestor needs no configuration; it takes
  the `--gog-dropdown-z` its trigger inherits, so a menu inside a dialog stacks above it. Past
  `--gog-menu-max-height` the panel scrolls with `gog-scroll`. Themed by `--gog-menu-*`.

- **Right-to-left support.** `dir="rtl"` on `<html>` — or on any subtree — now mirrors every
  component, with nothing to set per component. What changed under it: physical `left`/`right`
  declarations became logical properties across 16 stylesheets; the select/multiselect panel and
  the tooltip bubble copy a _scoped_ `dir` onto their portaled host, so an RTL region inside an
  LTR page renders correctly; a tooltip's `position="auto"` prefers the mirrored horizontal side;
  the calendar's month/year arrows turn around; and the slider fill, toast progress bar and
  indeterminate progressbar run from the inline start.

  Physical by design, because they are physical words in the API: a tooltip's explicit
  `position="left"`/`"right"`, and a toast's `top-left`/`top-right`/`bottom-left`/`bottom-right`.

  Three CSS custom properties are declared for the handful of properties with no logical form
  (`transform-origin`, `translate`): `--gog-inline-start-side`, `--gog-inline-end-side` (the
  `left`/`right` keywords) and `--gog-direction-sign` (`1`/`-1`). They flip on `[dir='rtl']` and
  are available to your own styles.

### Changed

- **Component token prefixes are spelled out.** Three families were abbreviations of a
  component's name — the one thing a consumer cannot guess — and now read as the component does:

  | Was               | Is                                                           |
  | ----------------- | ------------------------------------------------------------ |
  | `--gog-btn-*`     | `--gog-button-*`                                             |
  | `--gog-confirm-*` | `--gog-confirmation-dialog-*`                                |
  | `--gog-ms-*`      | `--gog-multiselect-*` (since 21.3.0; the removal moved here) |

  **Nothing breaks now.** Every old spelling still feeds the component: each replacement declares
  it in its own fallback (`--gog-button-md-padding: var(--gog-btn-md-padding, 0.75rem 1.25rem)`),
  and the per-instance names (`--gog-btn-bg`, `--gog-btn-padding`, …) are still read by the
  button's own fallback chain. Override either spelling, at any scope, and it applies —
  verified in a browser rather than reasoned about, for a theme block, a nested `[data-theme]`
  subtree and an inline instance override.

  **They are removed in 21.7.0** — two minors rather than one, because a CSS custom property that
  nothing reads fails silently: no error, no warning, just a value that stops applying. Migration
  is a find-and-replace on those three prefixes. `TOKENS.md` lists only the current names.

  One prefix that looks abbreviated and is staying: **`--gog-input-*`**. It names the text-field
  block that `gog-inputfield` and `gog-textarea` both render, not the `gog-inputfield` component —
  the two restyle together from one token set on purpose, so there is no `--gog-inputfield-*`.

- **`peerDependencies` now accept Angular 22** (`^21.2.0 || ^22.0.0` for `@angular/common`,
  `@angular/core`, `@angular/forms`, `@angular/platform-browser`) instead of `^21.2.0` alone.
  The library ships partial-compiled (Ivy partial mode), which is forward-compatible with the
  next major without a rebuild — the strict `^21.2.0` peer range was blocking installation into
  an Angular 22 app that otherwise built and ran fine, forcing every such consumer to reach for
  `overrides`/`resolutions` as a workaround.

## [21.4.4] - 17.08.2026

Everything that is ready. Two defects and one addition, none of which changes an existing
signature, so upgrading from 21.4.3 needs no migration — see the `gog-collapsible` entry only if
you were relying on a panel being capped at 480px.

### Added

- **`ng add @guildofgleks/ui` now works.** It installs the latest version and adds
  `node_modules/@guildofgleks/ui/styles/index.css` to your project's `angular.json` styles —
  the one setup step that's pure mechanical JSON editing. Importing components and placing
  `<gog-dialog />` / `<gog-toast-container />` are still manual; see the README.

  In a patch rather than a minor because it is purely additive — it adds a way to install the
  package and touches no existing API — the same reasoning that put "`CHANGELOG.md` now ships
  inside the package" in 21.4.2.

### Fixed

- **An open `gog-collapsible` no longer clips content taller than 480px.**
  `--gog-collapsible-max-height` defaulted to `480px` and the panel is `overflow: hidden`, so any
  panel taller than that lost the rest of its content — with no scrollbar, no ellipsis and nothing
  else to indicate it. The cap existed only to give the CSS transition an animatable target, which
  meant every consumer had to discover the limit by having content disappear, then override the
  token per instance. The default is now `max-content`, and `interpolate-size: allow-keywords` on
  the panel keeps the open/close transition animating to it. `gog-accordion` never had this
  problem — it animates `grid-template-rows` instead — so the two components now behave the same
  way.

  No token was added or removed, and nothing about the closed state changed. **Setting
  `--gog-collapsible-max-height` to a length still caps the panel and still clips**, which is now
  a deliberate opt-in rather than the default; per-instance overrides that only existed to work
  around the old cap can be deleted.

- **`gog-button`'s loading spinner was painted with the page's text colour.**
  `--gog-btn-primary-spinner-color` and `--gog-btn-secondary-spinner-color` resolved to
  `--gog-text-color` — the colour of text on the page background — while the label beside the
  spinner used `--gog-accent-text-color`, the colour meant to sit on the button's fill. On the two
  filled variants those are opposite ends of the palette, so the spinner came out washed out: on
  the dark theme, `#f3ebd8` parchment on a `#fbbf24` amber button, next to a near-black label.
  Both now resolve to the variant's own label colour, so a spinner reads exactly as strongly as
  the text it replaced and follows any re-theming of the button's foreground. `outline` and
  `ghost` were already correct and are untouched.

  Only the two tokens' values changed; no token was added or removed. A theme that sets either
  one explicitly is unaffected. Note the button as a whole still dims to
  `--gog-btn-loading-opacity` (0.7) while loading — that is deliberate and separate from this.

## [21.4.3] - 16.08.2026

Two components stopped fighting their container. Nothing was added or removed from any public
API, but **`gog-calendar` and `gog-datepicker [inline]` are narrower than they were** — see the
first entry if you were relying on a calendar filling its container.

### Changed

- **`gog-calendar` caps itself at its own month grid.** Its host was a block with no width, so
  in any container wider than the grid the header — a flex row carrying the title and its six
  nav chevrons — stretched the full width while the days huddled at the start. Every consumer
  placing a calendar in a plain container had to write a width by hand to get a calendar that
  looked like one. The new `--gog-calendar-max-width` (default `max-content`) does it once:
  `max-content` needs no numbers and already tracks the size variants, `numberOfMonths`,
  `showTime` and locales whose weekday abbreviations run wider than English's. It is a cap, so
  a narrower container still constrains the host.

  This sizes `inline` mode too — `[inline]="true"` renders `gog-calendar` with a border and
  nothing else. **Set `--gog-calendar-max-width: 100%` to keep the old full-width behaviour.**

- **`--gog-datepicker-panel-width`** (default `max-content`) exposes the dropdown panel's width,
  which was hardcoded. Same value as before; nothing changes unless you set it.

### Fixed

- **`gog-tabs` no longer scrolls the page to reach its active header.** It centred the active
  header with `Element.scrollIntoView()`, which scrolls _every_ scrollable ancestor that needs to
  move — so a tabs component below the fold dragged the whole page down to itself the moment it
  initialised, and a page with several of them landed the reader at the last one. It now scrolls
  its own header viewport directly: the active header still centres, nothing outside the
  component moves. No API change; `scrollActiveIntoView` behaves as documented, only without the
  side effect.

## [21.4.2] - 15.08.2026

Documentation only — no component, input, output or token changed, so upgrading from 21.4.1 is
a version bump with nothing to migrate.

### Added

- **`CHANGELOG.md` now ships inside the npm package**, alongside `README.md`, `AGENTS.md` and
  `TOKENS.md`. It was repo-only, which meant nothing could show release notes for the exact
  version a reader has installed — and this file is the only source that cannot drift from the
  package, because it travels inside it. Read it at
  `node_modules/@guildofgleks/ui/CHANGELOG.md`; it is also what the documentation site's releases
  page will render. Costs ~68 KB in the tarball and nothing at runtime.

### Fixed

- **`AGENTS.md` was missing `gog-slider`'s range mode.** `range`, `rangeValue`
  (`GogSliderRange`), `startDisabled`/`endDisabled` and `startAriaLabel`/`endAriaLabel` shipped
  in 21.3.1 but never reached the agent reference. An agent reading it concluded the slider
  cannot express a range and built a two-slider workaround — the API was there all along.
- **`AGENTS.md` did not mention the `GOG_ICONS` token.** `provideGogIcons(...)` was documented,
  but not the token it provides — which is what an app injects to read the registered set back
  (an icon picker enumerating it). Public since 21.4.0, undocumented until now.

`AGENTS.md` is the file a coding agent reads to build against this package, so a gap in it
produces code written against API that does not exist, or workarounds for API that does. Both
entries above are that kind of gap, which is why a documentation-only patch was worth cutting.

## [21.4.1] - 14.08.2026

### Fixed

- **Overlays ignored custom properties set on `:root`.** A select panel, tooltip or any other
  overlay rendered into `<body>` copied the `data-theme` of its trigger's nearest themed
  ancestor. When that ancestor is `<html>` — the usual case — the copy made the overlay match
  `theme.css`'s derived layer (`:root, [data-theme]`) _locally_, re-declaring every component
  token against the plain preset palette and discarding anything set on the root that the preset
  does not itself declare.

  Inline custom properties are what this hit: a page that overrides `--gog-*` on
  `document.documentElement` — a live theme editor, or any runtime accent switch — saw the
  document follow while every overlay kept rendering the un-edited theme.

  The attribute is now copied only for a genuinely _scoped_ theme, where the overlay would
  otherwise pick up the document's; when the theme sits on the document element, inheritance
  already does the work. Several themes rendered side by side in scoped subtrees keep working
  exactly as before.

## [21.4.0] - 14.08.2026

A minor rather than a patch: this adds public API. Iterations 5 and 6 of the consumer-DX plan
(`docs/consumer-dx-plan.md`).

### Added

- **`gog-table`: outputs.** The component had none at all, which is what made it a display-only
  grid. `gogSortChange` (`{ field, direction }`, including the third click that clears the sort),
  `gogPageChange` (the new 1-based page), and `gogRowClick`
  (`{ row, index, originalEvent }`).

  `gogPageChange` deliberately stays quiet in two cases: the initial render, and the reset to
  page 1 that a new sort causes — that reset is part of the sort, and a consumer refetching from
  both events would issue two requests for one user action.

- **`gog-table`: `lazy` — server-driven sorting and paging.** With `[lazy]="true"` the table
  stops sorting and slicing `value` and renders it exactly as handed over, treating it as the
  current page; `totalRecords` tells the paginator how many pages exist, and the two outputs are
  the refetch signals. Row numbering still counts from the current page, and `showTotal` reports
  `totalRecords` rather than `value.length`. Without `totalRecords` pagination stays hidden and
  the table warns in dev mode. Until now the table sorted and paged purely in memory, so anything
  backed by a real endpoint had to be built on something else.
- **`gog-table`: row selection.** `selectionMode` (`'none' | 'single' | 'multiple'`) plus a
  two-way `[(selection)]`, always a `T[]` — in `'single'` mode it simply holds zero or one row,
  which is one shape to read rather than a `T | T[] | null` union to narrow. A checkbox column
  renders automatically (`showSelectionColumn` turns it off), and the header select-all appears
  only in `'multiple'` mode.

  **The select-all covers the current page, not the whole data set** — in `lazy` mode the table
  has never seen the other pages, and a control that meant different things in the two modes
  would be worse than either behaviour on its own.

- **`gog-table`: `dataKey`.** The field (or dot-path) identifying a row. Selection matches on it
  instead of object identity — without it a refetch producing new objects silently drops the
  selection — and it becomes the `@for` track key, so the rendered DOM survives a refetch of the
  same page instead of being torn down and rebuilt.
- **`gog-table`: `interactiveRows`.** Makes rows focusable and styles them as clickable, with
  Enter and Space activating the focused row. `gogRowClick` fires on a click either way; this is
  what stops a whole-row target from being mouse-only.
- **`[gogButton]` — a link that looks like a button.** `gog-button` renders its own `<button>`,
  so it could never _be_ a link, and a large share of buttons on a real site are navigation. The
  directive inverts the relationship: the element stays the consumer's, and only the look is
  applied.

  ```html
  <a gogButton routerLink="/pricing">See pricing</a>
  <a gogButton variant="ghost" href="https://example.com" target="_blank" rel="noreferrer">Docs</a>
  <button gogButton variant="outline" size="sm" type="submit">Save</button>
  ```

  Chosen over an `as="a"` / `routerLink` input trio on `gog-button` because that would mean
  brokering the router's whole input surface through the component **and taking a dependency on
  `@angular/router`** — a fifth peer, and one that would break every app without a router. With
  the directive, `routerLink`, `href`, `target`, `download`, `type="submit"` and anything else
  keep working because they were never taken away.

  `variant`, `size` and `fullWidth` behave exactly as on the component, `size` included in its
  `GOG_CONFIG.control.size` fallback. It deliberately has no `disabled` (there is no such thing
  on an `<a>`) and no `loading` (the spinner is a projected child a directive cannot add). The
  selector is `a[gogButton], button[gogButton]`, not a bare attribute, so it cannot be put on a
  `<div>` and produce something that looks clickable and is invisible to the keyboard.

- **`gog-paginator`: a rows-per-page select.** `showPageSizeSelect` turns it on (**off by
  default** — a paginator that silently grew a control would change every existing layout) and
  `pageSizeOptions` sets the choices, defaulting to `[10, 20, 30, 40, 50]`. Both are also
  settable app-wide through the new `GOG_CONFIG.paginator`, so one page can offer `5, 10, 20`
  while the rest of the app uses the house default.
- **`gog-paginator`: `pageSize` (a `model`) and `totalRecords`.** Given `totalRecords`, the
  paginator derives the page count from `pageSize` itself — which removes the
  `computed(() => Math.ceil(total / size))` a consumer would otherwise have to write _and_ keep
  in sync with the select. `totalPages` still works and is right when a server hands you a page
  count directly; `totalRecords` wins if both are set. Changing the size returns to page 1:
  "page 5" of 10-row pages is not "page 5" of 50-row ones, so clamping alone would leave the user
  somewhere they never asked to be.
- **`gog-table`: `showPageSizeSelect` / `pageSizeOptions`**, forwarded to its paginator, and
  **`GOG_CONFIG.labels.rowsPerPage`** for the select's accessible name.
- **`GOG_CONFIG.labels`: `total`, `tablePagination`, `selectRow`, `selectAllRows`.** The table's
  own chrome — the row-count label read `Total:` from a hardcoded string, and its paginator was
  labelled `Table pagination` with no way to change either.

- **`provideGogIcons(...)` — register your own icons by name.** `gog-icon` shipped a closed set
  of 20 glyphs, and the only way to render anything else was a `TemplateRef` per instance,
  which costs an `<ng-template>` at every use site and does not work at all for the components
  that take an icon _name_ (`gog-tag`, `gog-chip`, `gog-tabs`, `gog-button-toggle-group`,
  `ToastService`, `DialogService`). In practice that meant installing a second icon library —
  precisely the dependency the "no CDK, no Material" footprint exists to avoid.

  ```ts
  // app.config.ts
  providers: [provideGogIcons({ cart: '<svg viewBox="0 0 24 24">…</svg>' })];
  ```

  ```html
  <gog-icon name="cart" /> <gog-tag iconName="cart">In basket</gog-tag>
  ```

  - A registered name **overrides a built-in of the same name**, so an app can replace the
    library's checkmark or chevrons everywhere without touching a single component.
  - Providing it again lower in the injector tree **layers onto** the parent set rather than
    replacing it, matching `provideGogConfig`.
  - The registry is also exposed as the `GOG_ICONS` injection token.

- **`GogBuiltinIconName`** — the closed union of the shipped glyphs, for code that wants
  exhaustiveness (an icon gallery, a `Record` keyed by icon).
- **21 more built-in icons, taking the set from 20 to 41.** The old set covered what the
  library's own components needed and almost nothing an app needs: there was no `search` for a
  field, no `trash` for a destructive action, no `more-vertical` for a table row menu. Added, all
  Lucide, all on the same 24×24 / stroke-2 grid as the existing ones:
  - actions — `search`, `plus`, `minus`, `trash`, `pencil`, `download`, `upload`, `refresh`,
    `filter`, `external-link`;
  - chrome — `menu`, `more-horizontal`, `more-vertical`, `settings`;
  - navigation — `arrow-left`, `arrow-right` (distinct from the chevrons, which read as
    disclosure rather than movement);
  - objects and state — `user`, `lock`, `mail`, `star`, `star-filled`.

  `star`/`star-filled` is the only outline/filled pair, for a rating or favourite **toggle** —
  the same case `checkbox`/`checkbox-checked` already covers. The set stays outline-only
  otherwise: a solid duplicate of every glyph would double the payload for a distinction almost
  nothing needs, and `provideGogIcons` covers the exceptions.

  Cost: `ICON_DEFS` is one object, so every consumer pays for all of it — it grew from 8.0 KB to
  16.5 KB raw, **1.6 KB to 2.7 KB gzipped**.

- **Attribution for the icons.** The glyphs were always Lucide but the package said so nowhere;
  Lucide's ISC licence asks for the notice to travel with them. It is now at the top of
  `icons.ts` and summarised in the README's licence section.

### Changed

- **The button's `.gog-btn*` block moved from the component stylesheet into
  `styles/button.css`**, which `styles/index.css` imports. Angular's emulated encapsulation
  would never let a component stylesheet reach an `<a>` declared in a consumer's template, so
  `[gogButton]` needs the rules to be global — the same reason `gogBadge` and `gog-collapsible`
  already keep theirs there. One source for both, no duplication. Costs about 1 KB gzipped in the
  always-loaded stylesheet; nothing changes for anyone already importing `index.css`, which the
  Setup section has always required.
- **`npm run check:tokens` now covers the global stylesheets too.** It scanned `lib/**/*.scss`
  plus a hardcoded `utilities.css`; it now walks `styles/*.css` as a directory, so a new global
  stylesheet is under the token contract the moment it exists rather than whenever someone
  remembers to add it. 34 stylesheets checked before, 38 now.
- **`gog-table`'s `pageSize` is a `model`, not an `input`.** `[pageSize]="20"` is unchanged;
  `[(pageSize)]="size"` is now possible, and that is what lets the rows-per-page select work with
  no wiring — the table binds its own model straight to the paginator's, so nothing is ferried
  between the two by hand. `pageSizeChange` comes free from the model and is the refetch signal
  in `lazy` mode.
- **The table footer no longer hides at a single page while the size select is on.** Hiding it
  would strand the user on whatever size produced that one page, with no control left to choose a
  smaller one. With the select off, the old behaviour is unchanged.
- **`GogIconName` is now open: `GogBuiltinIconName | (string & {})`.** The built-ins still
  autocomplete; a registered name is now accepted wherever an icon name is taken, with no change
  at any of the ten call sites that use the type. The trade is deliberate and comes with the
  registry: a typo is no longer a compile error, so **an unknown name renders nothing and warns
  in dev mode** (once per name) instead of throwing — an icon is decoration, and failing a render
  over a glyph name would be the worse failure. Code that relied on `GogIconName` being closed
  — an exhaustive `switch`, `Record<GogIconName, …>` — should move to `GogBuiltinIconName`.

### Fixed

- **Buttons no longer inherit the anchor underline.** `.gog-btn` never reset `text-decoration`,
  because a `<button>` has none to reset — the moment the same block landed on an `<a>` via
  `[gogButton]`, every link-button came out underlined.
- **`--gog-icon-stroke-width` now applies to every shape in an icon.** The rule listed only
  `path`, `circle` and `rect` — which happened to be all the original 20 glyphs used, so the gap
  was invisible. Any icon drawn with `line`, `polyline` or `polygon` (half the new ones, and
  whatever a consumer registers) silently ignored the token and fell back to the `stroke-width`
  attribute baked into its own markup. `ellipse` is covered too.

## [21.3.2] - 13.08.2026

First batch of the consumer-DX plan (`docs/consumer-dx-plan.md`, iterations 1–4): the seam
between the package and the developer installing it — setup that failed on the documented
path, accessibility that depended on optional inputs, and native attributes a wrapper component
made unreachable.

### Added

- **The baseline stylesheet now also ships at `@guildofgleks/ui/styles/`.** This is the path the
  README has always documented, and until now it did not exist in the package — the files were
  only under `src/styles/`, so a setup copied from the README failed on a missing file and every
  component rendered unstyled. Both paths ship for one deprecation window, and `package.json`'s
  `exports` map now lists them, so `@import '@guildofgleks/ui/styles/index.css'` resolves from
  SCSS as well as from `angular.json`.
- **`gog-inputfield` / `gog-textarea`: the native attribute space.** `readonly`, `maxlength`,
  `minlength`, `spellcheck`, plus `pattern` and `inputMode` on the input. `readonly` differs
  from `disabled` in the usual way (still focusable, still submitted) and suppresses the clear
  button and the number field's spin buttons, since both offer an edit the field would refuse.
  `autofocus` is deliberately **not** forwarded — moving focus unasked is a documented a11y
  problem and the repo's own lint rule rejects it.
- **`gog-inputfield`: `tel`, `url`, `search`, `time` and `datetime-local` types**, via the new
  exported `GogInputType`. The new `GogInputMode` types the `inputMode` input.
- **`GOG_CONFIG.labels`.** App-wide defaults for every fixed string the library renders —
  `clear`, `clearSelection`, `clearDate`, `selectAll`, `clearAll`, `increment`, `decrement`,
  `showPassword`, `hidePassword`, `closeDialog`, `closeToast`, `pagination`, `previousPage`,
  `nextPage`, `openCalendar`, `today`, `thisMonth`, `previousMonth`, `nextMonth`,
  `previousYear`, `nextYear`, `hours`, `minutes`, `seconds`, plus `page` (a formatter — see
  Fixed). A non-English app relabels the library once instead of on every instance.
  Per-instance inputs still win where they exist.
- **`gog-multiselect`: `selectAllLabel` / `clearAllLabel`.** The panel's two buttons rendered
  literal `Select all` / `Clear` with no way to change them at all.
- **`gog-calendar`: `hoursLabel` / `minutesLabel` / `secondsLabel`.** The time section's three
  fields had hardcoded English `aria-label`s.
- **`GOG_CONFIG.theme`.** `storageKey` persists the chosen theme in `localStorage`;
  `followSystem` opens in the OS `prefers-color-scheme` setting and keeps following it until the
  app calls `setTheme`; `defaultTheme`, `lightTheme` and `darkTheme` name the themes involved.
  All off by default, so an app that configures nothing keeps today's behaviour exactly.
- **`@angular/platform-browser` is now declared as a peer dependency.** `gog-icon` has always
  imported `DomSanitizer` from it; the omission only worked because npm's flat tree hides it,
  and broke under strict pnpm.

### Fixed

- **Form controls are labelled without an `inputId`.** `gog-inputfield` and `gog-textarea` now
  generate an id when none is given, so the `<label for>` actually points at the field (clicking
  the label focuses it, assistive tech gets a name) and the error message is reachable through
  `aria-describedby`. Previously both were silently dropped unless the consumer happened to pass
  `inputId` — the default configuration was inaccessible. `gog-select` already worked this way;
  the id generator is now shared (`gog-radio-group` and `gog-slider` use it too, with unchanged
  output).
- **`aria-describedby` no longer points at an element that isn't rendered.** It was keyed off
  `hasError()`, while the message element renders on `visibleError()` — with `errorDisplay="auto"`
  and an empty `errorMessage` the two disagree.
- **Toasts are announced reliably.** `aria-live` moved off the individual toast, which enters the
  DOM together with its own text (a live region created at the same moment as its content is
  routinely skipped by screen readers), onto two permanently-mounted regions in
  `gog-toast-container` — polite, and assertive for `error`/`warning`. Individual toasts no longer
  carry `role`/`aria-live`, so nothing is announced twice.
- **`gog-inputfield`: the clear button on a number field wrote `''` instead of `null`.** A
  `FormControl<number | null>` ended up holding a string, which then failed numeric validators
  and round-tripped the wrong type. It now writes exactly what emptying the field by hand writes.
- **`ThemeService.theme` is read-only.** It was a writable signal, so `theme.set(...)` moved the
  signal without touching the `data-theme` attribute the styles read, leaving the two out of
  sync. Use `setTheme`/`toggleTheme`.
- **`gog-inputfield`: a `clearable` number field had no clear button.** The stepper and the
  clear button share the field's end slot, and the stepper won outright — so `clearable` was
  silently a no-op on `type="number"` unless `showSpinButtons` was also off. Both now render:
  the clear button sits one stepper-width further in, and the field's text gutter widens to fit
  the pair (`--gog-input-spin-width`, new). It still disappears when there is nothing to clear,
  taking the extra gutter with it.
- **`gog-calendar` now reads `GOG_CONFIG.datepicker`.** `locale` and `firstDayOfWeek` were
  documented as applying to `gog-calendar` as well as `gog-datepicker`, but the calendar only
  ever honoured its own inputs — so a standalone `<gog-calendar>` in an app with an app-wide
  locale silently rendered in `en-US`. Rendered through `gog-datepicker` nothing changes: that
  component passes its own already-resolved values, which still win.
- **`gog-paginator`: the per-page button names are translatable.** "Go to page 4" / "Page 4,
  current page" were built by string concatenation in the template. They now come from
  `GOG_CONFIG.labels.page`, a `(page, isCurrent) => string` formatter — a function rather than a
  placeholder string, since the number's position and the grammar around it are language
  dependent.
- **The textarea resize grip's offsets are real tokens.** `--gog-textarea-resize-grip-offset`
  and `--gog-textarea-resize-inset-right`/`-bottom` are declared in `theme.css` instead of
  living as literal `var()` fallbacks in the component stylesheet, which the token-contract
  check (`npm run check:tokens`) had been failing on. Geometry is unchanged.

### Changed

- **The generated token catalogue moved from `README.md` to `TOKENS.md`.** It was ~200 KB of
  reference table in the middle of the README, burying the Setup section that a new consumer has
  to find within seconds on npm. The README keeps the three-layer explanation and links across;
  the README itself is now ~14 KB. `GOG_TOKEN_GROUPS` is unaffected.
- **README: `<gog-dialog />` and `<gog-toast-container />` are documented.** `DialogService.open()`
  and `ToastService.show()` render nothing until those host elements are in a template, which
  the README never said.
- **README: a `## Global configuration` section.** `provideGogConfig` was never documented in the
  README at all — only individual keys mentioned in passing — so the app-wide settings, and now
  `labels` and `theme` with them, were undiscoverable to anyone reading the package page. Adds
  the key list, the precedence rule, the injector-tree merge, and a translation example.
- **README / `AGENTS.md`: the new API is documented.** Both ship inside the package. `AGENTS.md`
  (the consumer-facing agent reference) has the native attributes, `GOG_CONFIG.labels` and
  `.theme`, the read-only `ThemeService.theme`, generated field ids, the toast live regions, and
  `GogInputType`/`GogInputMode` in its type table.
- **README: the component list is complete again.** It advertised 18 components and listed 21,
  while omitting `gog-autocomplete`, `gogBadge`, `gog-button-toggle-group`, `gog-datepicker`,
  `gog-divider`, `gog-progressbar`, `gog-tabs` and `gog-toggle` entirely.
- Label inputs that now resolve through `GOG_CONFIG.labels` changed their default from a literal
  string to `undefined` (`clearAriaLabel`, `incrementLabel`, `decrementLabel`, `showPasswordLabel`,
  `hidePasswordLabel`, `todayLabel`, `thisMonthLabel`, `previousMonthLabel`, `nextMonthLabel`,
  `previousYearLabel`, `nextYearLabel`, `openCalendarLabel`, `gog-paginator`'s `ariaLabel`).
  Rendered output is identical unless the app configures `labels`; only reading the input back
  in TypeScript now yields `undefined` rather than the English default. `gog-calendar`'s
  `locale` and `firstDayOfWeek` changed the same way, for the same reason.

### Deprecated

- `@guildofgleks/ui/src/styles/…` — use `@guildofgleks/ui/styles/…`. Both ship until **21.5.0**,
  when the `src/styles/` copy is removed.

## [21.3.1] - 11.08.2026

### Added

- **`gog-slider`: `range`.** Switches the slider to two independently focusable native
  thumbs for picking a span instead of a single value — bind `[(rangeValue)]` (a
  `GogSliderRange` `{ start, end }` pair) instead of `[(value)]`; the two are mutually
  exclusive, and `writeValue`/the `ControlValueAccessor` follow whichever one `range` selects.
  Neither thumb can be dragged, keyboard-nudged, or written past the other — crossing is
  clamped in JS rather than through the native `min`/`max` attribute, since narrowing that
  per thumb would desync the browser's own (invisible) thumb position from the custom
  `--range-start-pos`/`--range-end-pos`-driven visuals. Works in both orientations and with
  `showThumb`/`fullWidth`/`disabled`/error display exactly as the single-value mode does.
  `startAriaLabel`/`endAriaLabel` (defaulting to `'Minimum'`/`'Maximum'`, prefixed with
  `label()` when set) name the two thumbs for assistive tech, since a single `<label for>`
  can't target both. The value readout (`showValue`) reserves stable width up front, sized
  from `min()`/`max()`/`step()` rather than the live value, so it — and, in a `fit-content`
  vertical slider, the whole control along with it — doesn't visibly resize on every drag.
- **`gog-slider`: `startDisabled`/`endDisabled`.** Disable just one thumb in `range` mode —
  e.g. pin a range's floor while leaving its ceiling adjustable, or vice versa — instead of
  `disabled`, which still takes out both together. ORed with `disabled` rather than
  overriding it, and ignored outside `range` mode (nothing to disable "one side" of there). A
  one-sided disable only dims and disables that one thumb (its native input's own `disabled`
  attribute takes it out of the tab order); the whole-control `.gog-slider--disabled` styling
  (dimming + `pointer-events: none` over the whole track) only kicks in once _both_ sides are
  disabled, since applying it for just one would also block pointer input to the other,
  still-enabled thumb. Reactive forms are unaffected by this addition: a `[formControl]`'s own
  `.disable()`/`.enable()` still speaks for both thumbs at once, same as before — one
  `FormControl` backs one `rangeValue` and has no way to target just one side of it.

- **`gog-autocomplete`: `openOnFocus`.** Focusing the field now opens the panel immediately with
  the full option list, ignoring `minLength` — the common "browse everything, then narrow it
  down" pattern a plain type-ahead can't offer. On by default; turn it off (or set
  `GOG_CONFIG.autocomplete.openOnFocus = false`) to keep the previous behaviour of nothing
  showing until enough has been typed. The list stays unfiltered even when the field already
  displays a previously-selected label, and normal filtering resumes on the first keystroke.
- **`gog-autocomplete`: `gogLoadMore`.** Fires once the panel is scrolled to the end of the
  option list — the signal to fetch and append another page, instead of handing a huge or
  server-backed source over up front (500,000 rows loaded 20 at a time, not all at once).
  Forwarded from the panel's own `gog-scroll`.
- **`gog-tabs`: `scrollActiveIntoView`.** With an overflowing header row, selecting a tab —
  by click, the arrow keys, or a consumer setting `activeIndex` directly — now scrolls the
  header so the active tab stays in view, centered where there's room so its neighbours on
  both sides stay visible too. The same "show what's around the current position" idea
  `gog-paginator` already uses for pages. On by default; instant on first render, smooth (or
  instant under `prefers-reduced-motion`) after. Turn it off to own the scroll position
  yourself.
- **`gog-tabs`: `showScrollTrack`; `gog-scroll`: `showTrack`.** With `scrollActiveIntoView`
  driving the header's scroll position, its own draggable thumb/track next to the active-tab
  underline read as two conflicting position indicators for the same thing — confusing rather
  than helpful, per feedback on the first cut of `scrollActiveIntoView`. `gog-tabs` now hides
  the track by default while `scrollActiveIntoView` is on, and shows it by default once that's
  off (the only way left to reach an off-screen tab by mouse); either can be pinned explicitly
  with `showScrollTrack`, regardless of the other. Native scrolling — wheel, touch, keyboard,
  and any programmatic `scrollTo`/`scrollIntoView` — is unaffected either way; only the visual
  affordance is gone. The underlying toggle lives on `gog-scroll` itself as `showTrack`
  (instance input, or app-wide via `GOG_CONFIG.scroll.showTrack`), so any other panel built on
  it gets the same option.
- **`gog-textarea`: `resize`.** Which direction(s) the field's own drag handle resizes it in —
  `'vertical'` (the default, matching a plain `<textarea>`), `'horizontal'`, `'both'`, or
  `'none'` to remove it entirely. Settable app-wide via `GOG_CONFIG.textarea.resize`. The
  handle itself is also restyled: the browser's native glyph is barely visible at a glance, so
  it's blanked out (`::-webkit-resizer`, where that's even stylable — Firefox never exposed a
  hook for its own) and replaced with two short diagonal strokes in the field's own border
  colour, sized and positioned to sit inside the border rather than past it. A `ResizeObserver`
  on the field keeps the grip glued to its actual corner as it's dragged narrower/shorter than
  its container (`'horizontal'`/`'both'`) — it's anchored to the container, not the field
  itself, since a `<textarea>` can't reliably host `::after`. The drag stays entirely native;
  only the glyph and its tracking are new.
- **`gog-inputfield`: number spin buttons.** A `type="number"` field now gets the library's own
  increment/decrement buttons instead of the browser's native ones, which render inconsistently
  across Chromium/Firefox/Safari and were never themed. Flush against the field's own border as
  one grouped stepper (a divider on each side), not floating loose in the icon gutter. Steps by
  `step` (default `1`), clamps to `min`/`max`, and disables the button at whichever boundary is
  reached. Arrow-key stepping on the focused field is untouched — that's native
  `<input type="number">` behaviour, unrelated to which glyphs are visible. `showSpinButtons`
  turns them off entirely (native glyphs never come back — off means no stepper UI at all);
  settable app-wide via `GOG_CONFIG.inputfield.showSpinButtons`.
- **`gog-icon`: `copy`.** A new glyph for the common "copy this field's value" trailing-action
  pattern (see the inputfield showcase page for a full example built on `gogInputAddonEnd`).
- **`AGENTS.md`.** A consumer-facing reference for AI coding agents building apps against the
  published package — conventions, theming/`GOG_CONFIG` summary, a full per-component API table
  (inputs, outputs, slots, CVA status), and the deprecated-pattern list, all derived from the
  library's actual source rather than the (currently lagging) `README.md`. Shipped alongside
  `README.md`/`LICENSE` in the npm package via `ng-package.json`'s `assets`.

### Fixed

- **`gog-scroll`: thumb too small to reliably click, especially at `size="thin"`.** The
  thumb's own visible box is exactly as wide as `size` says — that part is unchanged — but its
  clickable/draggable _region_ now extends a few pixels past every edge
  (`--gog-scroll-thumb-hit-padding`, bigger on `thin`, where the visible thumb was hardest to
  land a cursor on), so a near-miss click still grabs the thumb instead of falling through to
  the track, which pages the view rather than dragging. Purely an invisible hit-area change —
  no new input, no behaviour change for the mouse wheel, which already worked fine.
- **`gog-autocomplete`: option rows spilling out of the panel.** The panel's `.gog-scroll` was
  never actually constrained to `--gog-autocomplete-panel-max-height` — a classic flexbox trap
  where a `max-height`-only container doesn't give its flex-grow children a definite size to
  shrink into, so the option list rendered at full content height and visibly overflowed past
  the panel's own border into whatever sat below it. Most visible with `appendToBody` and a
  longer list (typing narrowed it back under the cap, masking the issue until the panel was
  reopened with more matches, which also made it look like "the panel closes on its own" — it
  hadn't; the list had just spilled out from under it). Fixed by giving the panel the same
  `display: flex` + `flex: 1; min-height: 0` chain `gog-select` and `gog-multiselect` already
  use, plus a defensive `overflow: hidden`.

## [21.3.0] - 08.08.2026

### Added

- **Eight new components**, the Angular Material set this library was missing:

  - **`gog-datepicker`** — a date field with a calendar panel: single date, `selectionMode="range"`
    (with `numberOfMonths` for a two-month view), and an optional clock via `showTime` /
    `hourFormat` / `minuteStep` / `showSeconds`. `min`, `max` and a `disabledDates` **predicate**
    (an array cannot express "weekends"), `inline` for an always-visible calendar, `allowTextInput`
    with parsing, plus the usual `clearable` / `floatLabel` / `errorMessage` / `appendToBody`.

    The panel's footer carries **two separate actions**, never one: `showTodayButton` (on by
    default) _selects_ today, and `showThisMonthButton` (off by default) only moves the view back
    to the current month. A single button doing both is ambiguous — after paging away, the same
    label reads as "take me back" to one person and "set it to today" to another. "Today" is
    disabled when `min`/`max` or `disabledDates` rule today out, rather than silently doing
    nothing. Wording via `todayLabel` / `thisMonthLabel`.

    Native `Date`, **no date library and no adapter abstraction** — the package keeps its zero
    runtime dependencies. `Intl` supplies month and weekday names; the display format is a token
    pattern (`dd.MM.yyyy`, `yyyy-MM-dd`, …) used for _both_ rendering and parsing, so what is
    written can always be read back. `31.02.2026` is rejected rather than silently becoming
    3 March. `locale`, `firstDayOfWeek` and `format` are also settable app-wide through
    `GOG_CONFIG.datepicker`.

  - **`gog-calendar`** — the month grid behind it, exported and usable on its own. Follows the
    ARIA grid pattern: arrows by day, `PageUp`/`PageDown` by month, `Shift` + those by year,
    `Home`/`End` to the week's ends, and one tab stop across all 42 cells. Always six weeks, so
    the calendar's height never changes as you page through months.
  - **`gog-autocomplete`** — a text field that suggests options as you type, on the same
    `GogDropdownBase` as `gog-select` and taking the same `optionLabel` / `optionValue` /
    `optionDisabled` accessors. The trigger is a real `<input>`, which is what makes it a separate
    control rather than a mode of `gog-select`: focus never leaves the field and the highlighted
    row is pointed at with `aria-activedescendant`. `gogSearch` is debounced (`searchDebounce`,
    300 ms) for a server-backed source, and `[filterLocal]="false"` stops that server's answer
    being filtered a second time. Plus `minLength`, `loading`, `emptyMessage` and
    `forceSelection`.
  - **`gog-tabs` / `gog-tab`** — a tablist over projected children, each tab declaring its own
    `label`, `iconName` and `disabled`. Content written inside a tab renders eagerly and is
    merely hidden while inactive, so scroll position and half-typed input survive a switch; an
    `<ng-template gogTabContent>` is instead built on first activation and kept alive after.
    Which you get is decided by whether that template is present. `gogTabHeader` replaces the
    header button entirely. Overflowing headers scroll inside a `<gog-scroll>`, not a native
    `overflow-x`.
  - **`gog-button-toggle-group`** — a row of buttons where one, or with `multiple` several, can
    be picked. Options-driven with the same accessors as the dropdowns, plus `optionIcon` and a
    `gogButtonToggleOption` slot. Single and multiple are genuinely different widgets to
    assistive tech and are exposed as such: `role="radiogroup"`/`aria-checked` with arrows that
    move _and_ select, versus `role="group"`/`aria-pressed` with arrows that only move.
    `appearance` picks between one segmented control and discrete buttons.
  - **`gog-toggle`** — an on/off switch. A native `<input type="checkbox">` carrying
    `role="switch"`, so it announces as "switch, on" rather than "checkbox, checked" while the
    platform keeps owning the keyboard and forms. `onLabel` / `offLabel` render _inside_ the
    track — the one thing a checkbox cannot do — and both stay in the DOM so the track's width
    cannot jump as it flips. Shares `gog-checkbox`'s size scale.
  - **`gog-progressbar`** — determinate, indeterminate and buffer modes, five sizes and the
    semantic colour set. `value` and `buffer` are clamped to 0–100 rather than trusted.
    Indeterminate reports **no** `aria-valuenow` at all, which is what marks it indeterminate,
    and its animation is replaced by a static stripe under `prefers-reduced-motion`.
  - **`gogBadge`** — a count or dot pinned to another element's corner. A directive, so it
    decorates a button, icon or avatar without wrapping it. `badgePosition`, `badgeVariant`,
    `badgeDot`, `badgeMax` (`99+` beyond it), `badgeHidden` and `badgeAriaLabel`. It renders
    **nothing at all** for `0`, `null` or `''` — a badge reading "0" is the defining bug of this
    component class, so it is not reachable.
  - **`gog-divider`** — a rule between two regions, horizontal or vertical, solid/dashed/dotted,
    with an optional projected label running through it and an `inset` variant for lists. No
    `hasLabel` input: the two forms are told apart by whether anything was actually projected.

- `GogOrientation` — one shared `'horizontal' | 'vertical'` type. `GogSliderOrientation` is now
  an alias of it, so nothing changes for existing code.
- `roving-focus.ts` gained an `orientation` (so a horizontal tablist leaves `ArrowDown` to the
  page) and an optional predicate for skipping disabled items. Both default to the previous
  behaviour, so `gog-select`, `gog-multiselect` and `gog-accordion` are unaffected.
- Four icons: `calendar`, `clock`, `chevron-left`, `chevron-right`.
- `.gog-visually-hidden` in `styles/utilities.css`.

- `GogFloatLabelState` (exported) — the shared float-label state behind `gog-inputfield`,
  `gog-textarea`, `gog-select` and `gog-multiselect`, previously three near-identical copies of
  the same five `computed()`s. A plain composition class in the mould of `GogErrorState`, so it
  serves the two components that share no base class as well as `GogDropdownBase`, which is one.
  Each control still supplies its own "has content" signal, since that genuinely differs
  (non-empty string / non-null selection / non-empty selection array).
- `resolveConfigured(instanceValue, configuredValue, fallback)` (exported) — the library's
  input → `GOG_CONFIG` → built-in default precedence rule in one place, instead of the `??`
  chain hand-written at each configurable input.
- `GOG_CONFIG` now covers the settings an app otherwise repeats on every instance:
  `control.size` and `control.errorDisplay` (the latter is what makes `errorDisplay="auto"` an
  app-wide decision for a Reactive Forms app rather than per-field boilerplate),
  `dropdown.appendToBody`, `dropdown.direction`, and `toast.position` / `toast.duration`.
  `control.size` deliberately covers only the interactive form controls — `gog-table`,
  `gog-accordion` and `gog-paginator` keep their own density defaults, as do `gog-spinner`,
  `gog-skeleton`, `gog-tag` and `gog-chip`. All stay per-instance overridable.

- **A built-in clear button** on `gog-inputfield`, `gog-textarea`, `gog-select` and
  `gog-multiselect`, via a `clearable` input (plus `clearAriaLabel`). It appears only once the
  control has something to clear and disappears again when empty, so it adds no permanent
  chrome — and it removes the need for a fake `"— not selected —"` option just to let someone
  undo a choice. Also settable app-wide through `GOG_CONFIG.control.clearable`. Defaults to
  `false`, except `gog-multiselect`, which already had a clear button and keeps it. On a
  password field the built-in reveal toggle keeps the trailing slot.
- `filterPosition` on `gog-select` / `gog-multiselect` (`'top'` | `'bottom'`, plus
  `GOG_CONFIG.dropdown.filterPosition`) sticks the search box to either end of the panel, and it
  now carries a divider on the side facing the list so it reads as chrome rather than a row. The
  name matches `gog-multiselect`'s existing `controlsPosition` rather than inventing a second
  vocabulary for the same idea.
- **Filtering in `gog-select` and `gog-multiselect`** — `filter` puts a search box at the top of
  the panel, matching case-insensitively on the resolved `optionLabel`. `filterMatch` swaps that
  for your own predicate, `filterPlaceholder` and `filterEmptyMessage` cover the wording, and
  `GOG_CONFIG.dropdown.filter` turns it on app-wide. The query resets when the panel closes, and
  `gog-multiselect`'s "select all" deliberately takes only the _visible_ options so it means what
  it says while a filter is active.
- `styles/presets/one-dark.css` and `styles/presets/one-light.css` — the Atom/JetBrains One
  palettes, with the syntax hues mapped onto the library's semantic roles (blue is the accent,
  green/red/yellow/cyan become success/danger/warning/info).

- **The token catalogue is generated, not hand-copied.** `npm run generate:tokens` derives
  `GogTokenName` (a union of every `--gog-*` the library declares or documents), the
  `GOG_TOKEN_GROUPS` runtime metadata, and the README's theming table straight from
  `theme.css`. `npm run check:tokens` fails when they are out of date, so a stylesheet edit
  cannot silently leave the docs behind. `GOG_TOKEN_GROUPS` is exported so a theme editor can
  enumerate real tokens instead of keeping its own copy.
- `styles/presets/slate.css` — a second, importable preset (`data-theme="slate"`, cool/indigo).
  It declares palette tokens only and still restyles everything, which is the theming contract
  demonstrated rather than described.

- **`gog-select` and `gog-multiselect` take your own objects.** `optionLabel`, `optionValue` and
  `optionDisabled` accept a property path (dot-paths included, `'profile.fullName'`) or a
  function, so a real DTO goes straight in — no mapping into `{ id, name }` first, and no losing
  the original object on the way back out. Set `[optionValue]="null"` and the control emits the
  **option object itself** instead of an id. Both controls are now generic over their option and
  value types, inferred from the bindings.

  Defaults are `'name'` / `'id'` / `'disabled'`, so **existing code is unaffected** — the whole
  21.2.x select/multiselect spec suite passes unchanged. `GogDropdownOption` is no longer a
  requirement, just the shape those default accessors expect.

- `gogDropdownOption` — a projected template for one option row, with
  `{ $implicit: option, selected, disabled, label }` as its context.
- `getByPath`, `readOption`, `isSameOptionValue` and the `GogOptionAccessor<TOption, TResult>`
  type are exported; `gog-table` now shares the same `getByPath` rather than keeping its own copy.

- **One slot mechanism across the library.** Custom markup is now projected as content and
  picked up with `contentChild`, instead of a `TemplateRef` input per slot. New directives:
  `gogColumnBody` / `gogColumnHeader` (per column, replacing the string-keyed
  `<ng-template template="…" type="…">`), `gogCheckboxIcon`, `gogTagIcon`,
  `gogMultiselectClearIcon`, `gogDropdownChevron`, and `gogInputAddonStart` /
  `gogInputAddonEnd`. A projected slot always wins over the deprecated input it replaces, so a
  codebase can migrate one call site at a time.
- `GogColumn` with the `gog-column` selector — the library's last unprefixed element name.
- `gog-inputfield` addon slots take arbitrary markup, including a real `<button>` with its own
  `aria-label` and `(click)`. This replaces six inputs (`icon{Start,End}{Template,Fn,Label}`)
  with two slots. On `type="password"` the built-in reveal toggle keeps the trailing slot, so a
  projected addon can never displace the only control that shows the value.

### Fixed

- **An auto-width dropdown clipped its own options.** With `[fullWidth]="false"` the trigger
  sizes to the _current_ selection, and the panel copied that width — so picking a short option
  cut the longer ones off the list. The relationship is now inverted: the panel sizes to its own
  content with the trigger's width as a **floor**, capped by
  `--gog-{select,multiselect}-panel-max-width`. New `minWidth` input (any CSS length) plus
  `--gog-{select,multiselect}-min-width` (120px) so an auto-width trigger cannot collapse to its
  own chrome either.
- **`gog-multiselect` now collapses a long selection into `+N`.** The trigger shows what fits on
  one line and a count for the rest, with the full list in a tooltip. Measured with
  `canvas.measureText` rather than by rendering candidates, and re-measured from a
  `ResizeObserver` on the value element, since the space available changes when the _container_
  resizes — something Angular never renders for.
- **`gog-select`'s chevron sat 42px from the trigger's right edge.**
  `--gog-select-chevron-inset` was applied as the trigger's `padding-right` while the chevron
  itself was a flex child _inside_ that padding, so the inset was counted twice. It now lands on
  `--gog-control-icon-offset` (10px), the same line as `gog-inputfield`'s icons and
  `gog-multiselect`'s arrow, which were at 10px and 16px — the three controls did not line up in
  a form. The token keeps its name and now means what it says.
- **`gog-textarea`'s clear button sat inside the scrollbar.** It was inset 8px from the border
  box while a scrolling textarea's scrollbar is ~19px wide, so once the content overflowed the
  button was half-covered and competed with the thumb for clicks. It is now offset by the
  measured scrollbar width (`--gog-textarea-scrollbar-width`, written from
  `offsetWidth - clientWidth`; `scrollbar-gutter: stable` was rejected because it reserves the
  gutter even when the field isn't scrolling).
- **`gog-textarea`'s clear glyph was 30% too small** — 13.4px against the library's 19.2px,
  because it reused the dropdowns' 0.7 ratio, which suits their dense trigger and not a large
  multi-line box. New `--gog-textarea-clear-icon-ratio` defaults to a full-size glyph.
- Nine specs in `scroll.component.spec.ts` awaited a single animation frame after dispatching a
  scroll, while `ScrollComponent` coalesces measurement into its own frame — if that frame fired
  during `whenStable()`, the effect scheduled a second one _after_ the test's, and the assertion
  ran before the measurement. Intermittent by construction; replaced with a `settleMeasure()`
  helper that covers both orderings.

### Changed

- The clear button now takes the **outermost** trailing position on `gog-select` and
  `gog-multiselect`, with the chevron/arrow shifting inward when it appears. Previously
  `gog-multiselect` had them the other way round. Keeps the trigger width stable and keeps the
  destructive control off the very edge.
- Float-label fields are less tall: `--gog-field-float-label-reserve` 18px → 14px and
  `--gog-field-float-label-in-top` 8px → 6px, taking an `md` field from 63px to 59px (a plain one
  is 45px). Both are tokens, so the old numbers are one declaration away.

### Deprecated

Each of these keeps working unchanged and is **removed in 21.5.0**; the `@deprecated` tag on
every symbol carries the same date and removal version, so `grep -rn "@deprecated since"` lists
the full set at any time.

- `<column>` → `<gog-column>`, and the `Column` export → `GogColumn`.
- All `--gog-ms-*` tokens → `--gog-multiselect-*`. Both spellings work for the whole window:
  the `--gog-ms-*` name stays the _declared_ one and the new name derives from it, so an
  existing override of either still reaches the component. Verified in a browser both ways.
- `<ng-template template="field" type="body|header">` inside `gog-table` → a `gogColumnBody` /
  `gogColumnHeader` template declared inside the column itself. The old form matched columns by
  a string the compiler cannot check, so a typo silently fell back to the default cell.
- `gog-checkbox`'s `checkIconTemplate` → `gogCheckboxIcon`.
- `gog-tag`'s `iconTemplate` → `gogTagIcon`.
- `gog-multiselect`'s `clearIconTemplate` → `gogMultiselectClearIcon`.
- `gog-select` / `gog-multiselect` `chevronTemplate` → `gogDropdownChevron`.
- `gog-inputfield`'s `iconStartTemplate`, `iconEndTemplate`, `iconStartFn`, `iconEndFn`,
  `iconStartLabel`, `iconEndLabel` → `gogInputAddonStart` / `gogInputAddonEnd`. `iconStart` and
  `iconEnd` (a bare icon name) stay — that is the genuinely common case.

### Changed

- **`provideGogConfig(...)` now merges with the config from the parent injector instead of
  replacing it.** Previously a nested call — in a route's or a component's `providers` —
  silently dropped every key it did not restate, so a route setting only `{ tooltip: … }` lost
  the app-wide `button.debounce` with no error anywhere. Merging is one level deep, per
  component key, nearest provider winning field by field. If you were working around the old
  behaviour by repeating the whole config at each level, those repeats are now redundant but
  harmless.

- Float label geometry is now themeable through `theme.css` instead of being hardcoded in the
  component stylesheets. `--gog-{input,select,ms}-float-label-{reserve,in-top,over-gap,over-reserve}`
  previously existed only as literal fallbacks (`18px`, `8px`, `1.4em`) inside four component
  `.scss` files, so they were overridable but not discoverable, and `theme.css` did not describe
  the components' full surface. They are now declared component tokens deriving from a new
  shared `--gog-field-float-label-{reserve,in-top,over-gap,over-reserve}` scale, so one
  declaration retunes every field at once while a single control can still be overridden.
  No visual change — the defaults are identical. `--gog-{input,select,ms}-float-label-on-bg`
  stays an instance-layer (undeclared) token as before.

### Added

- Float label support for `gog-inputfield`, `gog-select`, `gog-multiselect` and
  `gog-textarea`: a `floatLabel` input (`GogFloatLabelVariant`: `'none'` default, or
  `'in'`/`'on'`/`'over'`, modeled on PrimeNG's own variant names) that rests the label inside
  the field like a placeholder and floats it up on focus or once the field has content —
  `'in'` stays fully inside the border, `'on'` ends up centered on the top border line (with
  a background patch masking it), `'over'` floats fully above the field, outside the border.
  A `floatLabelShowPlaceholder` input (`boolean`, default `false`) reveals the field's own
  `placeholder` once the label has floated out of the way; left off, the placeholder stays
  hidden the whole time a float label is active since the resting label already occupies that
  space. Both are also settable app-wide via the new `GOG_CONFIG.floatLabel` (`variant` /
  `showPlaceholder`), with the usual per-instance input taking priority. Implemented as a
  style variant on each component (not a directive, unlike `gogTooltip`) since each control
  already owns its label and has a different notion of "has content" (`value`,
  `selectedOption`, selection length) that a directive sitting outside the component couldn't
  see. New `--gog-{input,select,ms}-float-label-{in-top,on-bg,over-gap,over-reserve}` tokens.
- `gog-slider`'s new `orientation` input (`'horizontal'` default / `'vertical'`) — the
  developer picks per instance, no global default, since it's a layout decision rather than a
  house style. The vertical variant is the same native `<input type="range">` rotated via
  `writing-mode: vertical-lr` + `direction: rtl` (not a custom drag implementation), so
  dragging, touch and keyboard (Up/Down as well as Left/Right) all keep working exactly as they
  do horizontally; value increases upward, matching a volume-fader convention. New
  `--gog-slider-vertical-length` token (default `160px`) sizes its length, the vertical
  counterpart to `--gog-slider-auto-width`. `fullWidth` is ignored when vertical, since a
  vertical slider's width is its thickness, not its length.
- `gog-radio-group`: a new options-driven radio control (`GogRadioOption[]`), the radio
  counterpart to `gog-checkbox`. Renders native `<input type="radio">`s sharing one
  auto-generated (or explicit `name`) group name, so mutual exclusivity and arrow-key/Home/End
  navigation between options come from the browser for free — no roving-focus code needed.
  `ControlValueAccessor`-based, works with `formControl`/`formControlName`. `label`,
  `ariaLabel`, `name`, `size`, `disabled` (group-level, plus per-option `disabled`),
  `orientation` (`'vertical'` default / `'horizontal'`), `errorMessage`, `errorDisplay` and
  `fullWidth` inputs; `[(value)]` two-way bindable. Reuses the `--gog-control-checkbox-*`
  size scale via the shared checkable-control config, plus new `--gog-radio-*` tokens in
  `theme.css`.
- `gog-collapsible`'s `collapseOnFocusOut` input (`boolean`, default `false`): closes the
  panel once focus leaves both the trigger and the content — e.g. Tabbing past the last
  focusable element inside, or a click landing elsewhere on the page. Off by default, since
  plenty of consumers (an FAQ list, a settings section read top to bottom) want the panel to
  stay open regardless of where focus goes next.
- `gogTooltip`: a new directive, not a component — drop it on any element, a `gog-*`
  component's own host tag or a plain native one (`<button gogTooltip="Save changes">`,
  `<gog-chip [gogTooltip]="hint">`), to add a hover/focus tooltip without that element
  needing to know anything about it. Content is a plain string or a `TemplateRef` for richer
  markup. `gogTooltipPosition` (`GogTooltipPosition`: `'auto'` default, or an explicit
  `'top'`/`'bottom'`/`'left'`/`'right'` that flips to its opposite if it has no room),
  `gogTooltipShowDelay` (default `300`ms), `gogTooltipHideDelay` (default `100`ms) and
  `gogTooltipDisabled` inputs; the first three also read `GOG_CONFIG.tooltip` for an
  app-wide default the same way `gog-scroll`/`gog-button` already do, with an instance's own
  input always winning. Shown on both mouse hover and keyboard focus (`focusin`/`focusout`,
  not `focus`/`blur`, so it stays replay-safe under SSR event replay), dismissible with
  Escape, and hoverable — moving the pointer from the trigger onto the bubble itself (e.g. to
  read more of a long one, or scroll one taller than `--gog-tooltip-max-height`) cancels the
  pending hide instead of racing it — per WCAG 2.1 SC 1.4.13. The bubble is appended to
  `document.body` (so it's never clipped by an ancestor's `overflow: hidden`) via a new
  internal `GogTooltipOverlay`, built on `ViewContainerRef.createComponent` + relocating the
  node rather than `GogDropdownOverlay`'s `TemplateRef` approach, since a directive has no
  template of its own to attach from. Visually it's the same "floating panel" recipe as
  `gog-dialog`'s panel and `gog-select`'s dropdown (`--gog-surface-color` background, plain
  `--gog-border-color` border, `--gog-panel-shadow`), not a bespoke inverted bubble, so it
  reads as part of a themed app rather than a generic dark tooltip dropped on top of it.
  Content wraps to `--gog-tooltip-max-width` (`280px`) and is capped at
  `--gog-tooltip-max-height` (`220px`) through an internal `gog-scroll` — content under the
  cap renders at exactly its own height, content over it scrolls, using the same themeable
  scrollbar every other overflowing panel in this library uses instead of a native one (see
  `styling.instructions.md`'s new "Scrollable content" section for that convention).
  `gogTooltipClass` applies a class straight to the bubble, for restyling (or resizing) one
  instance — needed because the bubble sits outside any scoped ancestor's stylesheet once
  appended to `document.body`, the same "Panels rendered outside the component subtree"
  limitation `gog-select`'s `[appendToBody]` panel already has, so the class has to come from
  an unscoped (global) stylesheet. New `--gog-tooltip-*` tokens in `theme.css`; `gog-dialog`'s
  panel now also raises `--gog-tooltip-z` (mirroring the existing `--gog-dropdown-z` bump) so
  a tooltip triggered inside a dialog stacks above it.

### Changed

- `gog-slider`'s track now paints a border (new `--gog-slider-track-border-width`/`-style`/
  `-color` tokens, transparent by default — same opt-in convention as `--gog-btn-primary-border`)
  and its fill is bound via `background` instead of `background-color`, so
  `--gog-slider-fill-bg` also accepts a gradient (e.g. `linear-gradient(...)`), not just a
  solid color. The thumb ("handle") was already fully customizable via its existing
  `--gog-slider-thumb-*` tokens (size, background, border, radius, glow) — no change there.

### Fixed

- `gog-slider`'s track background (`--gog-slider-track-bg`) no longer reuses
  `--gog-accent-dim` — it sat on the same hue ramp as the fill (`--gog-accent-color`), so at
  the track's 4px height the two read as one blob instead of a recessed groove with an
  accent fill on top. Now `color-mix(in srgb, var(--gog-text-color) 30%, var(--gog-border-color))`:
  a desaturated, theme-adaptive gray that darkens toward black in the light theme and
  lightens toward parchment in the dark theme (`--gog-text-color` sits at whichever end of
  that range per theme), so it's always distinct from the accent-colored fill and legible
  against its own theme's surface.

## [21.2.4] - 05.08.2026

### Added

- `gog-collapsible`: a headless expand/collapse primitive — inline, not a portal (unlike
  `gog-select`/`gog-multiselect`'s panel). Owns no markup: project any element as the
  trigger via `gogCollapsibleTrigger` and any element as the panel via
  `gogCollapsibleContent`; `[(open)]` is two-way bindable, `disabled` blocks toggling.
  New `--gog-collapsible-*` tokens in `theme.css`; the trigger/content CSS classes live in
  `utilities.css` since the projected content sits outside the component's own view.
- `gog-textarea`: a multi-line counterpart to `gog-inputfield`, sharing its
  `--gog-input-*` tokens. `ControlValueAccessor`-based, works with
  `formControl`/`formControlName`. `label`, `placeholder`, `errorMessage`,
  `errorDisplay`, `disabled`, `size`, `fullWidth` and `rows` inputs.
- `gog-inputfield`'s `type` input now also accepts `'number'` and `'date'`,
  plus new `min`/`max`/`step` inputs (applied only for `type="number"`). For a
  `number` field the value written to/read from an attached
  `formControl`/`formControlName` is a `number` (`null` when the field is
  empty) rather than a string — `[(value)]` stays a string either way, since
  it mirrors the native input's raw text.
- `gog-scroll`: a drop-in replacement for a native `overflow: auto` region.
  Content keeps scrolling natively (wheel, touch, keyboard, focus-into-view);
  only the browser's own scrollbar chrome is hidden and replaced with a
  themeable, draggable overlay thumb. `axis` (`vertical`/`horizontal`/`both`),
  `size` (`normal`/`thin`), `autoHide`/`hideDelay`, `reachThreshold` with
  `gogReachStart`/`gogReachEnd` outputs, a `gogScroll` metrics output, and
  `scrollTo`/`scrollToTop`/`scrollToBottom`/`scrollToLeft`/`scrollToRight`
  public methods. New `--gog-scroll-*` tokens in `theme.css`.
- `gog-scroll`'s `overscrollBehavior` input (`'auto'` | `'contain'` | `'none'`,
  mirrors the CSS property of the same name): what happens when a scroll
  gesture reaches this instance's edge. Defaults to `'auto'` — chains to the
  next scrollable ancestor, same as an un-customized `overflow: auto` div, so
  scrolling to the end of a `gog-scroll`'d section and continuing the same
  gesture now keeps scrolling the page instead of stopping dead. `gog-select`/
  `gog-multiselect`'s option panel and `gog-dialog`'s body now set
  `overscrollBehavior="contain"` explicitly, preserving their existing
  (correct, overlay-appropriate) behavior now that the component-wide default
  has changed to chain-through.
- `GOG_CONFIG`/`GogGlobalConfig`/`provideGogConfig(...)`: one injection token
  for app-wide defaults across the library's component inputs, instead of a
  separate token per component per setting. Call `provideGogConfig({ scroll:
{...}, button: {...} })` once in your app's providers (or a route's/
  component's own `providers` for a subtree-scoped override); any instance
  that doesn't set the input itself falls back to the configured value, then
  to the component's own hardcoded default. `gog-scroll`'s `size`, `autoHide`,
  `hideDelay` and `overscrollBehavior` and `gog-button`'s `debounce` are the
  first inputs wired up to it — see the "Global configuration" section in
  `gleks-ui-library.instructions.md` for how to add more. This only covers
  inputs read in TypeScript that can't already be a CSS token; visual
  defaults remain the `--gog-*` custom properties in `theme.css`.

### Changed

- `gog-checkbox` now registers its `ControlValueAccessor` by self-injecting
  `NgControl` in the constructor, matching every other form control in the
  library, instead of the `NG_VALUE_ACCESSOR`/`forwardRef` provider pattern.
  No behavior change — `formControl`/`formControlName` usage is unaffected.
- `gog-scroll`'s `size`, `autoHide`, `hideDelay` and `overscrollBehavior` inputs and
  `gog-button`'s `debounce` input now default to `undefined` instead of a hardcoded
  value, so they can fall through to `GOG_CONFIG` — read the resolved value (e.g. via
  the rendered DOM) rather than the raw input signal if you need the effective default.
- `gog-select` and `gog-multiselect`: the option panel now scrolls via
  `gog-scroll` instead of native `overflow-y`.
- `gog-dialog`: the body now scrolls via `gog-scroll` instead of native
  `overflow-y`.
- `gog-table`: horizontal scrolling now goes through `gog-scroll` instead of
  native `overflow-x`.

### Fixed

- `gog-scroll` internals used `height: 100%` chains from `:host` down to the
  viewport. A host whose own height comes from being flex-grown inside a
  `max-height`-only ancestor (exactly the select/multiselect dropdown panel
  and dialog body cases above) still failed to resolve a percentage height
  read off it, collapsing back to content size — the panel stopped clipping
  and scrolling. Switched every level to flex-basis chains
  (`flex: 1 1 auto` + `min-height: 0`), which don't have that failure mode.
- `gog-scroll`'s horizontal content wrapper used `width: max-content`, which
  created a circular sizing reference against a `width: 100%` child (e.g.
  `gog-table`'s own `<table>`) and made some browsers fall back to a huge
  sentinel width (~1,000,000px), pushing the table off-screen. Removed —
  children already overflow a normal block parent without it.
- `gog-scroll` set `overscroll-behavior: contain` (both axes) on the
  viewport unconditionally, which also blocked wheel scroll on an axis the
  instance never actually scrolls (e.g. vertical wheel over a horizontal-only
  instance), preventing it from bubbling up to scroll the page. Now set only
  on the axis that's actually acting as a scroll container.
- `gog-scroll` kept a disabled or currently-non-overflowing axis at
  `overflow: hidden`/`auto`, which makes an element a "scroll container" per
  spec regardless of whether it has anything to scroll — becoming the
  containing block for `position: sticky` descendants and a scroll-chaining
  boundary, whether needed or not. This broke `gog-table`'s `stickyHeader`
  and swallowed wheel scroll whenever a `gog-table` (which always wraps its
  own horizontal scroll in a `gog-scroll`) was itself nested inside another
  scrolling container, e.g. a `gog-scroll` capping its height. Both axes are
  now `visible` unless that specific axis is genuinely scrolling.

## [21.2.3] - 03.08.2026

### Added

- `fullWidth` input on `gog-checkbox`, `gog-chip` and `gog-tag`, matching the
  existing `gog-button` behavior: `false` by default (sized to content), `true`
  stretches the component to fill its container.
- `fullWidth` input on `gog-inputfield`, `gog-select`, `gog-multiselect`,
  `gog-table`, `gog-paginator` and `gog-slider`. Inverted from the input above:
  these are already full width of their container by default, so `fullWidth`
  defaults to `true` and set it to `false` to shrink the control to fit its
  content instead (a fixed `--gog-slider-auto-width`, 240px by default, for
  `gog-slider` specifically — its track has no content of its own to size to).
- `gog-accordion`'s `skeletonCount` input: how many skeleton rows to render
  while `loading` is true and `items` is still empty. Defaults to `3`.

### Changed

- `gog-accordion`'s `loading` skeleton now renders with `gog-skeleton` instead
  of a bespoke shimmer implementation. **Breaking:** the
  `--gog-accordion-skeleton-start/-mid/-end/-radius/-height/-width/-duration`
  tokens are gone — restyle the loading state via the shared `--gog-skeleton-*`
  tokens instead.

### Fixed

- `gog-accordion`'s `loading` skeleton now actually renders while `items` is
  empty. It previously rendered one skeleton row per existing item, so the
  most common real-world case — showing loading state before the item list
  has arrived at all — silently rendered nothing. It now falls back to
  `skeletonCount` rows whenever `items` is empty, and still mirrors `items`
  once they exist.
- `gog-accordion`'s chevron no longer force-rotates 180° when a custom
  `gogAccordionChevron` template is supplied. Previously the wrapper always
  rotated on open regardless of what the template rendered, so a template that
  swapped between a `chevron-up`/`chevron-down` icon per `open` state ended up
  double-transformed (both states visually pointing the same way). The rotation
  now only applies to the built-in default chevron; a custom template owns its
  open/closed presentation entirely, including bringing its own animation or
  swapping in a completely different icon.

## [21.2.2] - 30.07.2026

### Added

- `column`'s `comparator` input for custom per-column sort ordering; the default
  comparator now uses `Intl.Collator` for numeric-aware string sorting
  (`"item2" < "item10"`) instead of raw `<`/`>`.
- `gog-table` cell/sort values now resolve dot-path nested fields (e.g.
  `field="address.city"`).
- ESLint (`@angular-eslint`, flat config) across `@gleks/ui` and `ui-showcase`, wired
  into CI alongside `format:check` and a token-consistency check (every
  `var(--gog-*)` read with no fallback must resolve to a declared default).
- `LICENSE` (MIT) and this changelog.

### Changed

- **Breaking:** every previously unprefixed global design token in `theme.css`
  (`--accent-color`, `--text-color`, `--radius`, `--control-*`, `--field-*`,
  `--dropdown-z`, etc.) is now `--gog-*` prefixed, matching the component-token
  convention. Update any consumer theme overrides to the new names.
- **Breaking:** `column`'s `field` input is now a plain `string` (was
  `keyof T & string`) to support nested dot-paths.
- `gog-select`/`gog-multiselect` panel sizing constants (max height, estimated row
  height) are now read from CSS custom properties
  (`--gog-select-panel-max-height`, `--gog-select-option-height`, and the
  multiselect equivalents) instead of hardcoded in TypeScript, so they're themeable.
- `gog-table`'s pagination state now uses `linkedSignal` instead of a manual
  `effect`, resetting to page 1 on sort changes and clamping to `totalPages` on
  data/page-size changes, while still deferring to `gog-paginator`'s own
  self-clamping `page` model.

### Fixed

- An append-to-body dropdown panel now copies the trigger's scoped `data-theme`
  (not just `:root`'s) onto its overlay host, so panels stay themed when opened
  inside a themed subtree.
- `gog-select` now correctly reads its own `--gog-select-option-gap` token for
  panel-height estimation instead of the unused base default, fixing a latent
  under-estimate in the panel's up/down placement math.

## [0.0.1] through 0.2.2

Initial development, published as `0.0.1`: accordion, button, checkbox, chip, dialog,
icon, inputfield, multiselect, paginator, select, skeleton, slider, spinner, table, tag
and toast components, plus the shared theme (`styles/theme.css`) and `ThemeService`.
Versions up to `0.2.2` were developed without per-release changelog entries. `0.2.2` was
published with the wrong version scheme and immediately re-published, with no code
changes, as `21.2.2` — this file tracks changes from `21.2.2` onward.
