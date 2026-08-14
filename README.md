# Gleks Web UI

Angular v21 monorepo for **[`@guildofgleks/ui`](https://www.npmjs.com/package/@guildofgleks/ui)** —
a component library with no CDK and no Material, and the two apps that consume it.

| Project (CLI name) | Path | What it is |
| --- | --- | --- |
| `@gleks/ui` | `projects/gleks/ui` | the library — published to npm as `@guildofgleks/ui` |
| `ui-showcase` | `projects/ui-showcase` | demo app, and the only place local library changes are verified |
| `gleks-ui-lab` | `projects/gleks-ui-lab` | public documentation site — tracks the **published** package, never a local build |

Looking for how to *use* the library? That is
[`projects/gleks/ui/README.md`](projects/gleks/ui/README.md) — install, setup, theming — and
[`CHANGELOG.md`](projects/gleks/ui/CHANGELOG.md) for what changed.

## Quick start

```bash
npm install
npm run buildLibAndStart   # builds the library, then serves ui-showcase on :4200
```

`ui-showcase` resolves `@guildofgleks/ui` from `dist/gleks/ui`, so a library change shows up
after `npm run build:lib` and a dev-server restart. Do **not** copy builds into `node_modules` —
`gleks-ui-lab` shares that folder and must keep resolving the published package.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run build:lib` | build the library into `dist/gleks/ui` |
| `npm run test:lib` | the library's unit tests (Vitest) |
| `npm run lint` | lint `@gleks/ui` and `ui-showcase` |
| `npm run format` · `format:check` | Prettier over `projects/**` |
| `npm run check:tokens` | verify the design-token contract and the generated token files |
| `npm run generate:tokens` | regenerate `TOKENS.md` and `token-names.ts` after editing `theme.css` |
| `npm run buildLibAndStart` | build the library, then serve `ui-showcase` |
| `npm run build:showcase` | build `ui-showcase` |
| `npm run start:lab` · `build:lab` | serve / build the documentation site |

Everything finishes in under 15 seconds, with one exception: the raw `ng build gleks-ui-lab`
completes its work and then never exits. `npm run build:lab` wraps it and is safe to run — see
[`running-commands.instructions.md`](.github/instructions/running-commands.instructions.md)
before concluding that something is stuck.

There is no `ng serve` default project — name one (`ng serve ui-showcase`) or use the scripts
above.

## Working on the library

Read [`CLAUDE.md`](CLAUDE.md) first. It indexes the authoritative rules in
[`.github/instructions/`](.github/instructions/) — Angular and TypeScript conventions, the
library authoring guide and its definition of done, the three-layer token contract, and the API
design rules — and points at the current plan in [`docs/`](docs/).

Three rules that catch people out:

- **A library change touches exactly two projects**: the library and `ui-showcase`. Anything
  `gleks-ui-lab` will need is recorded in
  [`docs/lab-after-publish.md`](docs/lab-after-publish.md) instead, and deleted from there once
  it is done.
- **The token contract is enforced.** No literal fallbacks in component stylesheets, no token a
  component reads that `theme.css` does not declare. `npm run check:tokens` fails the build on
  either.
- **Publishing is the maintainer's step.** Tags are pushed ahead of the release on purpose: every
  version is verified against a real consuming project first, and the version bump happens at
  publish time.

## Documentation

| | |
| --- | --- |
| [`projects/gleks/ui/README.md`](projects/gleks/ui/README.md) | using the library — install, setup, theming |
| [`projects/gleks/ui/AGENTS.md`](projects/gleks/ui/AGENTS.md) | per-component API reference (inputs, outputs, slots, defaults) |
| [`projects/gleks/ui/TOKENS.md`](projects/gleks/ui/TOKENS.md) | every `--gog-*` token, generated from `theme.css` |
| [`projects/gleks/ui/CHANGELOG.md`](projects/gleks/ui/CHANGELOG.md) | release history |
| [`docs/`](docs/) | working plans and their outcomes |

## License

Apache-2.0 — see [LICENSE](LICENSE). Built-in icons are [Lucide](https://lucide.dev) (ISC).
