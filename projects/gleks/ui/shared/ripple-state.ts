import { Signal, computed } from '@angular/core';

import { GogGlobalConfig, resolveConfigured } from './config';

/**
 * Off, so the ripple is purely additive: adding it to the library changed the appearance of
 * nothing until an app asks for it. Flipping this default would change how every button in every
 * consuming app looks, which is a release of its own, not a line in a feature commit.
 */
export const DEFAULT_RIPPLE = false;

/**
 * Shared "does this control ripple" state, resolved the usual way — instance input, then
 * `GOG_CONFIG.ripple.enabled`, then off.
 *
 * A plain function rather than a class (`GogClearableState`'s shape) because there is exactly one
 * derived value and nothing to hold: every component that ripples writes the same two lines, and
 * this is what keeps the precedence identical across all nine of them instead of nine separate
 * `??` chains that can drift.
 *
 * The component then binds the *negation* onto its own inner element:
 *
 * ```html
 * <button class="gog-btn" gogRipple [rippleDisabled]="!rippleEnabled()">
 * ```
 *
 * `[gogRipple]` is always applied rather than toggled, because a directive cannot be added and
 * removed by a binding — and it costs nothing while disabled: `GogRippleDirective` attaches no
 * event listeners at all until `rippleDisabled` goes false.
 */
export function resolveRipple(
  rippleInput: Signal<boolean | undefined>,
  config: GogGlobalConfig,
): Signal<boolean> {
  return computed(() => resolveConfigured(rippleInput(), config.ripple?.enabled, DEFAULT_RIPPLE));
}
