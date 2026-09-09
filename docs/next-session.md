# Handoff — closing 21.11.0

**Written 2026-09-09**, replacing the `d7-measure-and-overlay-clamp` handoff, which had been read
and whose branch is merged (`b7c37d8`). Delete this file once its contents are done or moved.

**What this is.** 21.11.0 is built and merged to `master`; its changelog heading still reads
`planned`, and dating it is the user's to do. This is the list of everything that has to be true
before that heading can be dated — not the release itself.

**Scope, decided 2026-09-09:** closing 21.11.0 only. D5 (the elevation ladder) is deliberately
out; so is the colour/OKLCH half of `docs/backlog.md`, the two geometry decisions that add public
tokens (the four dropdowns' panel radii, the chip avatar's drift), and everything in
`docs/feedback-triage.md`'s 21.8.0 section. Each of those is its own release with its own plan.
See "Out of scope, and why" at the bottom — that list is part of the plan, not an afterthought.

---

## The state this starts from

- `master` is clean at `b7c37d8`. Every check is green, `test:lib` is 1116 tests, all five
  geometry laws plus D7 are gated by `npm run check:geometry` (five scripts) and it is a CI step.
- `check:release` fails, **correctly**: `projects/gleks/ui/package.json` says 21.10.0 and the
  changelog's top heading says `planned`. Do not "fix" it. Rule 1 in `CLAUDE.md`.
- `docs/backlog.md`'s Defects section holds exactly one entry that is a bug in shipped code: the
  confirmation dialog's dead utility classes. Everything else there is a decision, a survey or a
  gap.
- `docs/lab-after-publish.md` is full, and stays full: the lab tracks npm.

So the payload below is one defect, its neighbour found while writing this plan, one check that
makes the class of bug fail a build instead of waiting a month, and the verification 21.11.0 owes.

---

## Phase 1 — the two dialog titles read the type scale

### The defect, restated with the numbers

`confirmation-dialog.component.html:6,9` put `class="confirm-dialog__title heading-md"` on the
title and `class="confirm-dialog__description body-sm"` on the description. **Neither class has a
CSS rule anywhere in the library** — not in `styles/*.css`, not in any component `.scss`.
Confirmed live in `ui-showcase` via `getComputedStyle`: the description renders at **16px**, the
browser's inherited default, not the `--gog-text-sm` (14px) its name promises; the title at
**18.72px**, the browser's default `<h3>` size, not any step of the scale. A theme that moves
`--gog-text-*` or `--gog-font-body` moves nothing here, because nothing here reads either.

### The neighbour, found while writing this plan

`dialog.component.scss:55`'s `.gog-dialog__title` sets `margin`, `color` and `font-family` and
**no font-size and no line-height either**. Its element is an `<h2>` (`dialog.component.html:33`),
so it renders at the browser's default 24px bold. Same defect class, one component over, without
a lying class name to give it away — and it is why this phase is two commits rather than one.

These two are the only `<h1>`–`<h6>` in the entire library (verified: `grep -rn "<h[1-6]"` over
`projects/gleks/ui/src/lib/**/*.html` returns exactly these two plus a comment in
`panel.component.html`). There is no third instance to find.

### Commit 1 — `gog-dialog`'s own title states its size

Zero visual change, and that is the point of doing it first: today's rendered 24px **is**
`--gog-text-xl` (1.5rem) exactly, so this commit turns an accident into a declaration and can be
verified by a `getComputedStyle` that does not move.

1. `theme.css`, in the Dialog block beside `--gog-dialog-close-font-size` (which is the precedent
   to copy, line ~1176):

   ```css
   --gog-dialog-title-font-size: var(--gog-text-xl);
   --gog-dialog-title-line-height: var(--gog-line-height-snug);
   ```

   `snug` (1.3) is law 4's `heading` role. Do not invent a value; `docs/component-geometry.md`'s
   D4 table maps role to step and the check reads it.

2. `dialog.component.scss`, `.gog-dialog__title`: add `font-size` and `line-height` reading those
   two tokens.

3. `npm run generate:tokens` — it rewrites both `projects/gleks/ui/TOKENS.md` and
   `projects/gleks/ui/src/lib/shared/token-names.ts`, and the second is a **public type**. Never
   hand-edit either.

4. `CHANGELOG.md`, under the existing `[21.11.0] - planned` heading. Do not touch the heading.

### Commit 2 — the confirmation dialog's title and description

1. `confirmation-dialog.component.html`: drop `heading-md` and `body-sm`. The BEM classes stay.

2. `theme.css`, in the Confirmation dialog block (after `--gog-confirmation-dialog-min-width`,
   before the long `--gog-confirmation-dialog-max-width` comment):

   ```css
   --gog-confirmation-dialog-title-font-size: var(--gog-text-lg);
   --gog-confirmation-dialog-title-line-height: var(--gog-line-height-snug);
   --gog-confirmation-dialog-description-font-size: var(--gog-text-sm);
   --gog-confirmation-dialog-description-line-height: var(--gog-line-height-relaxed);
   ```

3. `confirmation-dialog.component.scss`: `.confirm-dialog__title` and
   `.confirm-dialog__description` each get `font-size` and `line-height` reading their token.

4. `generate:tokens` again, and a `CHANGELOG.md` bullet.

**The one judgement call in this phase, and it is already made: the title takes `lg` (18px), not
`md` (16px).** The dead class said `heading-md`, and the temptation is to read that as a statement
of intent. It is not evidence of anything — the class never existed, so nobody ever saw what it
would have done. What a reader sees today is 18.72px, and `--gog-text-lg` (1.125rem = 18px) is the
nearest step to it, so the fix lands as "the size is now stated" rather than as an unannounced
shrink of every confirmation dialog in every consumer app. `md` is defensible on the name; `lg` is
defensible on what ships. If you disagree, say so in the commit message and change it there —
what is **not** acceptable is picking one silently.

The description does move: 16px to 14px, a deliberate 2px shrink, because 14px is what a muted
secondary line takes everywhere else in the library and `--gog-muted-text-color` is already on it.
That is a visible change and it is the reason this defect was filed for its own commit rather than
fixed inside an unrelated branch.

### Commit 3 — re-check the `ch` cap, and correct the prose that predicted it wrong

`--gog-confirmation-dialog-max-width: 51ch` was computed against the description's *rendered*
16px, and `survey-measure.mjs`'s own entry for it predicts that fixing the class "would then read
a smaller token and the text would only get roomier". **That prediction is wrong, and the reason
it is wrong is the trap this branch has to avoid repeating:** a `ch` cap resolves against the font
of the element carrying `max-width` — `.confirm-dialog` — not against a descendant's. Commit 2
changes the *description's* size, not `.confirm-dialog`'s, so the cap does not move at all: still
51ch × 16px ≈ 440px.

This is the same bug the toast hit in the previous branch (`docs/component-geometry.md`, "A fourth
finding"), which is why it is called out here rather than left to be rediscovered.

What actually changes is the **measure** — the number of characters of the description that fit on
a line. At `survey-measure.mjs`'s own `CH_PER_EM = 0.5391`, 51ch on a 16px element is ≈ 440px, and
440px of 14px description is ≈ **58ch**, against L9's 45–75 band. In band, so **no token value
changes.** (L9's original table said ≈63ch for this cap; that used the 0.5em approximation the
plan was written with, before the survey measured the real figure. Re-run `npm run survey:measure`
and quote what it prints rather than either number here.) What changes is three pieces of prose that now say something false:

1. `theme.css`'s comment above `--gog-confirmation-dialog-max-width` — it cites "the description's
   actual rendered 16px (it inherits, rather than reading a token; see the defect filed in
   docs/backlog.md)". The defect is fixed; the 16px is now `.confirm-dialog`'s inherited size, and
   the comment has to say *that*, because it is the element the cap resolves on.
2. `scripts/survey-measure.mjs` — the `reason` string on the confirmation-dialog entry (its whole
   text is about the unfixed defect) and the comment on `LIVE_MEASURED_PX`.
3. `LIVE_MEASURED_PX` stays `16` and `fontToken` stays `null`. **Do not point `fontToken` at the
   new `--gog-confirmation-dialog-description-font-size`.** That is the obvious-looking edit and it
   is exactly the toast bug: the survey would then measure the cap against a font that is not on
   the element the cap is declared on. Write the reason for `null` into the entry so the next
   reader does not make the edit either.

**Verify it live rather than trusting the arithmetic above.** Open the confirmation dialog in
`ui-showcase` and read `getComputedStyle` on `.confirm-dialog` for `font-size` and `max-width`,
and on `.confirm-dialog__description` for `font-size` and `line-height`. If `.confirm-dialog`'s
own font-size is **not** 16px after the fix, the whole paragraph above is wrong and the cap needs
recomputing — say so and stop rather than adjusting the number to match.

### What the checks will do, and what they will not

- `check:typography` **rule C** fires on a block that declares a font size and no leading. Adding
  a `-font-size` token without its `-line-height` sibling fails the build; the pairs above are why
  each is a pair. `parseTokenName` splits `--gog-confirmation-dialog-title-font-size` into block
  `confirmation-dialog-title`, so the leading token must be spelled
  `--gog-confirmation-dialog-title-line-height` exactly, or the two land in different blocks and
  rule C reports the one it cannot pair.
- `check:typography` **rule F** requires a declared leading to actually be *read* by a stylesheet.
  A token added in step 2 and not wired up in step 3 is inert, and the check now says so — this is
  the finding that made rule F exist (35 inert tokens in 21.11.0).
- `check-tokens` **rule G** refuses a literal that restates a scale step. Every value above reads
  a `var()`, so it has nothing to catch here; it will catch you if you write `18px`.
- `check:measure` reads `theme.css`'s `*-max-width` family and will not notice any of this.
- **`check:theme-starter` is unaffected and must stay that way.** `generate-theme-starter.mjs`
  reads `node_modules/@guildofgleks/ui/styles/theme.css` — the *published* 21.10.0, not the
  workspace. **Do not run `npm run generate:theme-starter`**: it writes into
  `projects/gleks-ui-lab/public/docs/styles/`, which is the lab, which this branch never touches.
  `docs/lab-after-publish.md` already carries that regeneration as a post-publish step.

---

## Phase 2 — a library template's classes are `gog-`-prefixed

**Why this is in scope and the general dead-class check is not.** The project's own pattern is
that a defect gets a check the same day so the next instance fails a build instead of waiting a
month (`check-tokens` rule F is the precedent). The obvious check — "every class in a library
template has a CSS rule" — was measured while writing this plan and is **not** the one to build:
50 of the library's 398 template classes deliberately have no rule, because they are state and
behaviour hooks (`gog-scroll--dragging`, `gog-autocomplete--open`, `gog-datepicker--floated`, …).
A check that opens with a 50-entry exception list is not documentation, it is a threshold.

The cheap, precise version is the prefix. Measured on `master` today, the library's templates
carry exactly **three** classes that are not `gog-`-prefixed and not the `confirm-dialog*` family:
`heading-md`, `body-sm` and `slide-left`. Two of them are the defect phase 1 removes. That is a
check with one exception entry, not fifty.

### Commit 4 — `check:class-names`

`scripts/check-class-names.mjs`, following the shape every check in this repo has:

- Walks `projects/gleks/ui/src/lib/**/*.html`, collecting static `class="…"` tokens and
  `[class.foo]` bindings. Skip any `class` attribute containing an interpolation — a class that is
  computed is out of this rule's reach, and pretending otherwise is a check that lies about what
  it reads (`survey:measure`'s vacuous `\bvw\b` self-check is the counterexample to avoid).
- Fails on any class not matching `/^gog-/`, with the file and line.
- Carries an exception `Map` of class name to **reason**, not a regex loosened until it passes.
  On day one it holds the `confirm-dialog*` family and `slide-left`, both with the same reason:
  legacy unprefixed names on shipped components, painted and working, where a rename is a
  consumer-visible change to a class a `::ng-deep` may be targeting — a candidate for the next
  major, in the same way `--gog-skeleton-line-height-*` is (`docs/component-geometry.md`, D4(d)).
- **Red-test it before wiring it in.** Add a throwaway `class="not-prefixed"` to any library
  template, confirm the check fails and names the file and line, then remove it. A check that has
  never failed has never been shown to check anything — this branch's predecessor shipped two that
  had not been.

Then `package.json` gains `"check:class-names"`, and it joins `.github/workflows/ci.yml` as a step
**only once it is green**, next to `check:logical-properties`. Green-then-CI is the project's rule
and the reason is in `check-contrast.mjs`'s header: a permanently red step over a known condition
teaches everyone to ignore CI.

**Stop condition, and it is a real one.** If the exception list needs more than about five
entries, the convention it claims to enforce is not a convention. Stop, write what you found into
`docs/backlog.md`, and drop this phase — phases 1 and 3 close 21.11.0 without it.

---

## Phase 3 — the verification 21.11.0 owes

### The 360px check the previous branch could not do

D7's viewport clamp (`min(<cap>, calc(100vw - <margin> * 2))` on tooltip, menu and toast) was
verified structurally by `check:measure` and arithmetically by hand, **but never by actually
narrowing a browser** — `resize_window` did not change `window.innerWidth` in that session's
sandbox. The handoff flagged it as worth a real check before the release ships.

Do it in `ui-showcase` at a genuine 360px viewport: open the tooltip, menu and toast pages, and
confirm each overlay's rendered width is the clamp's branch (viewport minus twice its margin
token) rather than its `ch` cap, and that nothing overflows the document horizontally
(`document.documentElement.scrollWidth === document.documentElement.clientWidth`). Also confirm
the confirmation dialog, which deliberately has **no** clamp, still fits — its width there is
`0.9 × 100vw − 40px`, which is the whole argument for leaving the clamp off it.

If the sandbox cannot narrow the viewport either, say so plainly in the handoff and leave it for
the user's own browser. **Do not report it as verified.** Recording an unverified half honestly is
what the previous branch did and it is why this step exists at all.

### The rest of the gate

Run the full CI list, in this order, at the start of the branch and again at the end. Every one of
these finishes in under 15 seconds except the last three; none of them hangs. `build:lab` is not
in this list and must not be run — the lab is untouched.

```
npm run lint
npm run format:check
npm run check:tokens
npm run check:deprecations
npm run check:geometry
npm run check:class-names      # phase 2, if it shipped
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

`npm run check:release` **must still fail** at the end, naming the version/heading mismatch. If it
passes, someone bumped the version or dated the heading, which is the one thing this branch may
not do.

### The live look, because no check can see it

Open the dialog page in `ui-showcase` and look at both dialogs at `--gog-density: 1` and `0.85`,
on a light theme and a dark one:

- the plain dialog's `<h2>` title should look **identical** to before (24px is 24px);
- the confirmation dialog's title should look essentially unchanged (18.72px → 18px);
- its description should be visibly one step smaller and should still sit comfortably inside the
  panel rather than reflowing into a column.

Record the `getComputedStyle` numbers in the handoff. `verify-in-a-real-browser` is in this
project's memory for a reason: every defect on that backlog was invisible to 1116 green tests.

---

## Phase 4 — the paperwork, and it is not optional

### Commit 5 — the docs the payload changes

1. **`docs/backlog.md`** — delete the confirmation-dialog defect entry. Deleted, not struck
   through and not moved to a "done" section; `lab-after-publish.md`'s header says why a checklist
   that keeps its corpses stops being trusted. If phase 2 shipped, one sentence in its place is
   fair: the class of bug is gated now.
2. **`docs/lab-after-publish.md`**, under the existing `## 21.11.0` section — a new entry. The
   lab's dialog page renders the **published** package, so after 21.11.0 is on npm its
   confirmation-dialog example will change size, and any prose on that page that describes the
   dialog's text needs a read. Say which two sizes moved and which did not, so whoever picks it up
   does not have to re-derive it. If phase 2 shipped, nothing lab-side follows from it.
3. **`AGENTS.md`** — check, do not assume. It documents the token *prefix* family
   (`--gog-confirmation-dialog-*`) rather than enumerating tokens, so it probably needs no edit;
   `TOKENS.md` is generated and already covered by `generate:tokens`. But
   `gleks-ui-library.instructions.md`'s definition of done, step 10, is explicit that AGENTS.md is
   the file that goes stale without any build failing — so open it and confirm, and record in the
   commit message that you did.
4. **`CHANGELOG.md`** — the bullets from phases 1 and 2, under the existing `[21.11.0] - planned`
   heading. Written for a consumer diffing two versions: the description of every confirmation
   dialog gets 2px smaller, and both dialog titles now follow a theme's type scale where they
   previously ignored it.

### Commit 6 — the handoff

Rewrite this file as what actually happened: what shipped, what was verified and how, what the
360px check found (or that it could not be done), and anything a reader of the next branch needs.
Then the branch is done.

---

## The branch, and how it gets reviewed

**Branch `confirmation-dialog-type-scale`, cut from `master` at `b7c37d8`.** Not the lab. Not the
version. Not the changelog heading.

- **One component per commit**, and a rule change is its own commit before the component that
  needs it. This is `docs/component-geometry.md`'s Part 4 protocol and it held over 51 commits.
- **No public API change** — no new input, output or service method. New CSS tokens are not public
  API in that sense (they are the theming contract and `TOKENS.md` regenerates), but a new
  *component input* would need its own plan.
- **No colour change.** Colour is `check:contrast`'s and the OKLCH work's territory; a colour edit
  inside this diff makes both unreadable.
- Push the branch before handing it back. The previous one was reviewed from a different session
  and had to be found locally.

**Then: review, then merge, preserving the branch's history** — a merge commit, not a squash and
not a rebase, the way `b7c37d8` merged its predecessor. The review is a real pass over the finished
branch, not a formality: the last one found five things the implementation had not, four of them in
work that branch itself added, and two of those were the same mistake twice — a claim about the
whole library checked against a part of it. Read that section of the previous handoff (in
`git show 816533e`) before starting the review.

---

## Out of scope, and why each

- **D5, the elevation ladder** (`docs/component-geometry.md`, L10 and D5 — the last open decision
  in that plan). 47 shadow tokens with no scale of any kind, and a constraint that has to survive:
  `bevel` and `terminal` reject soft shadows on purpose. It needs its own survey before it needs
  its own decision, and D0 already closed on the record that geometry shipped as one minor and
  elevation is the next one. Putting it here would make 21.11.0 the large release D0 declined.
- **The colour half of `docs/backlog.md`** — WCAG's unmeasured reach (36 border-colour, 6
  focus-ring and 31 shadow tokens), the missing OKLCH half, and the solver. Colour and geometry
  share a philosophy, not a script.
- **The two geometry leftovers that add public tokens** — the four dropdowns carrying two
  panel-radius answers and three panel interiors, and the chip avatar's 1.27→1.56 drift. Both are
  decisions, each worth a session, and neither is a bug a consumer is hitting.
- **`docs/feedback-triage.md`'s 21.8.0 section** — input masking (which needs a written plan
  first) and the whole-row table click. New public API, so each gets its own plan.
- **`gleks-ui-lab`** — everything. It tracks npm.
- **Cutting the release.** The version bump and the changelog date are the user's, always.
