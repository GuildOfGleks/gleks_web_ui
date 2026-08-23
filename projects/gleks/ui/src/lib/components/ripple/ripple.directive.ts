import { Directive, booleanAttribute, computed, input } from '@angular/core';

import { bindRipple } from './ripple-controller';

/**
 * A pointer-position ripple for any element — a `gog-*` component's host tag or a plain native
 * one: `<button gogRipple>`, `<div gogRipple rippleCentred>`.
 *
 * Built from scratch. There is no `@angular/cdk` in this tree and there will not be, so
 * Material's `MatRipple` is a reference for behaviour only.
 *
 * **Put it on the element that paints the surface.** The wash lives in its own layer that clips
 * itself — the host is never given `overflow: hidden`, so a `gogBadge` on the same element keeps
 * its badge — and that layer takes the host's corner radius with `border-radius: inherit`. On a
 * wrapper whose *child* paints the rounded background, the layer inherits the wrapper's radius,
 * usually `0`, and the wash squares off at the corners. `GogRippleController` and
 * `styles/ripple.css` carry the rest of the reasoning.
 *
 * ## What suppresses it
 *
 * `rippleDisabled`, a host that is `disabled` or `aria-disabled="true"`, and
 * `prefers-reduced-motion: reduce` — the last one suppressed outright rather than shortened,
 * because a ripple is the single most obviously decorative motion in the library.
 *
 * ## Why `GOG_CONFIG.ripple.enabled` does not reach this directive
 *
 * That setting is the default for the **components'** `ripple` input, and this is not a
 * component's input: writing `gogRipple` on your own element is already the per-element
 * decision, the same way `[filter]="true"` on one `gog-select` beats the app-wide default.
 * `rippleDisabled` is how you take it back, per instance or bound to whatever you like.
 */
@Directive({
  selector: '[gogRipple]',
})
export class GogRippleDirective {
  /**
   * Suppresses the effect without removing the directive — and suppresses its listeners and its
   * host class with it, so this is a real disable rather than a hidden ripple.
   */
  readonly rippleDisabled = input(false, { transform: booleanAttribute });
  /**
   * Always start from the centre of the host, ignoring where the pointer landed. Keyboard
   * activation is centred regardless — `Enter` and `Space` carry no coordinates.
   */
  readonly rippleCentred = input(false, { transform: booleanAttribute });

  private readonly enabled = computed(() => !this.rippleDisabled());
  private readonly rippleControl = bindRipple(this.enabled, this.rippleCentred);
}
