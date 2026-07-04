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

## Design-token contract (host app responsibility)

The library references app-level design tokens that the **consuming application must define**
in its global styles (they are intentionally *not* shipped by the library):

- Palette: `--accent-color`, `--accent-bright`, `--accent-dim`, `--primary-color`,
  `--warning-color`, `--info-color`.
- Button sizing: `--btn-sm-padding`, `--btn-md-padding`, `--btn-lg-padding`,
  `--btn-sm-font-size`, `--btn-md-font-size`, `--btn-lg-font-size`.
- Typography: `--font-heading`.

Always consume these through `var(...)` with a sensible fallback where possible. Do not 
hardcode brand colors when a token exists. If you introduce a new token, document it here.

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
