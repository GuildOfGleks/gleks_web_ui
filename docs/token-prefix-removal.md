# The 21.7.0 token-prefix removal — a per-file list

**Target: 21.7.0.** Not a plan in the `panel-card.md`/`ripple.md`/`themes.md` sense — there is no
design decision left to make, only a mechanical removal that touches more files than `CLAUDE.md`'s
one-line summary suggests. This file is that list, so the work is a checklist rather than a re-read
of `theme.css` from scratch. Written 2026-08-28, against 21.6.1.

## What is being removed

Three abbreviated custom-property prefixes, deprecated in 21.5.0 (2026-08-19), each honoured today
by a `var(--gog-<new>-x, var(--gog-<old>-x, <value>))` fallback wrapper in `theme.css`:

| Old | New |
| --- | --- |
| `--gog-btn-*` | `--gog-button-*` |
| `--gog-ms-*` | `--gog-multiselect-*` |
| `--gog-confirm-*` | `--gog-confirmation-dialog-*` |

Run `npm run check:tokens` for the live count and per-prefix split — **154** at last measurement
(70 + 76 + 8), but that number moves with every token added or removed, so don't cite it without
re-running the command. The mechanism and the reason (aliasing instead of wrapping would silently
discard a themed override — see `theme.css`'s own header comment above the deprecation tag) are
already documented in `theme.css` itself; this file is the removal's blast radius, not a repeat of
its reasoning.

## Removing the wrapper — the mechanical part

For every declaration of the shape

```css
--gog-button-md-padding: var(--gog-btn-md-padding, 0.75rem 1.25rem);
```

delete the `var(--gog-btn-md-padding, ` wrapper and its matching `)`, leaving

```css
--gog-button-md-padding: 0.75rem 1.25rem;
```

Nothing else about the declaration moves — same property name, same final value, same position in
the cascade. `theme.css`'s own `@deprecated` comment says this already; it's restated here because
it's the instruction that applies to every one of the ~149 lines below, not just the one it's
attached to.

## Per-file list

Measured with `grep -rn -- "--gog-btn-\|--gog-ms-\|--gog-confirm-" projects/gleks/ui/src`, then
read file by file so this list says what kind of change each file needs, not just a line count.

| File | Lines | What it is | What changes |
| --- | --- | --- | --- |
| `styles/theme.css` | ~149 | The three-line header comment (deprecation rationale) plus every `var(--gog-button-x, var(--gog-btn-x, …))`-shaped declaration | Delete the header comment's own deprecation block (or fold it into a "removed in 21.7.0" note in the CHANGELOG instead — see below); mechanically un-wrap every declaration per the pattern above |
| `styles/button.css` | 11 | The **instance-layer** fallback chains — `--gog-button-bg`, `-color`, `-border`, `-padding`, `-font-size`, `-shadow`, `-hover-bg`, `-hover-color`, `-hover-shadow`, `-spinner-color` are deliberately undeclared in `theme.css` (the per-instance escape hatch), so their `--gog-btn-*` fallback lives here instead, one level deeper in each chain | Same un-wrap, e.g. `var(--gog-button-bg, var(--gog-btn-bg, var(--gog-button-variant-bg, …)))` → `var(--gog-button-bg, var(--gog-button-variant-bg, …))` |
| `lib/shared/token-names.ts` | 20 | **Generated** — `// GENERATED FILE — do not edit by hand` | Nothing manual. Regenerates via `npm run generate:tokens` once `theme.css` no longer declares the old names |
| `lib/shared/deprecations.ts` | 154 | **Generated** — the `GOG_DEPRECATIONS` manifest | Nothing manual. Regenerates via `npm run generate:deprecations`; the token half goes to empty, same as the symbol half already is (see `lab-versioning.md` layer 4) |
| `lib/components/multiselect/multiselect.component.ts` | 4 | **Not a fallback — a live bug, unrelated to this removal.** `optionGapToken`/`optionsPaddingToken`/`panelMaxHeightToken`/`optionHeightToken` are overridden with the *old* names, which are never declared as real properties anywhere (only referenced inside another token's fallback), so `getComputedStyle(...).getPropertyValue(...)` on them always returns `''` | **Does not get fixed by deleting the theme.css wrappers** — the JS reads the abbreviated name directly, not through a `var()` fallback, so removing the fallback changes nothing here. Needs its own fix: rename the four constants to the spelled-out names, matching `select.component.ts`. Filed as a defect in `docs/backlog.md`, independent of this removal — fix it whenever, but it must not be mistaken for done once the wrappers are gone |
| `styles/presets/slate.css` | 1 | A comment noting what the preset does *not* contain (`no --gog-btn-*`) | Reword the comment to say `--gog-button-*` (or drop the aside — the deprecation it's referencing will no longer exist) |
| `lib/components/button/button.directive.ts` | 1 | A comment: "its own stylesheet bottoms out at `--gog-btn-md-*`" | Reword to `--gog-button-md-*` |

## The consumer this repo already has: `ui-showcase`

`projects/ui-showcase/src/styles.scss` sets the abbreviated names directly, across three theme
blocks — this is exactly the "a consumer who set the old name keeps working" case the fallback
wrapper exists for, and exactly what breaks the day the wrapper is deleted, silently, with no
build error, because these are CSS custom properties: an unresolved `var()` doesn't fail a build,
it just stops matching anything.

| Lines | Property | What to rename it to |
| --- | --- | --- |
| 90–92 | `--gog-btn-sm-padding`, `--gog-btn-md-padding`, `--gog-btn-lg-padding` | `--gog-button-sm-padding`, `--gog-button-md-padding`, `--gog-button-lg-padding` |
| 151, 302, 451 | `--gog-ms-gap` (one per theme block) | `--gog-multiselect-gap` |
| 154, 305, 454 | `--gog-ms-label-letter-spacing` | `--gog-multiselect-label-letter-spacing` |
| 157, 308, 457 | `--gog-ms-focus-glow` | `--gog-multiselect-focus-glow` |

**One of the three is not a pure rename.** Line 157 (and its siblings at 308, 457) reads
`--gog-ms-focus-glow: 0 0 12px var(--gog-ms-focus-ring);` — it uses `--gog-ms-focus-ring` as an
*ingredient*, not just as the property being set. `--gog-ms-focus-ring` is never declared by either
the library or the showcase (only `--gog-multiselect-focus-ring` is, in `theme.css`), so that
`var()` has always resolved to nothing here, with no fallback to catch it — the showcase's own
custom focus glow on multiselect fields has likely never rendered correctly. Renaming both the
property and its ingredient to `--gog-multiselect-focus-glow` / `var(--gog-multiselect-focus-ring)`
fixes the rename **and** this latent bug in the same edit — worth a look in a real browser
before and after, per this project's usual rule for anything CSS.

This table is the reason `--gog-ms-*`/`--gog-btn-*`/`--gog-confirm-*` cannot be deleted from
`theme.css` in isolation: **the showcase migration is part of the same release**, not a follow-up,
because `ui-showcase` is the one place library changes get verified live (`CLAUDE.md` rule 3) —
verifying 21.7.0 against a showcase still speaking the old token names would not catch the removal
breaking anything.

## What this removal does *not* need to touch

- **`gleks-ui-lab`** — per `CLAUDE.md` rule 3, a library change never touches the lab in the same
  session. Its two mentions of the abbreviated prefixes (`faq-data.ts`, `theming-page.html`) are
  prose describing the deprecation as a historical fact ("spelled out in 21.5.0... until
  21.7.0"), not live token usage. Once 21.7.0 is out, that prose needs a follow-up edit — tracked
  in `docs/lab-after-publish.md`'s _After 21.7.0_ section, not here.
- **`token-names.ts` and `deprecations.ts`** — generated, see the table above.
- **Any component `.spec.ts`** — none of the library's tests reference the abbreviated names
  directly (checked 2026-08-28); the fallback is a pure-CSS mechanism the test suite never had a
  reason to exercise, which is also why the multiselect bug above went uncaught.

## Verification

```bash
npm run check:tokens          # count of deprecated-prefix tokens must be 0
npm run check:deprecations    # manifest regenerates with an empty token half
npm run test:lib
npm run build:lib
npm run build:showcase        # after the styles.scss migration above
```

Then a real-browser pass over `ui-showcase` — at minimum the button and multiselect pages across
all three theme blocks the renamed properties live in (default, and whichever two the 151/302/451
line numbers belong to) — because the failure mode here is a token silently resolving to nothing,
which no automated check in this repo catches.
