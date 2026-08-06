---
description: 'SCSS & theming conventions for @guildofgleks/ui'
applyTo: 'projects/gleks/ui/**/*.scss'
---

# @guildofgleks/ui — Styling & Theming

Consistent styling is what makes the library feel like one product across projects.
Every component `.scss` file follows the rules below. See
`gleks-ui-library.instructions.md` for the overall authoring guide.

## Class naming — BEM, block-prefixed

- Use BEM: `block`, `block__element`, `block--modifier`.
- The block name is **always prefixed with `gog`** and matches the component
  (`gog-btn`, `gog-spinner`).
- Examples: `.gog-btn`, `.gog-btn__content`, `.gog-btn__content--hidden`,
  `.gog-spinner__arc-outer`, `.gog-spinner__wrap--sm`.
- Drive modifiers from the template with `[class.gog-btn--lg]="size() === 'lg'"`
  bindings — never `ngClass`.

## Theming via CSS custom properties

- Every themeable value is a **CSS custom property named `--gog-<component>-*`**.
- Declare defaults on the block selector, then consume them:

```scss
.gog-btn {
  --gog-btn-bg: #fae000;
  --gog-btn-color: #1a1208;
  --gog-btn-radius: 0px;

  background-color: var(--gog-btn-bg);
  color: var(--gog-btn-color);
  border-radius: var(--gog-btn-radius);
}

/* variants only re-map the custom properties */
.gog-btn--outline {
  --gog-btn-bg: transparent;
  --gog-btn-color: var(--gog-accent-color);
}
```

- This lets consumers re-skin components by overriding `--gog-*` without touching internals,
  and lets a parent component theme a child (e.g. a button setting `--gog-spinner-color`).
- When reading a shared design token, use a fallback: `var(--gog-spinner-color, var(--gog-accent-color))`.

## Design-token contract

The library references app-level design tokens (palette, type scale, control metrics,
button sizing). These are **shipped with working defaults** in `src/styles/theme.css`,
pulled in via `src/styles/index.css`, which is the one stylesheet a consumer imports.

Rules when touching tokens:

- Every app-level token the components read MUST have a default in `theme.css`. A token
  consumed but never declared makes the whole declaration invalid at computed-value time —
  `background-color: var(--undefined)` silently becomes `transparent`, it does not fall
  back to the previous value.
- Put **structural** tokens (sizing, spacing, typography) on `:root` and only the palette
  in the `:root[data-theme='…']` blocks, so a theme inherits everything it doesn't
  override. Declaring structural tokens inside a single theme block drops them for
  every other theme.
- Document any new app-level token in the README's theming table.
- Do not hardcode brand colors when a token exists.

### Panels rendered outside the component subtree

A dropdown opened with `[appendToBody]` is stamped into `<body>`, so it inherits **no**
`--gog-*` token declared on the component's wrapper block. Every token the panel and its
children read has to be redeclared in the `--portal` modifier block (see
`.gog-select__dropdown--portal` / `.gog-ms__dropdown--portal`). Miss one and that
property silently drops out only in append-to-body mode.

`data-theme` is exactly the same problem: it can be scoped to any element, not just
`:root` (the themes showcase page puts it on a plain `<article>` so several themes render
side by side). A panel appended straight to `<body>` sits outside that scoped subtree and
would otherwise fall back to whatever theme `:root` carries. `GogDropdownOverlay.attach()`
copies `data-theme` from the trigger's nearest `[data-theme]` ancestor onto the overlay
host for exactly this reason — any new append-to-body panel must go through that same
overlay helper rather than appending to `document.body` directly, or it will silently lose
scoped theming.

## Scrollable content

Wherever a component's own markup would otherwise need a raw `overflow-x`/`overflow-y:
auto|scroll`, wrap that content in `<gog-scroll>` instead. A native scrollbar can't be
themed (no `--gog-*` tokens reach it), doesn't auto-fade like the rest of this library's
overlay chrome, and would be the one un-restyleable strip of browser chrome inside an
otherwise fully themeable component. `gog-dialog`'s body, `gog-select`'s and
`gog-multiselect`'s dropdown panels, and `gog-tooltip`'s bubble (once its content exceeds
`--gog-tooltip-max-height`) all do this already — follow that pattern for a new one:

```html
<gog-scroll size="thin" [focusable]="false" overscrollBehavior="contain" class="gog-foo__scroll">
  <!-- the content that might overflow -->
</gog-scroll>
```

```scss
.gog-foo__scroll {
  /* a max-height (to grow-then-cap) or a fixed height — whichever the component needs */
  max-height: var(--gog-foo-max-height);
}
```

- `size="thin"` for a compact chrome inside a small panel; leave it at `'normal'` for a
  larger, primarily-scrollable surface.
- `[focusable]="false"` when the parent already owns focus/keyboard handling (a dialog
  running its own focus trap, a decorative tooltip that can't be tabbed to at all) so this
  doesn't add a redundant/unreachable tab stop; leave it at its default `true` for a
  scrollable region that has no other focus story of its own.
- `overscrollBehavior="contain"` on anything that's an overlay (a panel, a dialog body, a
  tooltip) so scrolling past its edge doesn't chain into the page behind it.
- Give it a `max-height` (grows with content, then caps and scrolls), not a fixed `height`,
  unless the component genuinely needs a constant size regardless of content — see
  `scroll.component.scss`'s own top-of-file comment for why the whole chain from `:host`
  down uses flex sizing (`flex: 1 1 auto` + `min-height: 0`) rather than `height: 100%` to
  make that capping work at any nesting depth.

This applies to projected/dynamic content too, not just a component's own static markup —
`gog-dialog`'s body wraps its `*ngComponentOutlet`-rendered content in exactly this pattern.

## Encapsulation & scope

- Never write global selectors that leak outside the component. Scope every rule under the
  block class or `:host` / `:host(...)`.
- Use `:host(.gog-host--full-width)` style host-state selectors instead of `::ng-deep`.
- Avoid `::ng-deep`; if a child must be themed, expose a `--gog-*` custom property instead.
- Use `contain: layout style` on self-contained blocks to limit reflow scope.

## Accessibility & motion

- Provide a visible `:focus-visible` outline for every interactive element.
- Every animation MUST be disabled under `@media (prefers-reduced-motion: reduce)`.
- Ensure color choices meet **WCAG AA** contrast in both light and dark themes
  (theme is toggled via the `[data-theme='dark']` attribute on `:root`).
