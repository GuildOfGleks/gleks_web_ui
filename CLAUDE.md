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

## The three rules that bite hardest

1. **Never publish.** Do not bump the version, do not edit `CHANGELOG.md`'s `planned` heading,
   do not run `npm publish` or `npm run release` — not even when asked in a way that seems to
   authorise it. The user cuts every release. See `gleks-ui-library.instructions.md` rule 9.
2. **`npm run build:lab` never exits** even though it succeeds. Every other script finishes in
   under 15 s. Read `running-commands.instructions.md` before concluding something is "slow".
3. **Verify library changes in `ui-showcase` only**, never in `gleks-ui-lab` — the two share one
   root `node_modules`, and the local-build swap must be undone afterwards.

## Current work

`docs/refactor-21.3.0.md` is the live plan for the 21.3.0 pre-public cleanup — iteration status,
what each one covers, and what is deliberately out of scope. Update its status table as you go.
