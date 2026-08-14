# gleks_web_ui — agent entry point

Angular v21 workspace holding the `@guildofgleks/ui` component library and two apps that
consume it.

| Project (CLI name) | Path | What it is |
| --- | --- | --- |
| `@gleks/ui` | `projects/gleks/ui` | the library — published to npm as **`@guildofgleks/ui`** |
| `ui-showcase` | `projects/ui-showcase` | demo/validation app; **the only place to verify library changes live** |
| `gleks-ui-lab` | `projects/gleks-ui-lab` | public documentation site; tracks the **published** package, not local builds |

## Read these before working

The authoritative rules live in `.github/instructions/`. They are written in Copilot's
`applyTo` format, but they apply to **any** agent working here — read the ones matching the
files you are about to touch:

| File | Read it when |
| --- | --- |
| `running-commands.instructions.md` | **always, before running any npm script** — which commands hang, and how to run them |
| `agent-workflow.instructions.md` | always — cross-cutting rules, background-process cleanup |
| `general.instructions.md` | any `.ts` — Angular v21 / TypeScript conventions |
| `gleks-ui-library.instructions.md` | anything under `projects/gleks/ui` — authoring guide, definition of done |
| `api-design.instructions.md` | adding or changing any public API of the library |
| `styling.instructions.md` | any `.scss`/`.css` in the library — the three-layer token contract |
| `typescript.instructions.md` | any `.ts` |
| `ui-showcase.instructions.md` | anything under `projects/ui-showcase` |

Three documents ship **inside the npm package** and count as part of the library, not as notes
about it: `README.md`, `AGENTS.md` and `TOKENS.md` (generated). `CHANGELOG.md` stays in the repo.
`AGENTS.md` is the per-component API reference an agent reads while building an app on the
package — it is the one that goes stale first and without any build failing, so **any change to
an input, output, slot, type, service method or default edits it in the same change.** See
`gleks-ui-library.instructions.md`, definition of done, step 9.

## The three rules that bite hardest

1. **Never publish.** Do not bump the version, do not edit `CHANGELOG.md`'s `planned` heading,
   do not run `npm publish` or `npm run release` — not even when asked in a way that seems to
   authorise it. The user cuts every release. See `gleks-ui-library.instructions.md` rule 11.
2. **The raw `ng build gleks-ui-lab` never exits** even though it succeeds — `npm run build:lab`
   works around this via `scripts/build-lab.mjs` (kills the process once it sees the completion
   marker), so the *script* itself is safe to run. Every other script finishes in under 15 s.
   Read `running-commands.instructions.md` before concluding something is "slow".
3. **A library change touches exactly two projects: the library and `ui-showcase`.** Never
   `gleks-ui-lab` — it tracks the *published* package, so editing it in the same session puts
   its docs ahead of npm and can break its build. Anything the lab will need goes into
   `docs/lab-after-publish.md` as a checklist entry, and gets **deleted from there once it is
   actually done in the lab**. Verification is `ui-showcase`-only too: the two apps share one
   root `node_modules`, and the local-build swap must be undone afterwards. Full rule in
   `agent-workflow.instructions.md`.

## Current work

One live plan, two finished ones. Update the status table in whichever you are working from, as
you go.

- `docs/hardening-21.5.0.md` — the **current** plan: the library measured against itself
  (coverage tooling, token-prefix consistency, the removals 21.5.0 already owes, RTL, thin specs,
  `gog-menu`, version metadata for the docs site). All seven iterations are open — **on hold**
  while the user verifies the already-tagged releases against a private consuming project.
- `docs/consumer-dx-plan.md` — completed: the package as a consumer meets it (onboarding,
  accessibility defaults, native attributes, packaging, icon registry, table outputs/lazy/
  selection, link-flavoured button). Kept for its per-iteration outcomes and its backlog.
- `docs/refactor-21.3.0.md` — the completed 21.3.0 pre-public cleanup (architecture, token
  contract, API consistency). Kept as the record of why those decisions were made.

`docs/lab-versioning.md` holds the recommendation for how the lab should communicate
version-to-version change (version badge, a releases page fed by the package's own changelog,
`since` markers, generated deprecation badges) plus the major-version branch/subdomain approach.
A recommendation, not a decision — nothing in it is implemented.

`docs/lab-after-publish.md` is the deferred backlog for `gleks-ui-lab`. Because the lab tracks
the **published** package, library work never updates it in the same session — anything the lab
will need to say (or currently says wrongly) is recorded there instead, grouped by the release
that unblocks it. Add to it whenever a library change would otherwise tempt you to edit the lab.
