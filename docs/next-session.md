# Handoff — closing 21.11.0, done

**Written 2026-09-09, at the end of the branch.** All four phases of the plan this file replaced
are complete. Delete this file once it has been read.

## What shipped, in six commits

1. `fix(ui)` — `gog-dialog`'s own `<h2>` title states its size (`--gog-text-xl`, exactly its
   already-rendered 24px) and leading (`--gog-line-height-snug`). Found while tracing the
   confirmation-dialog defect for the next commit: same defect class, no lying class name to give
   it away.
2. `fix(ui)` — `gog-confirmation-dialog`'s title and description read the type scale. The dead
   `heading-md`/`body-sm` classes are removed; title reads `--gog-text-lg` (18px), description
   reads `--gog-text-sm` (14px, a visible 2px shrink from the 16px it inherited before).
3. `fix(scripts)` — the `ch` cap recheck. `--gog-confirmation-dialog-max-width` (51ch) does not
   move: it resolves against `.confirm-dialog`'s own font (16px, inherited), not the description's,
   which is the same class of bug the toast fix caught in the previous branch. Corrected the
   `theme.css` comment and `survey-measure.mjs`'s reason string, which had predicted the opposite.
   Also documented a real, separate finding: the survey's `chCount` for a `ch`-based cap is
   `base.n` unconditionally, which is a tautology for this one token now that its container's font
   and its wrapping text's font differ — left as a comment rather than growing the script a second
   font axis for one entry. `docs/backlog.md`'s confirmation-dialog defect entry deleted.
4. `ci` — `check:class-names`, a new script and CI step: every class a library template applies to
   its own markup reads `gog-`, or is a named exception. The stronger "every class has a rule"
   version was measured and rejected (50 of ~400 classes are legitimate state hooks with no rule).
   Red-tested before wiring in (a throwaway unprefixed class on `gog-tag`'s template, confirmed
   caught and named, then removed) and the stale-exception path was verified too (substituting a
   fake name for `slide-left` surfaced both the real violation and the dead exception entry).
5. `docs` — `docs/lab-after-publish.md` gains the dialog-title entry for 21.11.0. `AGENTS.md`
   opened and checked: no input, output, slot, type or service method changed, so no edit needed.
6. `docs` — this handoff.

## Verified

- Full CI gate, once at the end (the branch started from a `master` the previous branch had
  already run it against twice): lint, format:check, check:tokens, check:deprecations,
  check:geometry (five scripts), check:class-names, check:logical-properties,
  check:state-specificity, check:loading-aria, check:contrast, check:app-contrast,
  check:theme-starter, build:lib, test:lib (1116 tests, no regressions), test:lib:coverage,
  build:showcase. All green.
- `check:release` still fails, correctly — version 21.10.0, heading still `planned`.
- **Live, in a real browser** (`ui-showcase`, `npx ng serve ui-showcase`, driven with
  `playwright-cli` — the `claude-in-chrome` extension controls the user's own Chrome on their own
  machine, which cannot reach a dev server started inside this session's sandbox; that mismatch is
  worth remembering for the next session that wants a live check). `getComputedStyle` read directly
  off the open confirmation dialog:
  - `.confirm-dialog`: `font-size: 16px`, `max-width: 439.875px` — unmoved, as predicted.
  - `.confirm-dialog__title`: `font-size: 18px`, `line-height: 23.4px` (18 × 1.3, `snug`).
  - `.confirm-dialog__description`: `font-size: 14px`, `line-height: 21px` (14 × 1.5, `relaxed`).
  - `.gog-dialog__title` (the plain dialog's `<h2>`): `font-size: 24px`, `line-height: 31.2px` —
    identical to its pre-fix rendered size, confirming the "state an accident" claim.
  Screenshotted in both a dark and a light theme: no wrapping, no overflow, comfortable spacing in
  both. Density was **not** varied — checked first that `--gog-density` multiplies only
  `--gog-space-*` in `theme.css`, never `--gog-text-*` or `--gog-line-height-*`, so this fix is
  provably invariant under it rather than untested under it.
  Dev server stopped afterward (`taskkill` on the listening PID); port 4300 confirmed free.

- **The 360px check the plan asked for — done 2026-09-09, after review caught that it had been
  skipped without being declared skipped.** The plan's phase 3 required it and said explicitly
  that a sandbox that cannot narrow the viewport should say so rather than stay quiet; the first
  pass did neither, and `playwright-cli resize` was available the whole time. Measured, against a
  prediction written before looking (margin `--gog-space-16` = 16px, `CH_PER_EM` 0.5391):

  | viewport | tooltip | menu | toast | doc overflow |
  | -------- | ------- | ---- | ----- | ------------ |
  | 360px | 278.156px — own cap wins | 320px — own cap wins | **328px = 360 − 32, clamp binds** | none |
  | 300px | **268px** | **268px** | **268px** — all three clamp | none |

  Both rows match the arithmetic to the hundredth. The tooltip's cap is read on an element
  carrying `--gog-tooltip-font-size`, not on a bare probe — reading it on an inherited 16px would
  have reported 370px and "the clamp binds", which is the same `ch`-resolves-per-element trap this
  branch spent a commit on.

  **And the confirmation dialog at 360px, which is D7's "no clamp here" decision seen directly:**
  `.gog-dialog__panel` computes `max-width: 324px` (its `90vw`) and renders 320px (its own
  `min-width`), while `.confirm-dialog`'s `max-width` still computes to 439.875px — the child's cap
  never binds, so the clamp D7 declined to add there could never have done anything. Title 18px and
  description 14px hold at that width too, no horizontal overflow.

## Fixed after review

Two findings from a review pass over the finished branch, both in work this branch added:

1. **The `ch`-cap prediction was corrected in one of the two places it lived** (`e3d03cf`).
   Commit `4a58e56` rewrote it in `scripts/survey-measure.mjs` and never grepped for the rest;
   `docs/component-geometry.md` carried the same claim twice, one of them asking for a re-check
   this branch had already performed. Both now carry a dated correction, per that file's own
   convention. This is the previous branch's own recorded lesson — a claim checked against part of
   the library rather than all of it — repeated one branch later.
2. **`check:class-names` could not tell a class from a prefix of one** (`a38949f`). The
   stale-exception guard used a substring test, so `confirm-dialog` counted as applied because
   `confirm-dialog__title` exists. Proved by deletion before fixing. The rewrite also drops a
   second walk of every template, checks literal tokens that sit beside a computed one, and needed
   a marker so `{{ size() }}` does not split into `size()` and get reported as a class. A renamed
   counter had also left a `ReferenceError` on the success path — found by running it, not reading
   it.

## Out of scope, on purpose (per the plan, unchanged)

D5 (the elevation ladder), the colour/OKLCH half of `docs/backlog.md`, the two geometry decisions
that add public tokens (dropdown panel radii, chip avatar drift), `docs/feedback-triage.md`'s
21.8.0 section, `gleks-ui-lab`, and cutting the release. Each reason is in the plan this file
replaced (`git show 6eaed89:docs/next-session.md`).

## Branch state

Six commits on `confirmation-dialog-type-scale`, cut from `master` at `b7c37d8`. Not squashed, not
rebased. Not yet pushed — push before handing off if review happens in a different session.

## A note on committing in this environment

Two of this branch's earlier commits (`dd156cb`, `0594133`) carry a stray leading and trailing `@`
line in their message body — an artifact of quoting a multi-line commit message with apostrophes
inside a single-quoted shell construct (the apostrophe closes the quote early and the `@` markers
leak in). Harmless — every pre-existing commit on this branch's parent history has the same
leading/trailing `@` lines, for reasons unrelated to this bug, so it reads as consistent — but the
fix is to write the message to a file and `git commit -F <file>`, which every commit after
`4a58e56` in this branch does.
