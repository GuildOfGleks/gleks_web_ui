# Next session — after 2026-09-04

**Written at the end of 2026-09-04. Delete this file when its contents are done or moved.** It
says where to start and why; everything durable lives in `docs/backlog.md`,
`docs/lab-after-publish.md` and `docs/feedback-triage.md`.

---

## Where things stand

**The open version was renamed from `21.8.1` to `21.9.0` on 2026-09-04, and it is a minor for a
reason:** it carries four new public inputs — `gog-button`/`[gogButton]` `severity`, `gog-chip`
`[(selected)]`, `gog-scroll` `horizontalWheel`, `GOG_CONFIG.spinner.component` — plus two new
palette token families. A patch number was describing a release with an `Added` section, which is
what prompted the rename. Twenty-eight changelog entries, 1112 tests, every check green, working
tree clean.

**`package.json` is still at 21.8.0 and the changelog heading still says `planned`, on purpose.**
`check:release` fails on both, which is the correct state for work in progress — see CLAUDE.md,
"Cutting a release — why an agent does none of it". Both are yours to change when you cut.

Seven commits landed on 2026-09-04. The three that were asked for:

- **`severity` on the button**, orthogonal to `variant` — the triage entry predicted a token
  family per severity per variant; what it actually needed was six ingredients per status and
  three shape rules.
- **`horizontalWheel` on `gog-scroll`**, opt-in, where the scroll-chaining trap the triage entry
  warned about turned out to be the feature rather than an obstacle to it.
- **`[(selected)]` on `gog-chip`**, tri-state so that no existing chip becomes a toggle button to
  a screen reader.

And four that were not, each found while doing those:

- **`gogBadge`'s status labels failed WCAG AA in four themes** — 11 pairs, `material`'s amber at
  1.97:1, shipped and unmeasured. Fixed; half of it cost no fidelity, half moved a hue one step
  down its own ramp.
- **Fourteen lengths ignored `--gog-density`** in the nine themes that set it, hiding in the four
  families `check-tokens` rule H did not cover.
- **The error line** sat 2px lower under two of the eight controls that render one.
- **A `feedback-triage.md` line claiming the toggled look was still open**, which the same release
  had already shipped.

## The first decision

**Cut 21.9.0, or keep going?** `docs/lab-after-publish.md` now holds **13** items blocked on
publication, one of which (`theme-starter.css`) will fail `check:theme-starter` the moment the new
version is installed. Four of the 13 are new public API from today, so the lab's button, chip and
scroll pages all describe components that have moved.

If cutting: bump `package.json` and date the changelog heading yourself, then `npm install` at the
repo root and work `lab-after-publish.md` top to bottom, deleting each entry as it lands.

## If not cutting — what is left, and it all needs your call

**`docs/backlog.md`'s Defects section holds one entry**, and it is a check rather than a
component: `check:contrast`'s automatic sweep cannot see a variant, because a variant class sets
`--gog-<block>-variant-*` rather than `color`/`background-color`. It has been reporting ~180
passing states without having looked at one of them, which is how the badge shipped its failures.
`gog-tag` and `gog-progressbar` are the two components with status variants still not covered by
hand, so they are the likeliest place for the next instance of the same bug.

Everything else is a decision:

1. **`docs/feedback-triage.md` → two items left.** Input masking (**needs a written plan first** —
   the file argues for a `gogMask` directive rather than an input component, and says why that is
   a plan and not a conclusion) and whole-row click on `gog-table`.

2. **`docs/backlog.md` → Gaps, missing components.** `alert`/`banner` is the one a real site wants
   most; `empty state` is the one with a plan waiting to be written. Both have to answer
   `panel-card.md`'s question first: what does it own that a `<div>` and a class do not?

3. **`docs/backlog.md` → Rough edges, the lab's bundle budget.** 1.00 MB against a 1.1 MB error.

4. **The small one:** a disabled chip keeps its selected ring, a disabled button drops its toggled
   one. The chip's behaviour is the one to keep.

## Traps recorded today

- **A gapped flex column already spaces its children**, so a `margin-top` on one adds to the gap
  rather than replacing it. Reading stylesheets said five components were missing their only
  spacing; measuring said two were adding a second helping.
- **A grep for a token cannot find a component that never declared one.** The error-line filing
  said "six fields" when eight render an error — the second sighting of that shape, after the
  `GOG_CONFIG` JSDoc defect.
- **A state colour must move _away_ from its own label, not in a fixed direction.** Deepening
  severity fills toward the page ink is right in the nine themes whose label is white and exactly
  backwards in the four whose label is the ink; it cost `primeng`'s info button 6.44:1 → 4.23:1 on
  press. `--gog-<status>-shade` is the fix, and the check caught it, not the eye.
- **`token-color.mjs` cannot resolve a `color-mix()` whose percentage is a `var()`.** A knob token
  for the mix ratio looked elegant and made every pair reading it unverifiable; the percentage is
  a literal now.
