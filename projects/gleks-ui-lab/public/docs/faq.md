# FAQ

## General

### Is this ready for production?

The library hasn't reached 1.0 yet, which under [semantic versioning](https://semver.org/)
means a breaking change can land in a minor release, not just a major one — every one that
does is called out explicitly in the [Changelog](https://github.com/Balthazariy/gleks_web_ui/blob/master/projects/gleks/ui/CHANGELOG.md),
with a migration note. In practice that's been rare: most releases so far have been additive
(new components, new inputs). Pin an exact version or a `~21.x.x` range if you'd rather opt
into minors by hand and read the changelog first.

### Which Angular versions does it support?

Angular 21 and newer only (`peerDependencies` require `^21.2.0` for `@angular/core`,
`@angular/common` and `@angular/forms`). The library was built after standalone components,
signals and `OnPush`-by-default became the normal way to write Angular, so there was never a
reason to also support the NgModule-era API surface older libraries still carry. If your app
is on an older Angular version, upgrade first — there's no compatibility build.

### Does it depend on Angular CDK or Material?

No. The only runtime dependency is `tslib`, the standard helper library almost every compiled
TypeScript package ships. Overlay positioning, focus trapping and roving-focus keyboard
navigation are all implemented directly in the library rather than pulled in from CDK — see
[the full technical comparison](/general/compare-full) for exactly what that saves in bundle
weight.

### Can I import just a few components, or does it pull in everything?

Just what you import. Every component is standalone and the package sets `"sideEffects":
false`, so a production bundler tree-shakes out anything you don't reference — importing
`ButtonComponent` alone doesn't pull in the other 29 components.

### Does it support server-side rendering (SSR)?

Yes — this documentation site itself is an SSR Angular app built against the published
package. Anything that touches `window`, `document` or measures real layout (the scroll
component's thumb sizing, the theme generator's live preview) is guarded with Angular's
`isPlatformBrowser`/`afterNextRender`, so it renders safely on the server and picks up the
real behavior once hydrated on the client.

### What browsers does it support?

Whatever Angular's own ["Baseline" browser policy](https://angular.dev/reference/versions)
covers for the Angular major you're on — recent evergreen Chrome, Edge, Firefox and Safari.
The library doesn't layer a separate, older browser floor on top of that.

## Theming

### How is this different from just restyling Material or PrimeNG?

Both are excellent libraries, but restyling either one means fighting a Sass mixin system or
a JS preset engine to change how a component looks. Here, every visual value — color,
spacing, radius, shadow, timing — is a plain CSS custom property (`--gog-*`), layered
foundation → component → instance. Overriding one is just CSS: no preprocessor, no theming
API, no build step. See [Theming](/general/theming) for the full layering model, or the
[full comparison](/general/compare-full) for the numbers behind the claim.

### Can I use this alongside Material or PrimeNG in the same app?

Yes — every token this library reads is namespaced under `--gog-*`, so it can't collide with
Material's `--mat-*` tokens or PrimeNG's own variables. Nothing here reaches into global
selectors either (no bare `button`/`input` styling), so the two can coexist without one
restyling the other.

## Versioning & Changes

### What's the versioning policy?

[Semantic versioning](https://semver.org/), with the pre-1.0 caveat above. Concretely:

- **Patch** (`21.3.0` → `21.3.1`) — bug fixes only, no new inputs/outputs, nothing to change
  in your code.
- **Minor** (`21.3.0` → `21.4.0`) — new components, new inputs/outputs, or (pre-1.0) an
  occasional breaking change if it's clearly called out in the Changelog with a migration
  path.
- **Major** — reserved for changes big enough to warrant one even post-1.0.

### Why do some inputs get deprecated instead of just changed?

When an input's shape needs to change, the old one is marked `@deprecated` with the version
it was deprecated in and the version it's actually removed in (usually two minors later),
plus what to use instead — so upgrading across one release never silently breaks a build, and
the compiler flags every call site that needs attention before removal actually lands. The
component doc pages call these out explicitly wherever they apply.

## Contributing & Support

### I found a bug / want a feature — where do I go?

Open an issue on [GitHub](https://github.com/Balthazariy/gleks_web_ui/issues). Include the
library version, a minimal repro if you can, and — for a visual bug — which theme you were
on.

### What license is it under?

[Apache License 2.0](https://github.com/Balthazariy/gleks_web_ui/blob/master/LICENSE). Free
to use, modify and ship in commercial projects, with an explicit patent grant from every
contributor to every user — the thing MIT doesn't spell out.

### How can I support the project?

The library is, and stays, free — no paid tier, no feature gate. If it's saved you real time
and you'd like to say thanks, a GitHub star and spreading the word both help more than they
sound like they would for a project this size.
