# 21.7.0 — the token-prefix removal

**Target: 21.7.0. Not started.** This is the release's mandatory payload: the three abbreviated
custom-property prefixes deprecated in 21.5.0 come out, and the one consumer this repo has
(`ui-showcase`) migrates in the same release.

Written 2026-08-28 against 21.6.1, as a per-file list. **Promoted to a plan the same day**, because
the survey that produced the list turned up three things that are decisions rather than typing:
a class of dead token reference the removal walks straight past, a ratchet that does not actually
ratchet, and a generator that has never emitted an empty list. Those are iterations 0, 2 and 3
below; the mechanical removal is iteration 1.

## Status

| #   | Iteration                                              | Kind    | State   |
| --- | ------------------------------------------------------ | ------- | ------- |
| 0   | The dead references the survey found — fix them first   | fix     | ✅ done |
| 1   | The removal itself: library, then `ui-showcase`         | api     | ✅ done |
| 2   | Make the ratchet cover CSS, not just TypeScript         | tooling | ✅ done |
| 3   | The generated artifacts, at zero                        | tooling | ✅ done |
| 4   | The three documents that ship inside the package        | docs    | ✅ done |
| 5   | Verification, and the browser pass that is not optional | check   | ✅ done |

**Order matters between 0 and 1 only.** Iteration 0's fixes are three-line edits to lines that
iteration 1 also rewrites; doing them second means writing the same lines twice and, worse, means
the mechanical un-wrap rule silently preserves a bug it was standing on top of. Everything from 2
onwards can happen in any order once 1 lands.

---

## What is being removed

Three abbreviated custom-property prefixes, deprecated in 21.5.0 (2026-08-19), each honoured today
by a `var(--gog-<new>-x, var(--gog-<old>-x, <value>))` fallback wrapper in `theme.css`:

| Old               | New                           | Deprecated in |
| ----------------- | ----------------------------- | ------------- |
| `--gog-btn-*`     | `--gog-button-*`              | 21.5.0        |
| `--gog-ms-*`      | `--gog-multiselect-*`         | 21.3.0        |
| `--gog-confirm-*` | `--gog-confirmation-dialog-*` | 21.5.0        |

Run `npm run check:tokens` for the live count and per-prefix split — **151** at last measurement
(69 + 75 + 7), but that number moves with every token added or removed, so don't cite it without
re-running the command. (Both scanners briefly over-counted by 3 — a bare `--gog-btn-`/`--gog-ms-`/
`--gog-confirm-` each, one per prefix, matched out of `theme.css`'s own header comment rather than
a real declaration; fixed 2026-08-28 in `scripts/deprecations.mjs` and `scripts/check-tokens.mjs`.)
The mechanism and the reason (aliasing instead of wrapping would silently discard a themed
override — see `theme.css`'s own header comment above the deprecation tag) are already documented
in `theme.css` itself; this file is the removal's blast radius, not a repeat of its reasoning.

---

## Iteration 0 — the dead references, first

The survey for this removal ran one scan the project had never run: **every `var(--gog-…)` in
`theme.css` that has no fallback and names a property nothing declares.** A `var()` like that is
not a soft failure. It makes the custom property that contains it _guaranteed-invalid_, and then
the declaration that reads it is invalid at computed-value time — so the property falls back to
inherited-or-initial and the styling is simply absent. No build fails. Nothing logs.

Five hits, one of them prose inside a comment. The other four are live, and three of them are the
same mistake made twice:

| `theme.css` | Declaration                                                                                     | What actually happens                                                                                                                                                                                                                                                                                                                                              |
| ----------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1138        | `--gog-multiselect-focus-glow: var(--gog-ms-focus-glow, 0 0 8px var(--gog-ms-focus-ring));`      | `--gog-ms-focus-ring` is a _deprecated_ name — declared nowhere, only ever read inside another token's fallback. So the default glow is invalid, and `box-shadow: var(--gog-multiselect-focus-glow)` (`multiselect.component.scss:109`) computes to `none`. **The multiselect's focus glow has never rendered.** Compare `--gog-input-focus-glow` (1045) and `--gog-select-focus-glow` (1451): both read their own declared `-focus-ring`. |
| 1184        | `--gog-multiselect-filter-input-color: var(--gog-ms-filter-input-color, var(--gog-multiselect-control-color));` | `--gog-multiselect-control-color` does not exist. The intended name is `--gog-multiselect-field-color` (1130). `color` is inherited, so the filter input silently inherits instead — visually survivable, but not what the token says.                                                                                                                                |
| 1188        | `--gog-multiselect-filter-input-border: var(--gog-ms-filter-input-border, var(--gog-multiselect-control-border));` | `--gog-multiselect-control-border` does not exist; intended `--gog-multiselect-field-border` (1120). The read site is a `border:` **shorthand** (`multiselect.component.scss:436`), so one invalid part kills the whole declaration and `border-style` goes to `none`. **The filter box inside the multiselect panel has no border.**                                  |
| 1474–1475   | `--gog-select-filter-input-color: var(--gog-select-control-color);` and `-border: var(--gog-select-control-border);` | The same pair, the same non-existent `-control-` names, intended `--gog-select-field-color` (1447) / `--gog-select-field-border` (1443). Same shorthand at `select.component.scss:412`. **The filter box inside the select panel has no border either.**                                                                                                              |

**This is the third instance of the same family in one month.** The first was `gog-multiselect`'s
JS-computed panel height reading `--gog-ms-*` names `theme.css` never declares (closed 2026-08-28,
see `docs/backlog.md`). All three share a shape: a token name that looks right, is never declared,
resolves to nothing, and is invisible to every check in the repo and to a jsdom suite that does not
lay out CSS. The project has a mantra for exactly this — **verify in a real browser** — and it is
the only thing that has ever caught one.

**Why this iteration comes before the removal.** Iteration 1's rule is "delete the
`var(--gog-ms-x, ` wrapper and its matching `)`; nothing else moves." Applied mechanically to line
1138 that produces

```css
--gog-multiselect-focus-glow: 0 0 8px var(--gog-ms-focus-ring);
```

— a reference to a name the same release just deleted, preserved verbatim by a rule that is correct
for the other 148 lines. Fixing it first keeps iteration 1 mechanical everywhere.

**The work:**

1. Fix all five declarations (1138, 1184, 1188, 1474, 1475) to name tokens that exist:
   `--gog-multiselect-focus-ring`, `--gog-multiselect-field-color`, `--gog-multiselect-field-border`,
   `--gog-select-field-color`, `--gog-select-field-border`.
2. Verify each in a browser against `ui-showcase` **before** the fix and after — the before-picture
   is the point. Multiselect focus glow: focus the field, look for the ring. Filter boxes: open a
   `gog-select` and a `gog-multiselect` with filtering on, look for the border.
3. **Regression coverage is rule F below, not a component spec.** The panel-height bug this
   resembles had a JS-side read (`getComputedStyle().getPropertyValue()`) to pin with a spec; these
   three don't — nothing in the component's TypeScript reads `--gog-multiselect-focus-glow` or the
   two filter-input tokens, only the compiled SCSS does, through a `box-shadow`/`border` shorthand.
   jsdom does not implement the CSS cascade or `var()` resolution against an external stylesheet
   (it reflects only literal, directly-set style values), so a spec asserting a rendered
   `box-shadow` or `border` here would not exercise the real bug and could pass or fail for reasons
   unrelated to it. The static scan is the correct regression mechanism for a pure-CSS
   dead-reference bug, which is exactly what rule F below is — confirmed by reverting these five
   fixes and re-running `check:tokens`: it failed on all five, at their exact lines, and nothing
   else.
4. File all three defects in `docs/backlog.md` under **Defects**, and close them there as they
   land — the backlog is the project's list of what a consumer is hitting today, and these qualify.
5. CHANGELOG: these are `### Fixed`, separate from the removal's `### Removed`. A consumer who
   overrode `--gog-multiselect-focus-glow` to work around the missing glow will now get _both_,
   which is a visible change worth its own line.

**Then generalise it.** The scan that found these is five lines of Node and belongs in
`check-tokens.mjs` as a new rule, so that the fourth instance fails a build instead of waiting a
month — **done, as rule F**, added and verified the same way:

> **Rule F — no dead reads.** A `var(--gog-…)` with no fallback, naming a property that neither
> `theme.css` nor any component stylesheet declares and that is not on the instance-layer
> allowlist (`scripts/instance-tokens.mjs`), is a failure.

The allowlist exemption is what makes the rule correct rather than merely strict: the instance
layer is _deliberately_ undeclared, and every one of its members is a `var()` read of a name
nothing declares. The difference is that those are always read _with_ a fallback, so the
no-fallback condition alone was sufficient — implemented as written above, no allowlist-specific
carve-out needed against the 117 instance tokens.

**Iteration 0, as it finished (2026-08-28).** All five fixed in `theme.css`
(1138/1184/1188/1474/1475); the two `ui-showcase` ingredient reads at the multiselect
`--gog-ms-focus-glow` lines (157/308/457) fixed alongside, since they carried the identical bug one
level up. Verified live in `ui-showcase`'s `cyberpunk` theme: `getComputedStyle` on the multiselect
trigger and the select/multiselect filter inputs now resolves real values instead of `''`/invalid,
`:focus-visible` on the multiselect trigger renders an actual `box-shadow` (screenshotted), and the
select's filter input renders a real border (screenshotted) instead of none. `check:tokens`,
`check:deprecations`, `lint`, `format:check` and `test:lib` (1059 tests) all pass unchanged.
Rule F sanity-checked by reverting `theme.css` to its pre-fix state and re-running `check:tokens`:
it failed at exactly the five known lines and nothing else, then passed clean once restored.
`docs/backlog.md`'s three entries updated to closed, matching how the panel-height defect was
recorded the same day its fix landed — a backlog defect closes when the code is fixed, not when
the release ships; the CHANGELOG entry (iteration 4) is the separate, release-gated record.

---

## Iteration 1 — the removal

### The mechanical part

For every declaration of the shape

```css
--gog-button-md-padding: var(--gog-btn-md-padding, 0.75rem 1.25rem);
```

delete the `var(--gog-btn-md-padding, ` wrapper and its matching `)`, leaving

```css
--gog-button-md-padding: 0.75rem 1.25rem;
```

Nothing else about the declaration moves — same property name, same final value, same position in
the cascade. `theme.css`'s own `@deprecated` comment says this already; it is restated here because
it applies to every one of the ~149 lines, not just the one it is attached to. **After iteration 0
there are no exceptions to it.**

Several declarations span multiple lines only because prettier wrapped them; un-wrapping usually
lets them collapse back to one. Run `npm run format` at the end rather than hand-reflowing.

### Per-file list — the library

Measured with `grep -rn -- "--gog-btn-\|--gog-ms-\|--gog-confirm-" projects/gleks/ui/src`, then read
file by file, so this list says what kind of change each file needs rather than a line count.

| File                                                    | Lines           | What it is                                                                                                                                                                                                                                                                                              | What changes                                                                                                                                                          |
| ------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `styles/theme.css`                                      | ~149            | The header comment's deprecation block, plus every `var(--gog-button-x, var(--gog-btn-x, …))`-shaped declaration                                                                                                                                                                                          | Delete the header comment's "pre-21.5.0 spellings" section (the CHANGELOG carries the history from then on); un-wrap every declaration per the pattern above            |
| `styles/button.css`                                     | 11              | The **instance-layer** fallback chains. `--gog-button-bg`, `-color`, `-border`, `-padding`, `-font-size`, `-shadow`, `-hover-bg`, `-hover-color`, `-hover-shadow`, `-spinner-color` are deliberately undeclared in `theme.css` (the per-instance escape hatch), so their `--gog-btn-*` fallback lives here | Same un-wrap: `var(--gog-button-bg, var(--gog-btn-bg, var(--gog-button-variant-bg, …)))` → `var(--gog-button-bg, var(--gog-button-variant-bg, …))`                       |
| `lib/shared/token-names.ts`                             | 20              | **Generated** — `// GENERATED FILE — do not edit by hand`                                                                                                                                                                                                                                                | Nothing manual; see iteration 3                                                                                                                                        |
| `lib/shared/deprecations.ts`                            | 151             | **Generated** — the `GOG_DEPRECATIONS` manifest                                                                                                                                                                                                                                                         | Nothing manual; see iteration 3                                                                                                                                        |
| `styles/presets/slate.css`                              | 1 (line 11)     | A comment listing what the preset does _not_ contain (`no --gog-btn-*`)                                                                                                                                                                                                                                  | Reword to `--gog-button-*`, or drop the aside — the prefix it names will not exist                                                                                      |
| `lib/components/button/button.directive.ts`             | 1 (line 87)     | A comment: "its own stylesheet bottoms out at `--gog-btn-md-*`"                                                                                                                                                                                                                                          | Reword to `--gog-button-md-*`                                                                                                                                          |
| `lib/components/multiselect/multiselect.component.spec.ts` | 2 (lines 525, 533) | The panel-height regression test's comment and title, which name `--gog-ms-*` as the wrong-name-that-was-read                                                                                                                                                                                             | **Leave the test alone**, but check the wording still reads correctly once the names are gone. It is the one place in the suite that mentions them, and as history      |

`multiselect.component.ts` used to be on this list and is not any more: its four `GogDropdownBase`
token overrides named the old prefixes, which was **not a fallback but a live bug** — those names
are never declared as real properties, so `getComputedStyle().getPropertyValue()` always returned
`''`. Fixed independently on 2026-08-28. Mentioned here only so a reader does not mistake its
absence for an oversight.

### The consumer this repo already has — `ui-showcase`

`projects/ui-showcase/src/styles.scss` sets the abbreviated names directly, across three theme
blocks. This is exactly the "a consumer who set the old name keeps working" case the fallback
wrapper exists for, and exactly what breaks the day the wrapper is deleted — silently, with no
build error, because an unresolved `var()` does not fail a build, it just stops matching anything.

| Lines         | Property                                                                | Becomes                                                        |
| ------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------- |
| 90–92         | `--gog-btn-sm-padding`, `--gog-btn-md-padding`, `--gog-btn-lg-padding`  | `--gog-button-{sm,md,lg}-padding`                              |
| 151, 302, 451 | `--gog-ms-gap` (one per theme block)                                     | `--gog-multiselect-gap`                                        |
| 154, 305, 454 | `--gog-ms-label-letter-spacing`                                          | `--gog-multiselect-label-letter-spacing`                       |
| 157, 308, 457 | `--gog-ms-focus-glow`                                                    | `--gog-multiselect-focus-glow` — **and its ingredient**, below |

**Two of these are not pure renames.**

- **Lines 87–89 are a comment that becomes false.** The `--gog-btn-*` paddings are deliberate: the
  comment says this theme "is the live check that an override written as `--gog-btn-*` still
  reaches the button through the `--gog-button-*` alias, for the whole window that ends in 21.7.0."
  That window ends in this release. Rename the properties **and delete the comment** — leaving it
  would tell the next reader the file is testing something it no longer tests.

- **Lines 157/308/457 carry the same dead-reference bug as iteration 0.** They read
  `--gog-ms-focus-glow: 0 0 12px var(--gog-ms-focus-ring);` — a deprecated name used as an
  _ingredient_, with no fallback. `--gog-ms-focus-ring` is declared by nobody, so the showcase's
  custom multiselect focus glow has never rendered in any of its three themes, for the same reason
  the library's default never did. Rename both halves:
  `--gog-multiselect-focus-glow: 0 0 12px var(--gog-multiselect-focus-ring);`. Worth a
  before-and-after look in a browser alongside iteration 0's library-side fix — the two are the
  same bug at two levels, and fixing only one still leaves the showcase overriding the library's
  now-working default with a broken value.

This table is why the three prefixes cannot be deleted from `theme.css` in isolation: **the
showcase migration is part of the same release**, not a follow-up, because `ui-showcase` is the one
place library changes get verified live (`CLAUDE.md` rule 3). Verifying 21.7.0 against a showcase
still speaking the old names would not catch the removal breaking anything — it would be verifying
the wrong build.

**Iteration 1, as it finished (2026-08-28).** The mechanical un-wrap ran as a script (find every
`var(--gog-{btn,ms,confirm}-x, FALLBACK)`, replace the whole call with `FALLBACK`, repeat) rather
than by hand — 140 removed from `theme.css`, 11 from `button.css`, both formatted with prettier
afterward and diff-reviewed; every hunk is a pure wrapper removal, no value changed. Before running
it, the header's "pre-21.5.0 spellings" comment block was deleted by hand (the script would
otherwise have mangled its `var(--gog-btn-md-padding, …)` prose example), and four more prose spots
(the button and button-toggle instance-hatch comments, the multiselect section header's own
deprecation blurb, one slider comment) were reworded or dropped by hand for the same reason —
they don't match `var(` so the script left them alone, but they'd have gone stale.

**One thing the original per-file list missed, that the check caught:** `scripts/instance-tokens.mjs`
carried 10 `--gog-btn-*` entries, added because `button.css`'s fallback chain used to read them.
Once `button.css` no longer does, `check:tokens`' rule D (`allowlist-fresh`) failed on all 10 as
stale — removed, along with the now-inapplicable comment explaining why they were there. Not in the
plan's table because the survey that produced the table never ran the checker against a
post-removal tree; this is exactly the kind of gap rule-based verification exists to catch instead
of a human re-reading 149 lines.

`ui-showcase`'s migration matched the table exactly: 12 renames, the dead comment at lines 87–89
deleted, and the two ingredient-only fixes from iteration 0 confirmed still in place after the
mechanical pass touched the same file. `check:tokens`, `check:deprecations`, `lint`, `format:check`,
`test:lib` (1059 tests), `build:lib` and `build:showcase` all pass. Verified live in `ui-showcase`
under all three custom themes (`cyberpunk`/`warcraft`/`red-alert-3`): every renamed token's computed
value on `document.documentElement` matches what the showcase source declares, for buttons,
multiselect (gap/letter-spacing/focus-ring/focus-glow) and the confirmation dialog (spot-checked,
unchanged since `ui-showcase` never overrides it) — screenshotted the button page's five-size scale
and an open confirmation dialog under `cyberpunk`, both rendering correctly with no missing padding
or dropped border. Dev server stopped afterward.

**Not done as part of this iteration, and out of scope for it:** iterations 2 (the ratchet), 4 (the
published docs — README/AGENTS.md/CHANGELOG migration note beyond the `### Fixed` entry already
added in iteration 0) remain. Iteration 5's checklist above has been run once, against iteration 1
alone — it needs a final re-run once 2 and 4 land, which is why its status is partial rather than
done.

---

## Iteration 2 — make the ratchet actually ratchet

**`CLAUDE.md` says `npm run check:deprecations` "fails the build once `package.json` reaches 21.7.0
with any of them still there". It does not.** `scripts/check-deprecations.mjs` globs `**/*.ts` and
parses `@deprecated` tags; the library currently has **zero** of them (`Deprecation ratchet check
passed — 0 tag(s) in 129 source file(s) … Due: nothing deprecated.`). The three CSS prefixes live in
`scripts/deprecations.mjs`'s `DEPRECATED_NAMESPACES` map, which `check-deprecations.mjs` never
imports. So the promise that this removal cannot be deferred is enforced by nothing: 21.7.0 could
ship with all 151 in place and every check would pass.

That is the same failure the ratchet was built for after `GogSelectOption` shipped past its
`Removed in 21.4.0` tag (`docs/hardening-21.5.0.md`, iteration 3) — a promise nothing checks is
decoration. It slipped once for symbols, the check was written for symbols only, and the CSS half
inherited the gap.

**The work:** `check-deprecations.mjs` imports `DEPRECATED_NAMESPACES` and applies its existing
on-time rule (rule B) to each entry's `removedIn` against the library version, failing when a
namespace is at or below the current version _and_ still present in the stylesheets. Reuse
`collectDeprecatedTokens` from `deprecations.mjs` so "still present" means what the CSS actually
contains, not what the map claims.

Note the ordering trap: once iteration 1 lands and `DEPRECATED_NAMESPACES` is emptied, the new rule
has nothing to check and passes vacuously. **Write it before emptying the map**, run it against the
current 21.6.1 tree (it must pass — 21.7.0 > 21.6.1), then again with a scratch bump to 21.7.0 to
watch it fail. Do that bump in a throwaway copy of `package.json`, never in a commit: bumping the
version is cutting the release, which is `CLAUDE.md` rule 1's territory.

Also correct `CLAUDE.md`'s release-sequence row, which states the enforcement as fact.

**Iteration 2, as it finished (2026-08-28).** Landed as rule C in `check-deprecations.mjs`,
implemented as the plan describes — but the ordering trap didn't bite, because iteration 1 never
emptied `DEPRECATED_NAMESPACES` (it isn't on that iteration's per-file list; only the CSS
references it describes were removed). The map still lists all three namespaces at `removedIn:
'21.7.0'`, so rule C has real namespaces to check on every run, not zero. Verified both directions
without ever touching a real file's committed state: saved the current (fixed) `theme.css` and
`package.json` aside, restored the pre-iteration-1 `theme.css` (still holding all 149 deprecated
references) and bumped a working copy of `package.json` to `21.7.0`, and confirmed the check fails
with `[css-overdue]` naming every surviving token under all three prefixes; restored both files
from the saved copies and confirmed `git diff` was empty and the check passes clean again at
21.6.1. `CLAUDE.md`'s release-sequence row corrected to describe what actually enforces this now.

**Left open on purpose:** whether `DEPRECATED_NAMESPACES` itself should now be emptied, since the
CSS it describes no longer exists anywhere. Left populated — it still correctly documents what was
deprecated and when, `check:tokens`/`generate-deprecations.mjs` degrade harmlessly to reporting
zero matches against it, and emptying it is a decision about when the deprecation is officially
"over" that arguably belongs with the actual version bump (`CLAUDE.md` rule 1), not before it.

---

## Iteration 3 — the generated artifacts, at zero

Neither generator has ever produced an empty list, and both feed files that ship.

| Artifact                     | Command                        | After the removal                                                                                    |
| ---------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `lib/shared/token-names.ts`  | `npm run generate:tokens`      | 20 names leave the `GogTokenName` union and their entries leave `GOG_TOKEN_GROUPS`. Also writes `TOKENS.md` |
| `lib/shared/deprecations.ts` | `npm run generate:deprecations` | `GOG_DEPRECATIONS` becomes `[]` — 0 symbols and 0 tokens                                              |

Three things to check rather than assume:

1. **`GogTokenName` losing 20 members is a breaking type change** for anyone who annotated a
   variable with it. Intended — it is exactly what the release announces — but it belongs in the
   CHANGELOG's `### Removed` in those words, because it is the one part of the removal a consumer's
   build _will_ catch, unlike the CSS.
2. **The empty-array output turned out fine, unlike the plan's original worry.** The template
   interpolates `${rows}` between `[` and `];`, which would leave a blank line inside the brackets
   for an empty list — but `generate-deprecations.mjs` already runs its own output through
   `prettier.format()` before writing (line ~162), so the file lands as `= [];` on one line with no
   manual branch needed. Confirmed 2026-08-28: ran it against the now-empty map, `format:check`
   passed unchanged. The doc comment above the export ("An empty `symbol` half means…") is worth a
   revisit once the token half is empty too, but that's iteration 4's job (AGENTS.md), not this one.
3. **`check:deprecations` runs `generate-deprecations.mjs --check`**, so a stale manifest fails.
   Regenerate in the same commit as the CSS change, not after.

The lab's layer-4 deprecation badges (`theming-page`, `deprecated-token-groups.ts`) read
`GOG_DEPRECATIONS` from the **published** package and already guard on
`deprecatedTokenGroups.length > 0`, so they degrade to nothing on their own. That is a
`lab-after-publish.md` concern, not this release's.

**Iteration 3, as it finished (2026-08-28).** `npm run generate:tokens` dropped `GogTokenName` from
1394 total generated names to what remains after the 20 deprecated ones left (`TOKENS.md` was
already byte-identical before and after — it never listed the fallback-only names, since they were
never *declared*). `npm run generate:deprecations` produced `GOG_DEPRECATIONS: readonly
GogDeprecation[] = [];` — checked item 2's worry directly: the generator already pipes its output
through `prettier.format()` before writing, so the predicted blank-line-in-brackets problem never
materialized and no generator code change was needed. `check:tokens` confirms both artifacts are
up to date.

---

## Iteration 4 — the documents that ship inside the package

Three of the four published files describe the deprecation as live. All of them ship to npm, so
they are part of the library, not notes about it (`CLAUDE.md`, and
`gleks-ui-library.instructions.md` step 9).

| File           | Where          | What it says now                                                                                                                                                     | What it must say                                                                                                                                                                                       |
| -------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `README.md`    | ~143–145       | A blockquote: "**The old spellings still work** — every new name derives from its old twin — and are **removed in 21.7.0**."                                          | Past tense, or delete. The surrounding notes on `--gog-input-*` and `--gog-panel-*` stay — they explain prefixes that _look_ abbreviated and are not, which is more useful once the real ones are gone   |
| `AGENTS.md`    | ~175–178       | "The abbreviated `--gog-btn-*`, `--gog-ms-*` and `--gog-confirm-*` still resolve and are removed in 21.7.0 — don't write new code with them."                          | "were removed in 21.7.0" — an agent reading this file is precisely the reader who would otherwise emit a dead override                                                                                    |
| `AGENTS.md`    | ~1622–1636     | The `GOG_DEPRECATIONS` section's worked example filters `removedIn === '21.7.0'` and shows a `--gog-btn-bg` row; the prose says "**In 21.5.0 it holds 154 tokens…**"    | Both go wrong the moment the list empties. Rewrite the example against an empty list and say the list is empty — the section still earns its place, because "is anything deprecated?" is a real question |
| `TOKENS.md`    | generated      | —                                                                                                                                                                     | Never by hand; falls out of `npm run generate:tokens`                                                                                                                                                   |
| `CHANGELOG.md` | new top entry  | —                                                                                                                                                                     | `## [21.7.0] - planned`, with `### Removed`, `### Fixed` (iteration 0) and `### Changed` as warranted. **Leave the heading as `planned`** — swapping it for a date is cutting the release                 |

Add a migration note to `### Removed` in the shape 21.5.0's entry used: the three old→new rows, plus
the one instruction that matters — a global find-and-replace across the consumer's own stylesheets,
because nothing else will tell them.

**Iteration 4, as it finished (2026-08-28).** `CHANGELOG.md`'s `### Removed` entry landed in
iteration 0's commit already (it made more sense to open the `[21.7.0] - planned` heading once,
alongside the `### Fixed` entry, than to touch that heading twice) — confirmed still there,
unchanged. `README.md`'s blockquote reworded to "renamed in 21.5.0, removed in 21.7.0" / "no longer
resolve"; the `--gog-input-*` and `--gog-panel-*` notes beside it are untouched, as planned.
`AGENTS.md` got three edits, one more than scoped: the inline mention at ~175–178 reworded to past
tense; the `GOG_DEPRECATIONS` worked example rewritten against the real empty array (`[]`, checked
against what `generate:deprecations` actually produces, not assumed); and a new **Removed in
21.7.0** section added in the same shape as the existing **Removed in 21.5.0** one, since a
three-row migration table serves an agent better than a paragraph — the file's own precedent made
that the consistent choice, not a scope add. The unscoped extra: the file's header sentence ("as of
`21.6.1`") also named a version, which the table above didn't mention — moved to `21.7.0` and
pointed at both removal sections, since leaving a stale version number one paragraph above a
freshly-corrected one would have undercut the fix. `TOKENS.md` needed nothing, confirmed in
iteration 3. A full-repo grep for the three prefixes across `README.md`/`AGENTS.md` after all edits
turned up only the intended historical/migration mentions.

---

## Iteration 5 — verification

```bash
npm run check:tokens          # deprecated-prefix count must be 0; rule F must pass
npm run check:deprecations    # the new CSS rule from iteration 2, and an empty manifest
npm run check:release         # must still FAIL on the version/heading — see below
npm run lint
npm run format:check
npm run test:lib
npm run build:lib
npm run build:showcase
```

`check:release` is expected to fail for the whole of this work: `package.json` says 21.6.1 while the
changelog's top entry says 21.7.0. That is the correct state for a version being worked on. **Do
not "fix" it** — bumping the version or dating the heading is cutting the release.

Then the browser pass, which is the only part of this that catches what the removal actually risks,
since the failure mode is a token silently resolving to nothing:

1. `npm run build:lib`, restart `ng serve ui-showcase`.
2. **Buttons**, in all three showcase themes: the sm/md/lg paddings came from `--gog-btn-*-padding`
   and now come from `--gog-button-*-padding`. If the migration missed one, the button falls back to
   the library default and gets visibly roomier or tighter. Compare against a shot taken _before_.
3. **Multiselect**, in all three themes: field gap, label letter-spacing, and the focus glow — which
   should now appear for the first time (iteration 0 plus the showcase-side ingredient fix). A glow
   still absent means one of the two halves was missed.
4. **The filter box** inside both `gog-select` and `gog-multiselect`: it should have a border.
5. **Confirmation dialog**: only 7 tokens and the showcase overrides none of them, so this is a spot
   check that the un-wrap dropped no value — open one and look at its gaps and widths.

Take the before-shots first. `docs/lab-appearance-baseline.md` is the precedent: that file exists
because "looks right" is not a check unless there is a picture to be right against.

**Iteration 5, as it finished (2026-08-28).** The command checklist ran clean after every iteration
that could affect it (0, 1, 2), and once more after 3 and 4 landed: `check:tokens`,
`check:deprecations`, `lint`, `format:check`, `test:lib` (1059 tests), `build:lib` and
`build:showcase` all pass; `check:release` still correctly fails on the version/heading, which is
the expected state and not a bug. The browser pass — items 1–5 above — ran once, live against
`ui-showcase` under `cyberpunk`/`warcraft`/`red-alert-3`, as part of iteration 1's own verification
(recorded there in full: computed-value checks across all three themes plus screenshots of the
button scale, the multiselect focus glow, both filter boxes, and an open confirmation dialog).
**Not repeated after iterations 2 and 4**, deliberately: both are tooling and documentation only —
neither touches `theme.css`, `button.css`, any component stylesheet, or `ui-showcase`'s styles — so
nothing changed that a second browser pass could have caught. If a later iteration of this plan (or
any future work) touches CSS again, the browser pass is not optional and needs its own re-run;
"nothing rendering changed since the last check" is a claim to verify by diffing the actual file
list touched, not to assume.

---

## What this release does _not_ touch

- **`gleks-ui-lab`.** `CLAUDE.md` rule 3: a library change never touches the lab in the same
  session, because the lab tracks the published package. Its mentions of the abbreviated prefixes
  (`faq-data.ts`, `theming-page.html`, `deprecated-token-groups.ts`) are prose and tooling about the
  deprecation as a live fact; all of it flips to past tense **after** 21.7.0 is on npm. Already
  tracked in `docs/lab-after-publish.md`'s _After 21.7.0_ section — add the layer-4 empty-state
  check to it if iteration 3 turns anything up.
- **The instance-layer escape hatch.** `--gog-button-bg` and its nine siblings stay undeclared and
  stay working; only their `--gog-btn-*` twin goes.
- **`--gog-input-*`.** Not an abbreviation — it is the shared text-field block that `gog-inputfield`
  and `gog-textarea` both render. It keeps its name, and the README/AGENTS notes saying so stay.

## Does `themes.md` ride along?

`docs/themes.md` names 21.7.0 as its target "alongside that version's mandatory token-prefix
removal", on the argument that both rewrite `theme.css`'s component-token layer and one pass is
cheaper than two. `CLAUDE.md` lists it as unscheduled.

**Recommendation: no — ship the removal on its own, and open `themes.md` iteration 1 immediately
after.** The shared-cost argument is real but small: the removal edits the _left_ side of ~149
declarations (delete a wrapper), while the character layer edits the _right_ side of 510 (replace a
literal with a `var()`). The overlap is the file, not the lines. What is not small is the
verification. The removal's whole risk is "a value silently stopped arriving", and its browser pass
works by diffing against a before-picture in which **nothing should have changed**. The character
layer's iteration 1 has the same acceptance criterion — "no computed default changed" — so stacking
them means a pixel that moved has two candidate causes and no clean bisect. The removal is also
_mandatory_ and dated, while the character layer is a 510-declaration refactor with an open audit
step in front of it; binding a deadline to an unscoped job is how the deadline slips.

If the user wants them in one release anyway, the safe order is: land iterations 0–5 here in full,
verify, **then** start `themes.md` iteration 1 in the same version — so that any pixel that moves
during the character-layer work has exactly one suspect.
