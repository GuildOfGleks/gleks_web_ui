import { slugify } from '../../shared/markdown/markdown-renderer';

/**
 * The FAQ's content, previously `public/docs/faq.md`.
 *
 * Answers are still **markdown strings**, rendered by `app-markdown` exactly as the file was —
 * links, tables, code blocks and the `since` chips all keep working, and writing an answer is
 * still writing prose rather than markup. What changed is the container: each question is now a
 * `gog-collapsible` instead of an `h3`.
 *
 * Ids come from the same `slugify` the markdown renderer uses for headings, so every anchor that
 * pointed at a question in the old page still resolves — `/general/faq#whats-deprecated-right-now-and-when-does-it-go`
 * is linked from the first answer on this very page.
 */
export interface FaqItem {
  /** Anchor id — derived from the question, never written by hand. */
  readonly id: string;
  readonly question: string;
  /** Markdown. */
  readonly answer: string;
}

export interface FaqSection {
  readonly id: string;
  readonly title: string;
  readonly items: readonly FaqItem[];
}

const item = (question: string, answer: string): FaqItem => ({
  id: slugify(question),
  question,
  answer: answer.trim(),
});

const section = (title: string, items: readonly FaqItem[]): FaqSection => ({
  id: slugify(title),
  title,
  items,
});

export const FAQ_SECTIONS: readonly FaqSection[] = [
  section('General', [
    item(
      'Is this ready for production?',
      `
The library hasn't reached 1.0 yet, which under [semantic versioning](https://semver.org/)
means a breaking change can land in a minor release, not just a major one — every one that
does is called out explicitly in the [Changelog](https://github.com/GuildOfGleks/gleks_web_ui/blob/master/projects/gleks/ui/CHANGELOG.md),
with a migration note. In practice that's been rare: every release so far has been additive
(new components, new inputs), and the first one that removes anything is 21.5.0 — see
[what's deprecated right now](/general/faq#whats-deprecated-right-now-and-when-does-it-go),
which lists all of it with the replacement. Pin an exact version or a \`~21.x.x\` range if you'd
rather opt into minors by hand and read the changelog first.
`,
    ),
    item(
      'Which Angular versions does it support?',
      `
Angular 21 and newer only (\`peerDependencies\` require \`^21.2.0\` for \`@angular/core\`,
\`@angular/common\`, \`@angular/forms\` and \`@angular/platform-browser\`). The library was built
after standalone components, signals and \`OnPush\`-by-default became the normal way to write
Angular, so there was never a reason to also support the NgModule-era API surface older
libraries still carry. If your app is on an older Angular version, upgrade first — there's no
compatibility build.
`,
    ),
    item(
      'Does it depend on Angular CDK or Material?',
      `
No. The only runtime dependency is \`tslib\`, the standard helper library almost every compiled
TypeScript package ships. Overlay positioning, focus trapping and roving-focus keyboard
navigation are all implemented directly in the library rather than pulled in from CDK — see
[the full technical comparison](/general/compare-full) for exactly what that saves in bundle
weight.
`,
    ),
    item(
      'Can I import just a few components, or does it pull in everything?',
      `
Just what you import. Every component is standalone and the package sets \`"sideEffects":
false\`, so a production bundler tree-shakes out anything you don't reference — importing
\`ButtonComponent\` alone doesn't pull in the other 29 components.

One structural difference from Material and PrimeNG worth knowing: this package has a **single
entry point**. There is no \`@guildofgleks/ui/button\` to import from — everything comes from
\`@guildofgleks/ui\`, and unused symbols are removed by the bundler rather than never being
imported in the first place. In practice that produces the same bundle for a normal app; it
matters only if your build pipeline reasons about package subpaths.
`,
    ),
    item(
      'Does it work with reactive forms?',
      `
Yes, and with template-driven ones. Every control implements \`ControlValueAccessor\` —
input field, textarea, select, multiselect, autocomplete, checkbox, radio group, toggle,
slider, datepicker and the button-toggle group — so \`[formControl]\`, \`formControlName\` and
\`[(ngModel)]\` all work, along with \`disabled\` state, \`touched\`/\`dirty\` and validators.

\`\`\`html
<gog-inputfield
  label="Email"
  formControlName="email"
  errorMessage="A valid email is required"
  errorDisplay="auto"
/>
\`\`\`

\`errorDisplay="auto"\` is the part worth knowing: with a form control attached, the field shows
the message once the control is **touched and invalid**, so you supply the text and not the
timing. The default is \`'manual'\`, where the message shows for as long as \`errorMessage\` is
non-empty and you decide when to clear it. Set the default for a whole app with
\`GOG_CONFIG.control.errorDisplay\`.
`,
    ),
    item(
      'Does it work in a zoneless app?',
      `
Yes. There is **no \`NgZone\` reference anywhere in the published package** — every component is
signal-based and \`OnPush\`, and state changes are pushed through signals rather than discovered
by a zone patching the runtime. Nothing here needs \`zone.js\` to be loaded, so the library
behaves the same whether your app is zoneless or still zone-based.
`,
    ),
    item(
      'Does it pull in @angular/router?',
      `
No, and deliberately not. A component library that imports the router forces it on apps that
don't route. Where a link is genuinely the right element — a nav button, a "Back to list" — use
the **\`[gogButton]\`** directive <span class="since since--latest" title="Added in 21.4.0">21.4.0</span>
on your own \`<a>\` and keep whatever directives that anchor already has, \`routerLink\` included:

\`\`\`html
<a gogButton variant="secondary" routerLink="/settings">Settings</a>
\`\`\`

The directive applies the same classes \`gog-button\` renders; the styles for them live in the
global \`styles/button.css\`, because Angular's emulated encapsulation could never reach an
element declared in your template. Use the **component** when the button acts on the page (it
has \`loading\`, \`debounce\` and \`gogClick\`), the **directive** when the element must be a link.
`,
    ),
    item(
      'How do I translate the library into another language?',
      `
\`GOG_CONFIG.labels\` <span class="since" title="Added in 21.3.2">21.3.2</span>. Every fixed
string the library renders that you never write markup for — the clear buttons, the paginator's
page names, the calendar's "Today", the table's selection checkboxes — is set once there rather
than per instance. See [Global Configuration](/general/global-config) for the full list and the
one field that takes a formatter instead of a string.
`,
    ),
    item(
      'Do I have to give every field an inputId?',
      `
No — since 21.3.2 <span class="since" title="Added in 21.3.2">21.3.2</span> every form control
generates its own \`id\` and wires its \`<label for>\` to it. Set \`inputId\` only when something
**outside** the component has to reference the field: your own \`<label for>\`, an
\`aria-describedby\` on a sibling, or a test hook. Before this, omitting it produced a silently
unlabelled field.
`,
    ),
    item(
      'Can I use my own icons?',
      `
Yes — register them once with \`provideGogIcons(...)\`
<span class="since since--latest" title="Added in 21.4.0">21.4.0</span> and use the name
anywhere a built-in one goes. A registered name also overrides a built-in of the same name,
which is how you swap the library's glyph set for your own without touching call sites. See the
[Icon](/components/icon) page — including the rule about what SVG is safe to register.
`,
    ),
    item(
      'Does it support server-side rendering (SSR)?',
      `
Yes — this documentation site itself is an SSR Angular app built against the published
package. Anything that touches \`window\`, \`document\` or measures real layout (the scroll
component's thumb sizing, the theme generator's live preview) is guarded with Angular's
\`isPlatformBrowser\`/\`afterNextRender\`, so it renders safely on the server and picks up the
real behavior once hydrated on the client.
`,
    ),
    item(
      'What browsers does it support?',
      `
Whatever Angular's own ["Baseline" browser policy](https://angular.dev/reference/versions)
covers for the Angular major you're on — recent evergreen Chrome, Edge, Firefox and Safari.
The library doesn't layer a separate, older browser floor on top of that.
`,
    ),
    item(
      'Is right-to-left (RTL) supported?',
      `
**Not yet — treat it as unsupported.** Most component stylesheets still position things with
physical \`left\`/\`right\` rather than logical \`inset-inline-*\` properties, and the overlay
positioning that places dropdown panels, tooltips and toasts has no notion of writing
direction, so under \`dir="rtl"\` a panel can open against the wrong edge. Some components are
already written with logical properties and will look correct, which is exactly the problem:
the result is inconsistent rather than uniformly wrong. A full pass is planned; until it lands,
don't pick this library for an RTL product.
`,
    ),
    item(
      'How much does it add to my bundle?',
      `
The whole library — all 30 components — is **103.8 KB gzipped** of JavaScript, plus a 16.9 KB
gzipped stylesheet that carries every theming token. An app using a handful of components pays
a fraction of the first number, since the rest is tree-shaken; the stylesheet is loaded whole
either way. For context, four Angular Material components gzip to 153.5 KB and the same four
from PrimeNG to 330.6 KB — with the commands to re-measure all of it on the
[full technical comparison](/general/compare-full).
`,
    ),
    item(
      'Are there test harnesses?',
      `
No. Material ships \`@angular/material/*/testing\` harnesses; this library ships none. Test its
components the way you test your own markup — by role and accessible name
(\`getByRole('button', { name: 'Save' })\`), which works in Testing Library, Playwright and
plain \`TestBed\` alike, and does not break when the internal DOM changes. The components render
proper roles, labels and \`aria-*\` state precisely so that this is possible.
`,
    ),
    item(
      'Can it handle a 10 000-row table or a 10 000-option select?',
      `
Not by rendering them all — **nothing in the library virtualizes**. \`gog-table\` renders every
row of the current page and \`gog-select\` every option in the list, so very large collections
will crawl.

What exists instead is the server-side half of the problem: \`gog-table\`'s \`lazy\` mode hands
sorting and paging to your backend so only one page ever reaches the DOM, \`gog-paginator\`
does the same for your own lists, and \`gog-autocomplete\` fetches in pages as the user scrolls.
For a genuinely large grid rendered client-side, use a dedicated data-grid.
`,
    ),
  ]),

  section('Theming', [
    item(
      'How do I switch between light and dark?',
      `
Everything keys off one attribute on \`<html>\`: \`data-theme\`. \`theme.css\` ships \`light\` (also
what you get with no attribute at all) and \`dark\`; the presets — \`slate\`, \`one-dark\`,
\`one-light\` — are separate stylesheets you add to your \`styles\` array to make those names
resolve.

Set it yourself, or use \`ThemeService\`:

\`\`\`ts
private readonly theme = inject(ThemeService);

this.theme.setTheme('dark'); //  or toggleTheme(), or read theme() as a signal
\`\`\`

With no configuration the service adopts whatever \`data-theme\` is already on the document and
otherwise uses \`light\`, and it changes nothing else. **Remembering the choice and following the
OS setting are both opt-in**, because a library that starts writing to \`localStorage\` or
reacting to system settings after an upgrade is a library that surprised you:

\`\`\`ts
provideGogConfig({
  theme: { storageKey: 'app-theme', followSystem: true },
});
\`\`\`

Server-rendering an app that persists a theme: put the attribute into the HTML your server
sends (\`<html data-theme="dark">\`), or you will get a flash of the wrong palette before
hydration. \`ThemeService\` treats an attribute that is already there as a decision that has
been made and leaves it alone.
`,
    ),
    item(
      'How is this different from just restyling Material or PrimeNG?',
      `
Both are excellent libraries, but restyling either one means fighting a Sass mixin system or
a JS preset engine to change how a component looks. Here, every visual value — color,
spacing, radius, shadow, timing — is a plain CSS custom property (\`--gog-*\`), layered
foundation → component → instance. Overriding one is just CSS: no preprocessor, no theming
API, no build step. See [Theming](/general/theming) for the full layering model, or the
[full comparison](/general/compare-full) for the numbers behind the claim.
`,
    ),
    item(
      'Can I use this alongside Material or PrimeNG in the same app?',
      `
Yes — every token this library reads is namespaced under \`--gog-*\`, so it can't collide with
Material's \`--mat-*\` tokens or PrimeNG's own variables. Nothing here reaches into global
selectors either (no bare \`button\`/\`input\` styling), so the two can coexist without one
restyling the other.
`,
    ),
  ]),

  section('Versioning & Changes', [
    item(
      "What's the versioning policy?",
      `
[Semantic versioning](https://semver.org/), with the pre-1.0 caveat above. Concretely:

- **Patch** (\`21.3.0\` → \`21.3.1\`) — bug fixes only, no new inputs/outputs, nothing to change
  in your code.
- **Minor** (\`21.3.0\` → \`21.4.0\`) — new components, new inputs/outputs, or (pre-1.0) an
  occasional breaking change if it's clearly called out in the Changelog with a migration
  path.
- **Major** — reserved for changes big enough to warrant one even post-1.0.
`,
    ),
    item(
      'Why do some inputs get deprecated instead of just changed?',
      `
When an input's shape needs to change, the old one is marked \`@deprecated\` with the version
it was deprecated in and the version it's actually removed in (usually two minors later),
plus what to use instead — so upgrading across one release never silently breaks a build, and
the compiler flags every call site that needs attention before removal actually lands. The
component doc pages call these out explicitly wherever they apply.
`,
    ),
    item(
      "What's deprecated right now, and when does it go?",
      `
Everything currently deprecated is scheduled for **21.5.0**, and all of it is one migration:
API that took a \`TemplateRef\` through an input became content you project instead. If your
editor is showing strikethrough on any of these, this is the replacement:

| Deprecated | Use instead |
| --- | --- |
| \`iconStartTemplate\` / \`iconEndTemplate\` / \`iconStartFn\` / \`iconEndFn\` / \`iconStartLabel\` / \`iconEndLabel\` on \`gog-inputfield\` | a projected \`<span gogInputAddonStart>\` / \`<button gogInputAddonEnd>\` |
| \`checkIconTemplate\` on \`gog-checkbox\` | \`<ng-template gogCheckboxIcon>\` |
| \`clearIconTemplate\` on \`gog-multiselect\` | \`<ng-template gogMultiselectClearIcon>\` |
| \`iconTemplate\` on \`gog-tag\` | \`<ng-template gogTagIcon>\` |
| \`chevronTemplate\` on the dropdowns | \`<ng-template gogDropdownChevron>\` |
| \`<column>\` element, \`Column\` const and type | \`<gog-column>\` and \`GogColumn\` |
| the string-keyed \`[template]\` slot on a column | \`<ng-template gogColumnBody>\` / \`gogColumnHeader\` |
| \`GogSelectOption\` / \`GogMultiselectOption\` types | \`GogDropdownOption\` |
| the \`@guildofgleks/ui/src/styles/…\` asset path | \`@guildofgleks/ui/styles/…\` |

One row is worth calling out: \`GogSelectOption\` / \`GogMultiselectOption\` were announced for
removal in **21.4.0** and are still exported in 21.4.1 — they overran by a minor and come out
with everything else in 21.5.0. Migrate before you upgrade to it and the upgrade is a version
bump; migrate after and the compiler will point at every call site, which is the whole reason
the deprecation cycle exists.
`,
    ),
  ]),

  section('Contributing & Support', [
    item(
      'I found a bug / want a feature — where do I go?',
      `
Open an issue on [GitHub](https://github.com/GuildOfGleks/gleks_web_ui/issues). Include the
library version, a minimal repro if you can, and — for a visual bug — which theme you were
on.
`,
    ),
    item(
      'What license is it under?',
      `
[Apache License 2.0](https://github.com/GuildOfGleks/gleks_web_ui/blob/master/LICENSE). Free
to use, modify and ship in commercial projects, with an explicit patent grant from every
contributor to every user — the thing MIT doesn't spell out.
`,
    ),
    item(
      'How can I support the project?',
      `
The library is, and stays, free — no paid tier, no feature gate. Three things help, in
increasing order of how much:

- **[Star the repository](https://github.com/GuildOfGleks/gleks_web_ui)** — it costs nothing and
  it is most of what a developer evaluating a small library looks at first.
- **Tell someone.** A link in a team chat, a mention in a post, an answer on Stack Overflow
  where this fits — for a project this size that is worth more than it sounds.
- **[Sponsor on Patreon](https://www.patreon.com/chebureck77)** — the same destination as the
  **Sponsor** button on the [GitHub repository](https://github.com/GuildOfGleks/gleks_web_ui),
  which reads it from the repo's \`.github/FUNDING.yml\`. It funds the time that goes into
  releases; it buys no influence over the roadmap, and nothing in the library is or will be
  gated behind it.
`,
    ),
  ]),
];

export const FAQ_ITEMS: readonly FaqItem[] = FAQ_SECTIONS.flatMap((s) => s.items);
