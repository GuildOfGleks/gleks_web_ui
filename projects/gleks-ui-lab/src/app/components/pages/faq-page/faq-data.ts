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
**Angular 21.2 and 22**, from one package — \`peerDependencies\` are \`^21.2.0 || ^22.0.0\` for
\`@angular/core\`, \`@angular/common\`, \`@angular/forms\` and \`@angular/platform-browser\`. The
library ships partial-compiled (Ivy partial mode), which is forward-compatible with the next
major without a separate build.

The \`|| ^22.0.0\` half arrived in **21.5.0**. Before it, the range was \`^21.2.0\` alone and npm
refused to install into an Angular 22 app that would otherwise have built and run fine, so every
such consumer needed an \`overrides\` / \`resolutions\` entry. If you have one, delete it.

Nothing older than 21.2. The library was built after standalone components, signals and
\`OnPush\`-by-default became the normal way to write Angular, so there was never a reason to also
support the NgModule-era API surface older libraries still carry. If your app is on an older
Angular version, upgrade first — there's no compatibility build.
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
\`ButtonComponent\` alone doesn't pull in the other 30 components.

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
the **\`[gogButton]\`** directive <span class="since" title="Added in 21.4.0">21.4.0</span>
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
<span class="since" title="Added in 21.4.0">21.4.0</span> and use the name
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
covers for the Angular major you're on — for v21 that is \`baseline widely available on
2025-10-20\`: Chrome 111, Firefox 112, Safari 16.4. **The library deliberately declares no
\`browserslist\` of its own.** One was added and removed again: stating a lower floor than the
framework's only produced "unsupported browsers" warnings on every build, and a component
library cannot support a browser the framework it runs on does not.

**What is worth knowing is where the CSS is newer than that window.** The themes mix colours
with \`color-mix()\`, which shipped in Chrome 111, Firefox 113, Safari 16.2 and Samsung Internet
22 — so Firefox 112 is *inside* Angular's supported window and has no \`color-mix()\`. Since
<span class="since" title="Added in 21.7.1">21.7.1</span> every mixed value sits inside an
\`@supports\` block over a flat palette value, which is the only mechanism that gates a **custom
property** on feature support: the ordinary two-declaration fallback does not work here, because
a custom property is validated when it is substituted rather than when it is parsed, so the
unsupported declaration still wins and \`var()\` on it then resolves to nothing at all. That was
the real cause of "the colours are wrong in Samsung Internet" — the declarations were not
falling back, they were vanishing.

So below the floor the library still renders: flat palette colours, less depth, every surface
legible and every focus ring visible.

Three more things that look like a bug and are not:

- **Every animation is plain CSS** — \`@keyframes\` and \`transition\`, no Web Animations API and no
  JavaScript timer driving a visual. There is no browser that runs the library but skips its
  animations. If you see none, the cause is \`prefers-reduced-motion\`, not the browser. That
  setting removes movement, not feedback: since <span class="since" title="Added in 21.9.0">21.9.0</span>
  a press is a colour as well as a scale, and under \`prefers-reduced-motion: reduce\` the scale
  goes and the colour stays, on the button and on the eight other pressable surfaces. The
  [Button](/components/button) page has the live case. The ripple is the deliberate exception —
  it is suppressed outright, because it is decoration rather than state.
- **\`backdrop-filter\` degrades on its own.** Both places that use it — the dialog backdrop and
  the spinner overlay — also set a solid \`background\`, so a browser without it loses the blur
  and keeps the dimming.
- **Brave's shields can block Google Fonts.** That affects only the two opt-in
  \`presets/*.fonts.css\` companions; every preset itself sets system font stacks and is
  unaffected. Importing a preset never makes a network request.

**What has been tested is narrower than what is supported, and the difference is worth stating:**
the library is verified in Chrome on Windows. Everything above is derived from the CSS features
the code actually uses — read it as "nothing here needs anything newer", not as "someone has
opened it in all of these".
`,
    ),
    item(
      'Is right-to-left (RTL) supported?',
      `
**Yes**, since <span class="since" title="Added in 21.5.0">21.5.0</span>. Set \`dir="rtl"\` on
\`<html>\` for the whole app, or on any element for one region of it — physical \`left\`/\`right\`
became logical \`inset-inline-*\` properties across every stylesheet, and portaled panels (the
select/multiselect panel, the tooltip bubble) copy that scoped \`dir\` onto their own host, so an
RTL region inside an LTR page still opens its overlays on the correct side instead of taking the
document's direction. The calendar's month arrows turn around, and the slider, toast progress
bar and indeterminate progress bar all run from the inline start rather than from a hardcoded
left.

Two APIs stay physical on purpose, not by omission: \`gogTooltipPosition\` (\`'left' | 'right'\`)
names a literal side, and \`ToastConfig.position\`'s corners are a deliberate placement a reader
chose — use \`'auto'\` on the tooltip for the direction-aware pick. See
[Right-to-left](/general/rtl) for the full breakdown, a live demo and the three CSS custom
properties (\`--gog-inline-start-side\`, \`--gog-inline-end-side\`, \`--gog-direction-sign\`) your
own custom CSS can use to follow the same rule.
`,
    ),
    item(
      'How much does it add to my bundle?',
      `
The whole library — 31 components plus the \`gogBadge\`, \`gogTooltip\` and \`gogRipple\`
directives — is **113.6 KB gzipped** of JavaScript, plus a 28.6 KB
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
what you get with no attribute at all) and \`dark\`; the nine presets — \`slate\`, \`one-dark\`,
\`one-light\`, \`material\`, \`primeng\`, \`ledger\`, \`terminal\`, \`bevel\` and \`parchment\` — are
separate stylesheets you add to your \`styles\` array to make those names resolve.

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
**Nothing.** \`GOG_DEPRECATIONS\` — the manifest the package exports, generated from the
library's own source with \`since\`, \`sinceDate\`, \`replacement\` and \`removedIn\` for whatever it
lists — is an empty array as of the version you have installed.

The library's only two deprecation waves so far are both already fully removed. 21.5.0 removed
every deprecated input, element, type alias and asset path it had; **21.7.0** removed the last
of it, three abbreviated **CSS custom property prefixes** that stood in for a component's full
name — \`--gog-btn-*\` → \`--gog-button-*\`, \`--gog-confirm-*\` → \`--gog-confirmation-dialog-*\`,
\`--gog-ms-*\` → \`--gog-multiselect-*\`. Both waves are in the
[release notes](/general/releases). A removed **symbol** fails to compile, so for that half the
compiler is the migration checklist. A removed **custom property** cannot fail that way — one
nothing reads is not an error, just a value that stops applying — which is exactly why the three
prefixes got two minors of overlap rather than one, and why that half is checked by looking at
the page.

\`--gog-input-*\` looks like it should have been a fourth prefix and never was: it names the
text-field block that \`gog-inputfield\` and \`gog-textarea\` both render, not the
\`gog-inputfield\` component. It stays.

The library's own build runs \`check:deprecations\`, which fails it the moment a future
deprecation's \`removedIn\` version is reached and the symbol is still exported — so the next
deprecation, whenever it lands, cannot overrun its own stated date the way two of 21.5.0's did
before that check existed.
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
