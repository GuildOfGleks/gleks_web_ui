---
description: 'SCSS & theming conventions for @gleks/ui'
applyTo: 'projects/gleks/ui/**/*.scss'
---

# @gleks/ui — Styling & Theming

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
  --gog-btn-color: var(--accent-color);
}
```

- This lets consumers re-skin components by overriding `--gog-*` without touching internals,
  and lets a parent component theme a child (e.g. a button setting `--gog-spinner-color`).
- When reading a shared design token, use a fallback: `var(--gog-spinner-color, var(--accent-color))`.

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
