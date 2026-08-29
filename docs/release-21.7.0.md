# 21.7.0 — what is left before it ships

**Status as of 2026-08-29: the payload is complete and verified; section B is now done, so what
remains is the version bump (user-only), one decision, and the post-publish lab work.** This file is the close-out checklist for a release whose *work* is done,
not a plan for work still being designed — `docs/token-prefix-removal.md` and `docs/themes.md` are
the plans, and both keep their own per-iteration records. This one answers a narrower question:
**what stands between the current tree and `npm run release` succeeding.**

Written after reviewing the 18 commits from `8519769` to `d3af678`.

## What 21.7.0 carries

Three separate bodies of work landed in this cycle. `CHANGELOG.md`'s `## [21.7.0] - planned`
entry is the consumer-facing version of this; the pointers below are for anyone who needs the
reasoning rather than the summary.

| Payload                                       | Plan                                     | State                                   |
| --------------------------------------------- | ---------------------------------------- | --------------------------------------- |
| The three deprecated token prefixes, removed  | `docs/token-prefix-removal.md`           | ✅ all six iterations done               |
| The character layer + preset catalogue        | `docs/themes.md`                         | ✅ library-side done, lab-side deferred  |
| Four dead-token defects, fixed                | `docs/token-prefix-removal.md` iter. 0   | ✅ done, closed in `docs/backlog.md`     |
| `DialogService.open()`'s optional `TData`      | —                                        | ✅ done                                  |

Everything in that table is committed, verified in a real browser where it renders, and recorded
in the docs that ship inside the package (`README.md`, `AGENTS.md`, `TOKENS.md`, `CHANGELOG.md`).

---

## A. Only the user can do this — it is the release

**Bump `projects/gleks/ui/package.json` to `21.7.0` and date the `## [21.7.0] - planned` heading.**

`CLAUDE.md` rule 1 and `gleks-ui-library.instructions.md` step 11: the user cuts every release, and
these two edits *are* cutting it. An agent must not make them, and must not "fix" `check:release`
by making them.

**Verified 2026-08-29 that nothing else blocks the bump.** Simulated it against a scratch copy of
`package.json` (restored immediately; `git diff` confirmed clean afterward):

- `check:deprecations` **passes at 21.7.0** — this was the real risk. Its rule C fails when a
  namespace's `removedIn` is at or below the current version *and* the stylesheets still contain
  it. The stylesheets no longer contain it, so the ratchet is satisfied. The release is not
  blocked by the mechanism built to block exactly this.
- `check:release` at 21.7.0 drops from two problems to **one**: the `planned` heading. Which is
  the other half of the same manual step.

**One cosmetic wart, not a blocker:** `check:deprecations` still prints `Due: 21.7.0 (3)` after
the bump, because `DEPRECATED_NAMESPACES` in `scripts/deprecations.mjs` is still populated with
the three now-removed prefixes. That is a deliberate choice recorded in
`docs/token-prefix-removal.md` iteration 2 — the map still correctly documents what was deprecated
and when, and emptying it is arguably part of cutting the release rather than preparing it. Worth
knowing the line is expected rather than a sign something was missed.

---

## B. Should land before publish — ✅ both done, 2026-08-29

Two gaps found while reviewing the cycle, both in surfaces the release itself created. Both are
now closed; the sections below keep the reasoning, and each ends with what actually landed.

### B1. `README.md` does not name the presets this release added

`README.md` ships inside the npm package and is the file a consumer reads first. Its theming
section names exactly one preset — `slate` — as "the worked example, palette-only", and lists no
others. That was accurate when three palette-only presets existed. It is now the only mention of
a catalogue that has **six** importable presets, three of which shipped in this very release:

| Preset                          | Kind                                      | Named in `README.md`? |
| ------------------------------- | ----------------------------------------- | --------------------- |
| `slate`, `one-dark`, `one-light` | palette-only                              | only `slate`          |
| `ledger`                        | palette + character layer                 | **no**                |
| `material`, `primeng`           | palette + character layer + a few per-component | **no**           |

`AGENTS.md` was updated (its preset list names all six, with the palette-only/character split);
`README.md` was not. The two ship together and now disagree about what the package contains.

**The fix:** extend `README.md`'s theming section to list the six presets and the distinction
between them — palette-only versus the ones that also set character. `slate` stays the worked
example; the point is that a reader learns the others exist. Keep it short — `AGENTS.md` already
carries the per-preset detail, and the README's job is the shape of the library, not a catalogue.

**✅ Done.** `README.md`'s "Light, dark and your own" section keeps the `slate` code block as the
worked example and gains a three-row table after it — palette-only, palette + character, palette +
character + per-component — naming all six and pointing at `AGENTS.md` for the detail. Nine lines.

### B2. The three new presets have no `ui-showcase` surface

`gleks-ui-library.instructions.md` step 7 is explicit: *"If the change has no visible surface in
the showcase yet, add the example that gives it one. That is what the showcase is for, and an API
with no live example is an API whose layout bugs nobody will find."*

`ledger`, `material` and `primeng` are new public API — importable CSS a consumer can turn on —
and they have **no persistent presence in `ui-showcase` at all**:

- `angular.json`'s `ui-showcase` `styles` array imports `presets/one-dark.css` and
  `presets/one-light.css` only.
- `showcase-themes.ts` lists seven themes (`light`, `dark`, `one-dark`, `one-light`, `cyberpunk`,
  `warcraft`, `red-alert-3`) — none of the new ones, and not `slate` either.
- `themes-page.ts` renders from that same list, so the showcase's own theme lab cannot show them.

They were verified during their own iterations by injecting the built CSS into the page and
setting `data-theme` from the console — which was the right call *at the time* (it proved the
tokens resolve without touching a source file), but it leaves nothing behind. Nobody can look at
`ledger` tomorrow without repeating the console work.

**The fix:** add the four unrepresented presets — `ledger`, `material`, `primeng`, and `slate`,
which has the same gap for older reasons — to `angular.json`'s style list and to
`showcase-themes.ts`. They then appear in the app's theme switcher and on the themes page for
free, because both render from that one list. This is `ui-showcase` only; **not** `gleks-ui-lab`,
which is section D.

**Worth doing before the bump, not after:** it is the last chance to catch a layout problem in a
preset while it is still unpublished, and the presets are the largest new surface in this release.

**✅ Done.** All four added to `angular.json`'s `ui-showcase` `styles` array and to
`showcase-themes.ts`; the switcher now offers 11 themes and the themes page renders 9 side by side.
Three things worth knowing from doing it:

- **The themes page carried a hard-coded count.** Its hero read *"three radically different skins"*
  and *"compares all three custom themes"* — prose that was correct when the list had three
  non-built-in entries and silently wrong the moment it had nine. Updated in the same change. The
  page renders from `showcaseThemes`, so the list was the only thing anyone thought to check;
  **a page that derives its content from a list can still hard-code the list's length in its
  copy.** Worth grepping for a spelled-out number next time a shared list grows.
- **No layout problem in any of the three.** Verified at 1568px in Chrome on the themes page and on
  `/dashboard` (the densest page: table, paginator, tags, three filter controls) under `ledger`,
  `material` and `primeng`. Each resolves its own character — `--gog-radius` 0/4px/6px against the
  library's 8px, `text-transform: none` against the default `uppercase` — and `material`'s pill
  button (20px on a 4px base) confirms its per-component opt-in survived the port.
- **+7.27 kB on the showcase's initial bundle** (369.45 → 376.72 kB over the 500 kB budget, which
  was already exceeded before this). Showcase-only; the published package is unaffected, since
  these files already shipped in it.

---

## C. Needs a decision from the user, and gates one CI step

**Two WCAG AA contrast failures in shipped palettes**, open in `docs/backlog.md`, found by this
release's own `npm run check:contrast`:

| Pair                                          | Failing themes                                            |
| --------------------------------------------- | --------------------------------------------------------- |
| `--gog-muted-text-color` vs background/surface | `slate` (4.39:1), `one-dark` (2.32–2.55:1), `one-light` (2.47–2.58:1) |
| `--gog-accent-text-color` vs `--gog-accent-color` | `light` (4.44:1), `one-light` (4.05:1), `primeng` (3.68:1) |

**Why this is not an agent's call.** Four of the six failing colours are faithful reproductions of
real third-party palettes — One Dark/One Light are the editor themes by name, `primeng`'s
`#3b82f6` is Aura's own primary. Changing them trades fidelity for compliance, and the library's
own `light` theme failing by 0.06 is a different judgement again. Each is *correct for what the
theme is trying to be*; none is a typo.

**What it gates:** `check:contrast` is deliberately **not** wired into `.github/workflows/ci.yml`.
Adding it today would make CI permanently red over a known, tracked, undecided condition, which
teaches everyone to ignore CI. The script's own header says so. Resolving these — by fixing the
colours, or by explicitly accepting them and recording why — is what turns that gate on, and it is
a one-line addition to `ci.yml` at that point.

**This does not block 21.7.0.** The failures predate this release (only `primeng`'s is new, and it
is inherited from the palette it copies); what is new is that the library can now *see* them.
Shipping a checker that finds real problems is the improvement, and finding them is not a reason
to hold the release that found them.

---

## D. Deliberately deferred until after publish

`docs/lab-after-publish.md` carries four sections for 21.7.0, all `gleks-ui-lab`:

1. The removal's prose goes stale (`theming-page.html`, `faq-data.ts` — past tense).
2. `material`/`primeng` become shipped presets; the lab deletes its local copies and imports the
   real ones. **Carries a documented behaviour change** on six components — read that entry before
   starting, so the visible diff reads as the fix landing rather than a regression.
3. `ledger` needs a compare-page entry.
4. The lab's own theming tooling (`theme-starter.css`, the theme generator, the Theming page)
   catches up to the character layer.

**None of these can happen before publish**, and not by choice: the lab resolves
`@guildofgleks/ui` from the published npm package, so it can only document what is actually on the
registry (`CLAUDE.md` rule 3, `agent-workflow.instructions.md`). This is also why `docs/themes.md`
marks iterations 2–5 partial — every one of them has a lab-side half waiting here. That is one
structural blocker, not four separate loose ends.

**After the user publishes:** `npm install` at the repo root first, so `node_modules` holds the
real 21.7.0 rather than a stale copy — then work `lab-after-publish.md` top to bottom, deleting
each entry as it lands.

---

## Verification — current state, and what each command should say

Run from the repo root. Everything below was confirmed green on 2026-08-29 at the current commit,
except where noted.

```bash
npm run check:tokens          # ✅ passes — 1291 tokens, generated artifacts current
npm run check:deprecations    # ✅ passes — 0 tags, 3 CSS namespaces, "Due: 21.7.0 (3)"
npm run check:contrast        # ❌ fails — 8 findings; see section C, expected, not wired to CI
npm run lint                  # ✅ passes — all three projects
npm run format:check          # ✅ passes
npm run test:lib              # ✅ passes — 1059 tests
npm run build:lib             # ✅ passes
npm run build:showcase        # ✅ passes (the bundle-budget warning is pre-existing)
npm run check:release         # ❌ fails — 2 problems, both section A, both correct today
```

**`check:release` failing is the correct state for a version being worked on**, and its two
problems are exactly the two edits in section A. A clean `check:release` before the user has
decided to publish means someone jumped the gun.

`check:contrast` is the one failure that is *expected to keep failing* after the release, until
section C is decided. It is not part of `npm run release`'s gate and does not block anything.

---

## The short version

- **Blocking, user-only:** version bump + heading date (section A). Verified that nothing else
  stands in the way.
- ~~**Worth doing first, agent-able:** README's preset list, and giving the three new presets a
  live `ui-showcase` surface (section B).~~ **Both done, 2026-08-29.**
- **Needs your decision, not blocking:** the six contrast failures, and whether `check:contrast`
  joins CI (section C).
- **After publish, already written down:** everything in `docs/lab-after-publish.md` (section D).
