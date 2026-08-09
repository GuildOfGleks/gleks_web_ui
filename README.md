# Gleks Web UI

Angular v21 workspace holding the `@guildofgleks/ui` component library and the apps that
consume it.

| Project (CLI name) | Path | What it is |
| --- | --- | --- |
| `@gleks/ui` | `projects/gleks/ui` | the library — published to npm as [`@guildofgleks/ui`](https://www.npmjs.com/package/@guildofgleks/ui) |
| `ui-showcase` | `projects/ui-showcase` | demo/validation app — the only place to verify local library changes live |
| `gleks-ui-lab` | `projects/gleks-ui-lab` | public documentation site — tracks the **published** package, not local builds |

No CDK, no Material — the library's only runtime dependencies are `@angular/core`,
`@angular/common` and `@angular/forms`. See [`projects/gleks/ui/README.md`](projects/gleks/ui/README.md)
for the library's own docs (features, install, theming).

## Getting started

```bash
npm install
npm run buildLibAndStart   # builds @gleks/ui, then serves ui-showcase at http://localhost:4200/
```

## Common scripts

| Script | What it does |
| --- | --- |
| `npm run build:lib` | build `@gleks/ui` |
| `npm run test:lib` | run the library's unit tests (Vitest) |
| `npm run build:showcase` | build `ui-showcase` |
| `npm start` | serve the root app (`ng serve`) |
| `npm run start:lab` | serve `gleks-ui-lab` |
| `npm run lint` | lint `@gleks/ui` and `ui-showcase` |
| `npm run format` / `format:check` | Prettier over `projects/**` |
| `npm run check:tokens` | validate the design-token contract |

Every script above finishes in under 15 seconds — except `npm run build:lab`, which
completes its work but never exits on its own; see
[`running-commands.instructions.md`](.github/instructions/running-commands.instructions.md)
before running it.

## Working on this repo

Start with [`CLAUDE.md`](CLAUDE.md) — it indexes the authoritative rules in
[`.github/instructions/`](.github/instructions/) (Angular/TypeScript conventions, the
library authoring guide, the styling token contract, API design rules, etc.) and points
to [`docs/refactor-21.3.0.md`](docs/refactor-21.3.0.md), the live plan for the current
pre-public cleanup.

## Building

```bash
ng build
```

Compiles the selected project and stores the build artifacts in `dist/`. By default the
production build optimizes for performance and speed.

## Testing

```bash
ng test
```

Runs unit tests with the [Vitest](https://vitest.dev/) test runner. Angular CLI does not
bundle an end-to-end framework; none is configured in this workspace.

## License

Apache-2.0. See [LICENSE](LICENSE).
