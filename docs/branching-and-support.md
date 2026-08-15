# Branching and support policy

How `@guildofgleks/ui` is maintained across Angular major versions.

**Status:** decided 2026-08-14, **not yet in effect.** Everything below describes what happens
when Angular 22 lands and the repository splits. Until then there is one branch and one release
line.

## The model

Two long-lived branches, one per Angular major:

| Branch   | Angular | Gets                                         | npm dist-tag |
| -------- | ------- | -------------------------------------------- | ------------ |
| `master` | 22      | everything — new components, features, fixes | `latest`     |
| `v21`    | 21      | **bug fixes only**                           | `v21`        |

A third major repeats the pattern: `master` moves to 23, `v22` is cut from it, `v21` reaches
end of life.

### What goes where

- **Bug fixes** — authored on the **oldest supported branch**, then merged forward. Never the
  reverse; see [Direction of merges](#direction-of-merges).
- **New components and features** — `master` only. A consumer on Angular 21 who needs a new
  component upgrades Angular; that is the deal, and it is why the component set is finished
  _before_ the split rather than after.
- **Refactors, renames, deprecation removals** — **before the split, on the 21 line.** See below;
  this is the part that is easy to get backwards.

## Sequencing: what must land before the split

Two things, and the second is the non-obvious one.

**1. The component set.** Whatever a real site needs should exist on the 21 line before it stops
receiving features. The criterion is not "everything most sites need" — that list has no bottom —
but **what unblocks the project the releases are verified against.** That turns an infinite
backlog into a finite one and gets each component battle-tested before it freezes into public API.
`docs/hardening-21.5.0.md`'s backlog lists the candidates; `gog-menu` is first, because the
library already ships `more-horizontal`/`more-vertical` icons and a table built for row actions
with nothing to open.

**2. The breaking cleanups — on 21, not on 22.** Anything that changes existing API belongs on the
old line, so the major carries _only_ the Angular upgrade.

The worked example is the token-prefix rename (`--gog-btn-*` → `--gog-button-*`, 179 tokens,
`hardening-21.5.0.md` iteration 2). Done on 21 with aliases, it is absorbed before the major, and
the upgrade to 22 is just an upgrade. Done on 22, every consumer gets a new Angular **and**
renamed CSS custom properties in the same step — a much harder release to justify, and a much
harder one to debug when someone's theme silently stops applying.

The same applies to the scheduled deprecation removals. If `v21` keeps deprecated API that
`master` has deleted, every bug fix touching those code paths conflicts on the way forward —
and the code with the most shared surface (`shared/dropdown-base.ts`, ~33 KB) is exactly where
fixes land most often.

**Rule of thumb: breaking changes on the old line, the Angular upgrade on the new one.**

## Direction of merges

Fix on `v21` → merge `v21` into `master`. Never fix on `master` and cherry-pick backwards.

The reason is mechanical: `master` diverges continuously as new components land, `v21` barely
moves. Merging from the quiet branch into the busy one keeps conflicts small and rare. Going the
other way, conflicts grow with every release on `master`, and the point comes where backporting
stops happening — not by decision, but by attrition.

If a fix genuinely does not apply to 21 (it touches a component that only exists on `master`),
it is simply a `master` commit. Nothing to merge.

## npm dist-tags

**This is the detail that is cheap to set up and expensive to fix late.**

When `22.0.0` publishes, npm points `latest` at it. A developer on Angular 21 then runs
`npm i @guildofgleks/ui`, gets a package whose peer range is `^22.0.0`, and hits `ERESOLVE` with
no explanation of what they should have done.

The fix is one flag, and it must be in place from the **first** publish after the split:

```bash
# on the v21 branch
npm publish dist/gleks/ui --access public --tag v21
```

Consumers on Angular 21 then install with:

```bash
npm i @guildofgleks/ui@v21
```

**Bake it into the branch's own release script.** `package.json`'s `release` script currently
reads:

```
"release": "npm run build:lib && npm publish dist/gleks/ui --access public"
```

On `v21` that script must carry `--tag v21`. Because the script lives _in the branch_, changing
it there makes the right thing automatic and the wrong thing impossible to do by habit — which
matters more than remembering a flag on a release you cut twice a year.

If a v21 release ever does go out as `latest` by mistake, repoint it rather than unpublishing:

```bash
npm dist-tag add @guildofgleks/ui@22.x.y latest
npm dist-tag add @guildofgleks/ui@21.x.y v21
```

## Version numbering

The library major tracks the Angular major — `21.x.y` for Angular 21, `22.x.y` for Angular 22.
This is the same convention Angular Material uses, and it means the compatible version is
readable at a glance.

After the split the 21 line takes **patch bumps only** (`21.5.1`, `21.5.2`, …). A minor on that
line would contradict "fixes only" and should be treated as a sign that a feature slipped in.

Pre-1.0 the changelog allows breaking changes in minors; that stays true for `master`, and is
another reason to spend those minors on the 21 line _before_ the split rather than after.

## End of life for the 21 line

**State a date in the README from day one**, even an approximate one:

> The 21.x line receives bug fixes until `<date>`. New components and features are 22.x only.

An open-ended promise of support is how a solo-maintained project acquires a second full-time
branch. A date converts it into a finite task, and it can always be extended — extending is easy,
retracting is not.

Current intent, to be revisited if a second maintainer joins: **fixes only, roughly six months
past the 22.0.0 release.** With more than one maintainer, a year is realistic.

The cheaper alternative, worth an honest second look before committing: **freeze 21.x entirely**
at its last release, with security fixes only. For a young library whose users are mostly its own
author's projects, a second maintained branch may be work done for the principle rather than for
anyone.

## The documentation site

`gleks-ui-lab` splits with the code, one deployment per major on its own subdomain.
`.github/workflows/deploy-lab.yml` is `workflow_dispatch`-triggered with `tag` and `port` inputs,
so a second deployment is another invocation rather than new machinery; the `v21` branch keeps its
existing workflow, `master` gets the updated one. Server-side nginx and Docker routing is
configured separately.

Two things the split needs beyond the deploy:

- **Cross-links on both sites.** Without them the old site becomes a trap for search traffic —
  people land on documentation for a version they are not using and never learn there is a newer
  one.
- **A freeze banner on the v21 site**, from the moment feature work stops:

  > Documenting the 21.x line, which receives bug fixes only. Current documentation: `<link>`.

  A frozen site that says so is useful. A stale site that does not is worse than no site, and
  the failure mode is silent — nothing breaks, readers simply get wrong answers. Decide up front
  whether the v21 site is rebuilt on each patch or genuinely frozen at the last 21.x docs; either
  is fine, but it must be one of them on purpose.

- **SEO:** point `rel=canonical` at the current major, or `noindex` the frozen site. Otherwise the
  older documentation competes with the newer for the same queries and often wins, because it has
  been indexed longer.

## Split-day checklist

1. 21 line is feature-complete and the cleanups from `hardening-21.5.0.md` have shipped.
2. Cut `v21` from the last 21.x commit; `master` continues to 22.
3. On `v21`: add `--tag v21` to the `release` script.
4. On `master`: bump peer ranges to `^22.0.0`, run `ng update`, expect work in
   `shared/dropdown-overlay.ts` / `tooltip-overlay.ts` and the Vitest builder config.
5. Publish `22.0.0` as `latest`; verify `npm dist-tag ls @guildofgleks/ui` shows both tags.
6. README: support matrix, the `@v21` install line, the EOL date.
7. Lab: deploy `master`'s site, add the freeze banner and cross-links to the v21 site, configure
   canonical/noindex.
8. `CLAUDE.md` and the instruction files: state which branch is which, so the next session (human
   or agent) does not have to infer it.

## Open questions

- **Is the v21 lab rebuilt on patches, or frozen at the last 21.x docs?** Frozen is less work and
  honest; rebuilt is more accurate for the handful of patch-level doc changes. Pick one and put it
  in the banner.
- **Does `master` keep breaking changes in minors after 22.0.0?** Pre-1.0 the changelog says yes.
  If 22.x is meant to be the first line people build on seriously, that may be the moment to
  declare 1.0 semantics instead — a separate decision, but one this split naturally raises.
