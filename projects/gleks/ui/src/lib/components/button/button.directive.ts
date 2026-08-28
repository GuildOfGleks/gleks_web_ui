import { Directive, booleanAttribute, computed, inject, input } from '@angular/core';

import { GOG_CONFIG, resolveConfigured } from '../../shared/config';
import { resolveRipple } from '../../shared/ripple-state';
import { bindRipple } from '../ripple/ripple-controller';
import { GogSize, GogVariant } from '../../shared/types';

/** Built-in default, used when neither the instance input nor `GOG_CONFIG` supplies one. */
const DEFAULT_SIZE: GogSize = 'md';

/**
 * Makes a consumer's own `<a>` or `<button>` look like a `gog-button`.
 *
 * ```html
 * <a gogButton routerLink="/pricing">See pricing</a>
 * <a gogButton variant="ghost" href="https://example.com" target="_blank" rel="noreferrer">Docs</a>
 * <button gogButton variant="outline" size="sm" type="submit">Save</button>
 * ```
 *
 * ## Why this exists next to `gog-button`
 *
 * `gog-button` renders its own `<button>`, so it can never *be* a link — and making it one would
 * mean brokering the router's entire input surface (`routerLink`, `routerLinkActive`,
 * `queryParams`, `fragment`, `state`, …) through a component that would then have to depend on
 * `@angular/router`. This package has four peer dependencies and no router, and a navigation
 * button is not worth a fifth.
 *
 * Inverting it costs nothing: the consumer keeps their own element, so `routerLink`, `href`,
 * `target`, `download`, `type="submit"`, `disabled` and every future directive keep working
 * because they were never taken away. This is the "headless primitive" axis of
 * `api-design.instructions.md` — expose the behaviour, not another input.
 *
 * ## Which to use
 *
 * Use `gog-button` for a button that *does* something in the page — it adds `loading` with a
 * centred spinner, `debounce` click throttling and the `gogClick` output, none of which a bare
 * element can provide. Use `[gogButton]` when the element must be a link, or when you need to
 * keep directives of your own on it.
 *
 * ## Accessibility
 *
 * The element stays yours, so its semantics stay correct by construction: a link is a link and a
 * button is a button. Two things this deliberately does **not** do:
 *
 * - It does not add `disabled` handling to an `<a>`. There is no such thing — a disabled link is
 *   just a link. Remove the `href` or render a real `<button>`.
 * - It does not fake a loading state. `gog-button`'s spinner is a projected child; a directive
 *   cannot add one without taking over the element's content.
 */
@Directive({
  // Restricted to `a` and `button` rather than a bare `[gogButton]`: on a `<div>` or `<span>` the
  // result looks like a button and is invisible to the keyboard and to assistive tech, and that
  // is exactly the mistake this directive would otherwise make easy.
  selector: 'a[gogButton], button[gogButton]',
  host: {
    class: 'gog-btn gog-inline-center gog-contained-layout',
    '[class]': 'variantClass() + " " + sizeClass()',
    '[class.gog-btn--full-width]': 'fullWidth()',
  },
})
export class GogButtonDirective {
  readonly variant = input<GogVariant>('primary');
  /** Unset, falls back to `GOG_CONFIG.control.size`, then to `'md'` — as on `gog-button`. */
  readonly size = input<GogSize | undefined>(undefined);
  /**
   * Stretches the element to its container's width. A bare attribute is enough:
   * `<a gogButton fullWidth>`.
   */
  /**
   * Press ripple. Unset, falls back to `GOG_CONFIG.ripple.enabled`, then to `false` — so
   * `[ripple]="false"` opts one instance out of an app that turned it on everywhere.
   */
  readonly ripple = input<boolean | undefined>(undefined);
  readonly fullWidth = input(false, { transform: booleanAttribute });

  private readonly globalConfig = inject(GOG_CONFIG);
  private readonly rippleEnabled = resolveRipple(this.ripple, this.globalConfig);
  private readonly rippleControl = bindRipple(this.rippleEnabled);

  private readonly resolvedSize = computed(() =>
    resolveConfigured(this.size(), this.globalConfig.control?.size, DEFAULT_SIZE),
  );

  protected readonly variantClass = computed(() => `gog-btn--${this.variant()}`);
  /**
   * Unlike `gog-button`, this emits a class for `'md'` too. The component can leave the default
   * size unclassed because its own stylesheet bottoms out at `--gog-button-md-*`; here the class is
   * also what a consumer reads in devtools to see which size is applied, and a silently absent
   * one reads as "no size resolved".
   */
  protected readonly sizeClass = computed(() => `gog-btn--${this.resolvedSize()}`);
}
