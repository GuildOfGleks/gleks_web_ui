# Handoff — geometry/d7-measure-and-overlay-clamp, done

**Written 2026-09-09, at the end of the branch.** All three phases of the original plan are
complete. Delete this file once it has been read.

## What shipped, in eleven commits

1. `feat(scripts)` — `survey:measure`, reading real values instead of guessing.
2. `docs` — the `gog-confirmation-dialog` dead-class defect, filed to `docs/backlog.md` (found
   while tracing font sizes; not fixed here — it is a visible rendering change on a shipped
   component and wants its own session).
3. `docs` — D7 taken in `docs/component-geometry.md`: which caps get L8's viewport clamp, what the
   clamp's margin reads, which caps move to `ch`.
4. `fix(ui)` — the decision implemented in `theme.css`, four tokens.
5. `ci` — `check:measure`, folded into `check:geometry` (five scripts now, all green, all CI).
6. `fix(ui)` — a real bug, caught live in `ui-showcase` rather than by either check: toast's `ch`
   cap was resolving against the wrong element's font (16px inherited, not the message's 14px).
   Fixed by stating `font-size` explicitly where `max-width` is declared.
7. `docs` — the bug above, recorded as D7's fourth finding, cross-referenced from the
   confirmation-dialog defect entry so whoever fixes that one re-checks this too.
8. `docs(ui)` — `CHANGELOG.md` under the existing `[21.11.0] - planned` heading; `README.md`'s
   "ships zero clamp/vw" claim corrected (it stopped being true earlier in this same release);
   `generate:tokens` re-run.
9. `docs` — `docs/lab-after-publish.md` gains the 21.11.0 overlay-cap entry, and one line above it
   ("laws 2 and 4 not gated") fixed in passing — it was already false, describing the very release
   the section is about.
10. `docs` — D0 closed as a record: the geometry work shipped as one minor, D5's elevation ladder
    was never in it, which is the split D0's own text offered as the alternative.
11. `docs` — the stale-prose sweep: `CLAUDE.md`'s since-chip count (17 → 15), a stale
    "Law 4 is the only one left" / "D0, D5, D7 and D8 are still open" passage that predated even
    2026-09-06 and was never corrected, and dated correction lines (not rewrites) in
    `docs/themes.md` and `docs/backlog.md` where each described the spacing scale as fourteen
    steps.

## Verified

- Full CI gate, twice (start and end): lint, format, `check:tokens`, `check:deprecations`,
  `check:geometry` (now five scripts), `check:logical-properties`, `check:state-specificity`,
  `check:loading-aria`, `check:contrast`, `check:app-contrast`, `check:theme-starter`,
  `build:lib`, `test:lib` (1116 tests, no regressions), `build:showcase`. All green both times.
- `check:release` still fails, correctly — version 21.10.0, heading still `planned`.
- Live in `ui-showcase`: the six things 21.11.0 changed that no check can see (accordion chevron,
  select/multiselect square filter corners, menu item corner, `slg` field padding, chip hit-area,
  table cell padding), at density 1 and 0.85. Nothing found.
- Live in `ui-showcase`: all four D7 tokens resolve to their intended widths — tooltip 278px,
  toast 400px (after the fix above; 457px before it), confirmation dialog 440px, menu 320px.
- The viewport-clamp branch of the `min()` — could not resize the actual browser viewport in this
  sandbox (`resize_window` did not change `window.innerWidth`, a tool/environment limit, not a CSS
  one), so that half is verified structurally (`check:measure`, red/green tested against a
  deliberately wrong margin token) and arithmetically (the resolved margin tokens plugged into
  `calc(100vw - margin*2)` by hand) rather than by literally narrowing a window. Worth a real
  360px check in a normal browser before this ships, if anyone doubts `min()`/`calc()`/`vw` —
  though none of the three needs a vendor check at this project's stated support floor.

## Out of scope, on purpose

D5 (the elevation ladder) — its own release, its own plan document, not started. Nothing from
`docs/backlog.md` beyond the one defect filed above. `gleks-ui-lab` untouched.

## Review, and what it changed

A review pass over the finished branch found five things the implementation had not, four of them
in work this branch itself added. They are commits 13–16, and each is worth knowing:

1. **`check:measure` was a list of seven answers, not a rule.** It iterated its own decision table
   and never asked `theme.css` what else was there, so a new `*-max-width` token passed in silence.
   Proved by injecting one. Rule E now walks the family and fails on anything unclassified.
2. **The length resolver was answering where it should have refused.** `evalArithmetic` let
   `String.match` drop what it could not tokenise, so `43ch` read as `43` — and `survey:measure`,
   the tool that justified the whole decision, reported a 43px tooltip and a measure of 6.6ch while
   `check:measure`'s failure text told readers to re-run it. Now fails closed.
3. **The survey's viewport-unit self-check was vacuous**: `\bvw\b` cannot match `100vw`, and it read
   `theme.css` alone. It printed "confirmed: none" over four occurrences.
4. **"The only place `vw` appears in the library" was false**, and false before this branch too —
   the dialog panel's `90vw`, `--gog-dialog-max-height: 90vh`, `gog-menu`'s `100vh`. It had shipped
   into `README.md` and `CHANGELOG.md`. The claim had been checked by grepping `.css`/`.scss`; the
   counterexample that mattered was an inline binding in a template.
5. **The confirmation dialog's clamp could never bind**, because its panel already caps at `90vw`
   and the body pads 20px a side inside that. Removed; it keeps its `51ch` measure. The rule it
   produced is in the decision: an overlay nested in another overlay inherits that one's cap.

Findings 4 and 5 are the same mistake twice — a claim about the whole library checked against part
of it — and both were made by this branch's own author. Worth reading before the next survey.

## Branch state

Sixteen commits on `d7-measure-and-overlay-clamp`, cut from `master` at `bd8d6d0`. Not merged, not
squashed, not rebased. Pushed: no — still local as of this write-up; push before handing off if
review happens in a different session.
