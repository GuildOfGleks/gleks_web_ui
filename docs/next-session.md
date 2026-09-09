# Next session — close 21.11.0

**Written 2026-09-09.** Delete this file when its three phases are done; it is a handoff, not a
durable list. Everything durable is in `docs/backlog.md` and `docs/component-geometry.md`.

## What "closing 21.11.0" means, and what it does not

21.11.0 is **built and merged to `master`, and not released.** Its changelog heading still reads
`planned`, `projects/gleks/ui/package.json` still says 21.10.0, and both of those are correct:
**the user cuts every release** (`gleks-ui-library.instructions.md` rule 11 / rule 12 of the
definition of done). `npm run check:release` therefore **fails today, and must still fail when you
are done.** Do not bump the version. Do not date the heading. A green `check:release` on this
branch means someone jumped the gun.

What is actually left is the tail of `docs/component-geometry.md`, the plan 21.11.0 was built
from. Its status table has exactly three open rows — **D0, D5, D7** — and one of them is a whole
release of its own:

| Decision | What it is                                                              | This branch                                     |
| -------- | ----------------------------------------------------------------------- | ----------------------------------------------- |
| **D7**   | Overlay caps against the viewport (L8's one exception) + measure in `ch` (L9) | **Phase 1 — implement, inside 21.11.0**    |
| **D0**   | Is the geometry work one minor or several?                              | **Phase 2 — close as a record of what happened** |
| **D5**   | The elevation ladder (L10) — 36 shadow tokens plus 15 across nine presets | **out of scope.** Its own plan, its own release |

Plus **Phase 0**, which comes first: prove that the release already sitting on `master` is what
its changelog says it is.

**Scope is fixed at those three phases.** Do not start D5. Do not pick anything off
`docs/backlog.md` — not the four dropdowns' two panel-radius answers, not the chip avatar's drift,
not the OKLCH half. Each is a separate decision and a separate branch.

---

## Branch and commit protocol

Cut one branch from `master`: **`geometry/d7-measure-and-overlay-clamp`**.

The commit protocol is the sweep's own, from `docs/component-geometry.md` Part 4 — it is what
made 25 commits reviewable and it applies here unchanged:

- **One concern per commit.** A rule change is its own commit, made *before* the thing that needs
  it, so no later commit silently re-litigates a settled number.
- A commit must not contain a public API change, a colour change, or two components.
- Every length lives with its reason **in the component's own stylesheet**, not only in the commit
  message.
- `ui-showcase` is updated in the same commit if anything visible changed there. **Never the lab.**
- Commit subjects follow the existing log: `feat(tokens)`, `feat(scripts)`, `fix(ui)`,
  `fix(scripts)`, `ci:`, `docs:`.

Do not merge, do not rebase onto `master`, do not squash. Push the branch and stop; the merge is
reviewed first and then lands with its history intact.

## Hard boundaries

1. **Never publish, never bump, never date the heading.** See above.
2. **Never touch `projects/gleks-ui-lab`.** It resolves the *published* package. Anything the lab
   will need to say — or currently says wrongly — goes into `docs/lab-after-publish.md` under the
   21.11.0 section, which is already open.
3. **Never run the raw `ng build gleks-ui-lab`** — it does not exit. Read
   `running-commands.instructions.md` before deciding anything is slow. Every other script
   finishes in under 15 s except `build:lib`, `test:lib` and `build:showcase`.
4. **No Cyrillic anywhere in the repository**, including comments and commit messages.
5. Verification is `ui-showcase`-only, and the local-build swap is undone afterwards.

---

## Phase 0 — verify what is already built (no new scope)

The point of this phase is that 21.11.0 moved rendered geometry across 66 components and the only
thing standing behind it is a set of checks that read stylesheets. **Every defect this project has
found by hand was invisible to its test suite.** So: run the gate, then look at it.

### 0.1 — the full gate, in one pass

Run the CI list in `.github/workflows/ci.yml` order:

```
npm run lint
npm run format:check
npm run check:tokens
npm run check:deprecations
npm run check:geometry
npm run check:logical-properties
npm run check:state-specificity
npm run check:loading-aria
npm run check:contrast
npm run check:app-contrast
npm run check:theme-starter
npm run build:lib
npm run test:lib
npm run build:showcase
```

All were green on 2026-09-09 (`check:geometry` reports 243 blocks, 41 glyphs, 46 radii,
93 font-size tokens / 70 line-height tokens). If one is red, that is a finding and it is Phase 0's
whole job — fix it as its own commit before starting Phase 1.

`npm run check:release` is **expected to fail** and is not in this list.

### 0.2 — in a real browser, in `ui-showcase` only

`npm run buildLibAndStart`. Six things 21.11.0 changed that no check can see, each named because
the changelog claims something visual about it:

1. **`gog-accordion`'s chevron** — it is a ratio of the header now, not a px ladder, so `xsm`,
   `sm` and `md` should be *identical* (all three label with `--gog-text-xs`). Also confirm the
   glyph fits its box: it had been overflowing at every size, and that is what the ratio fixed.
2. **`gog-select` and `gog-multiselect` filter inputs have square corners.** This is the correct
   concentric answer where the inset equals the panel radius, and it is the one change in the
   release that reads as a regression. Look at it and confirm it reads as deliberate.
3. **`gog-menu`'s item corner is 12px**, inside a panel painting `--gog-panel-radius` — the first
   and last items had been squarer than the corner they sit in.
4. **The `slg` text field's horizontal padding doubled** (the largest single change in the
   release). Check no showcase page's layout broke under it.
5. **`gog-chip`** — the one component whose paint had to grow, because its surface clips and an
   invisible 24×24 target would be cut off at the edge.
6. **`gog-table`'s cell padding at all five sizes**, which changed per size.

**Do all of this at `--gog-density: 1` and again at `0.85`.** Density is where geometry bugs hide:
law 2's one real finding was a radius that was correct at 1 and 0.6px wrong at 0.85, because it
restated a padding as a literal instead of reading it.

Known verification trap, from `docs/ripple.md`: a background Chrome tab pauses CSS animations, so
a scripted press produces a node that never animates. Keep the tab in front.

### 0.3 — report

If nothing is found, **say so explicitly** in the handoff. "Phase 0 found nothing" is a result; an
unmentioned phase reads as a skipped one.

---

## Phase 1 — D7, taken and implemented

D7 as the plan states it: *"Whether the four overlay max-widths become `min(…, …vw)`, and whether
prose caps move to `ch`."* It is two independent halves — L8's single exception and L9 — and they
can be decided separately. Read **L8** and **L9** in `docs/component-geometry.md` before writing
any code; the verdicts there are already taken and this phase implements them, it does not
re-argue them.

### The facts, measured 2026-09-09 — do not re-derive them, but do check them

- The library contains **zero** `clamp()`, `vw` or `vi` declarations. L8 lands in four tokens or
  nowhere.
- The eight `*-max-width` tokens in `theme.css`:

  | Token                                 | Value         | L9's verdict                             |
  | ------------------------------------- | ------------- | ---------------------------------------- |
  | `--gog-tooltip-max-width`             | 280px         | ≈47ch at `--gog-text-xs` — at the floor  |
  | `--gog-menu-max-width`                | 320px         | ≈46ch, **but menu items do not wrap**    |
  | `--gog-toast-max-width`               | 400px         | font **unstated — to trace**             |
  | `--gog-confirmation-dialog-max-width` | 440px         | ≈63ch, in band — font **to trace**       |
  | `--gog-autocomplete-panel-max-width`  | 420px         | single-line options — outside L9         |
  | `--gog-multiselect-panel-max-width`   | 420px         | single-line options — outside L9         |
  | `--gog-select-panel-max-width`        | 420px         | single-line options — outside L9         |
  | `--gog-calendar-max-width`            | `max-content` | not a cap at all                         |

- Only two `ch` declarations exist in the library (`--gog-progressbar-value-min-width: 3ch` and the
  slider's `calc(var(--value-chars, 0) * 1ch)`), and **both are numeric width, not measure.**

### 1.1 — survey first (commit A)

The project's own rule, and it earned itself twice: `survey:geometry` came before D1/D3/D6 because
*a threshold chosen before seeing the spread is a threshold chosen to flatter what is already
there.* D4 and D8 then needed a **second** survey, because the first read `theme.css` only and
eight literal `line-height` declarations were living in component stylesheets where it could not
see them.

So write `scripts/survey-measure.mjs`, and make it read **both** `theme.css` and the component
stylesheets from the first line. For every `*-max-width` token it must report:

- the resolved value at `--gog-density: 1` and at `0.85`;
- **the font size actually in force on the element that reads it** — the L9 table says "to trace"
  for the toast and the confirmation dialog, and tracing those two is a deliverable of this phase,
  not something to approximate;
- the approximate measure in `ch`;
- **whether the component's text wraps.**

Two things about the `ch` figure. It must be printed as an *assumption with its number stated*,
never hidden — L9 says exactly this. And `1ch ≈ 0.5em` is font-dependent, so **measure the real
ratio once in Chrome** for the library's default `--gog-font-body` stack (a canvas 2D context's
`measureText('0')` against the computed font, or a `<div>` sized in `ch`), and record the measured
number in the script's header with the date. That measurement is the difference between a law and
a guess.

**The wrapping / non-wrapping partition is itself a deliverable** (L9's own words). One row per
component, each with a reason. A dropdown option that ellipsises is outside this law and saying so
is worth as much as the caps are.

### 1.2 — take D7 (commit B)

Write it into `docs/component-geometry.md` as a dated section, in the same shape D4 and D8 were
taken on 2026-09-06: **"D7 — taken YYYY-MM-DD, against a survey"**, with a *What the survey found
that the prose did not* subsection, and a table of verdicts. Then flip the D7 row in the status
table.

Three questions the decision must answer explicitly, because the plan's prose does not settle
them:

1. **Which caps take the viewport clamp.** L8's exception names four tokens: toast, menu,
   confirmation dialog, tooltip. But the three `*-panel-max-width: 420px` dropdown panels are
   wider than a 360px phone too, and they are outside L9 (single-line options) for a reason that
   has nothing to do with the viewport. Decide whether "no wider than the screen it floats over"
   applies to a panel that does not wrap, and write the reason down either way. **This is the one
   thing in D7 that is a genuine decision rather than an implementation.**
2. **What the margin term is.** `min(400px, calc(100vw - <margin>))` needs a margin, and it must
   read a spacing step — `check-tokens` rule H fails a literal that restates a scale step, and
   rule G refuses a literal that equals one. When `check-tokens` and a newer check disagree, the
   newer one is usually wrong; that is a finding from 21.11.0 and it applies here.
3. **Which caps move to `ch`, and whether `menu` is one of them.** L9's table says the menu is "at
   the floor, but menu items do not wrap" — which reads as a cap that should not be a measure at
   all. Say so, or say why not.

### 1.3 — implement (commits C and D)

- **Commit C — the viewport clamp** on whichever caps 1.2 decided take it.
- **Commit D — the measure caps in `ch`**, with the non-wrapping list carried as a comment in the
  stylesheet beside the tokens, not only in the plan.

Both are token-value changes in `theme.css`; check whether any preset in `styles/presets/`
overrides one of the eight tokens and follow it there in the same commit.

### 1.4 — the gate (commit E)

A law that is not gated is prose. Add `scripts/check-measure.mjs` (or extend
`scripts/check-typography.mjs` if the parsing is genuinely shared) and fold it into
`npm run check:geometry`, which is already a CI step — so it goes in **only once it is green**.
Write it red first, on real findings, the way laws 2 and 4 were.

Three requirements, each of which is a bug 21.11.0 already paid for:

- **Check the effect, not the declaration.** Law 4's rule C asked whether a block *declares* a
  leading token; thirty-five such tokens were added and every one was inert, because no stylesheet
  read them. Require that a token be **read, transitively**.
- **Resolve at two densities.** A check that resolves at one density is only true at that density.
- **Exceptions are named with reasons, never a loosened threshold.** `DENSITY_EXEMPT` and
  `REST_PAIRS_NOT_RENDERED` in `check:contrast` are the pattern. And an exemption means "may sit
  off the scale", not "must" — that distinction was a real bug in `check:typography`
  (`9a2f508`).

### 1.5 — verify in a browser

Open a toast, a tooltip, a menu and a confirmation dialog at a **360px** viewport, before and
after. Half (a) exists entirely because a 400px toast on a 360px phone is sized by whatever margin
happens to be around it — no check can see that, and it is the whole justification for the change.

### 1.6 — documentation, in the same change (commit F, then G)

- `projects/gleks/ui/CHANGELOG.md`, under the open **`## [21.11.0] - planned`** heading. Do not
  create a new heading. Do not touch the word `planned`.
- `AGENTS.md` if any public token's meaning changed — this is step 10 of the definition of done
  and it is the document that goes stale first, without any build failing.
- `README.md` if the theming section's fluid recipe (L8's consumer recipe, added 2026-09-06) now
  needs to mention that the library does this itself for overlays.
- `npm run generate:tokens` and `npm run generate:theme-starter` — `check:theme-starter` fails
  until the second one runs, which is the reminder working as designed.
- **Commit G:** `docs/lab-after-publish.md`, 21.11.0 section — anything the lab now says wrongly
  about overlay widths. Add; never edit the lab itself.

---

## Phase 2 — D0 closed, and the stale-prose sweep

### 2.1 — D0, as a record of what happened

D0 asked *"Is this one minor or several?"* It has an answer, and the answer is a fact rather than
a preference: **the geometry work shipped as one minor, 21.11.0, and elevation was not in it.**
Write that into `docs/component-geometry.md` with the evidence — 25 sweep commits plus law 2's
five, law 4's, and the spacing-scale removal, all under one heading; D5's 36 shadow tokens plus 15
across nine presets deliberately left out — and flip the row to ✅.

Leave **D5 open**, with one line saying it is the next release's work and needs its own plan
document (name it without a version — a plan's filename with a version in it becomes a lie).

After 2.1 the status table has no open row but D5.

### 2.2 — the stale-prose sweep

This is the class of defect CLAUDE.md names outright: **seventeen sentences still said 21.9.2
after 21.10.0's rename, three of them inside the package a consumer installs, because the number
moves with the changelog heading and nothing checks prose.** 21.11.0 changed a rendered library
and closed four laws, so the same drift is live now. Confirmed instances, all checked 2026-09-09:

| Where                                                    | What it says                                                                    | What to do                                                                    |
| -------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `docs/lab-after-publish.md`, last section                 | "Laws 2 (concentric radii) and 4 (the typographic ratio) are deliberately not in it yet" — **both are gated and in CI as of the release that section describes.** The paragraph above it also lists only three of `check:geometry`'s four scripts | Rewrite both sentences. This is the one outright false statement found.          |
| `docs/themes.md` ~601–603                                 | describes the spacing scale as fourteen steps, as a statement of current fact     | Add a dated correction line. **Do not rewrite a completed plan's history** — the file is the record of how it was decided. |
| `docs/backlog.md` ~109                                    | law 1's "the open half is the scale itself", inside an entry the file says is kept as the argument for the two that remain | One dated line saying the scale half closed in 21.11.0. Not a rewrite.          |
| `CLAUDE.md`'s tail note                                   | "17 raw `<span class=\"since\">` chips in `projects/gleks-ui-lab/public/docs/*.md`" — the count is **15** today | Correct the number. Still lab-side, still waits for a publish.                   |
| `projects/gleks/ui/AGENTS.md:198`                          | already reads "the ten-step scale `--gog-space-4` … `--gog-space-48`" — **correct** | Nothing. Named here so nobody re-verifies it.                                    |
| `projects/gleks/ui/TOKENS.md`                              | already carries `--gog-space-40`, `--gog-text-2xs` and the field-tier leadings — **correct** | Nothing.                                                                        |

The rule for the sweep: **fix statements of current fact; date corrections into completed plans
rather than rewriting them.** A plan is the record of a decision, and editing the decision out of
it destroys the only thing it is kept for.

While you are in there, grep once for the same shape rather than trusting this table:

```powershell
git ls-files docs projects/gleks/ui/*.md '*.md' |
  ForEach-Object { Select-String -Path $_ -Pattern 'fourteen|14-step|not in it yet|deliberately not' }
```

### 2.3 — close out

- Run the full Phase 0.1 gate again. `check:release` still fails; that is correct.
- Replace this file's contents with a short handoff, or delete it. Its own rule: a file that
  outlives its work sends the next reader to re-verify something already correct.

---

## Definition of done for this branch

1. Phase 0's gate is green and its browser pass is reported, findings or "nothing found".
2. D7 is written into `docs/component-geometry.md` as a taken decision, implemented in `theme.css`,
   gated by a script folded into `check:geometry`, and verified at a 360px viewport.
3. D0 is closed in the status table; D5 is the only open row left.
4. The 21.11.0 changelog entry carries D7's bullets under the **existing** `planned` heading.
5. `AGENTS.md` / `README.md` / `TOKENS.md` / `theme-starter.css` agree with the code.
6. `docs/lab-after-publish.md` carries the lab's new debt; the lab itself is untouched.
7. The version is still 21.10.0, the heading still reads `planned`, and `check:release` still
   fails.
8. The branch is pushed, unsquashed, unmerged, and left for review.
