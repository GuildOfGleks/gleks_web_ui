import { Signal, computed } from '@angular/core';

import { GogGlobalConfig, resolveConfigured } from './config';
import { GogFloatLabelVariant } from './types';

const DEFAULT_VARIANT: GogFloatLabelVariant = 'none';
const DEFAULT_SHOW_PLACEHOLDER = false;

/**
 * Shared float-label state for the library's field-style controls.
 *
 * A plain class rather than a base class or directive, for the same reason as `GogErrorState`:
 * it has to serve `gog-inputfield` and `gog-textarea`, which share no base class, as well as
 * `GogDropdownBase`, which is one. Each consumer owns an instance and exposes whichever
 * members its template needs.
 *
 * The one thing each control must supply itself is `hasValue` — "this field has content" means
 * something different everywhere (a non-empty string, a non-null selection, a non-empty
 * selection array), which is exactly why this is composed in rather than implemented as a
 * directive sitting outside the component.
 */
export class GogFloatLabelState {
  /**
   * @param variantInput the control's own `floatLabel` input (`undefined` when unset)
   * @param showPlaceholderInput the control's own `floatLabelShowPlaceholder` input
   * @param placeholder the control's `placeholder` input
   * @param isFocused whether the control currently has focus
   * @param hasValue whether the control has a value — see the class note
   * @param config the injected `GOG_CONFIG`
   */
  constructor(
    private readonly variantInput: Signal<GogFloatLabelVariant | undefined>,
    private readonly showPlaceholderInput: Signal<boolean | undefined>,
    private readonly placeholder: Signal<string>,
    private readonly isFocused: Signal<boolean>,
    private readonly hasValue: Signal<boolean>,
    private readonly config: GogGlobalConfig,
  ) {}

  /** The resolved variant: instance input, else `GOG_CONFIG.floatLabel.variant`, else `'none'`. */
  readonly variant = computed(() =>
    resolveConfigured(this.variantInput(), this.config.floatLabel?.variant, DEFAULT_VARIANT),
  );

  readonly showPlaceholder = computed(() =>
    resolveConfigured(
      this.showPlaceholderInput(),
      this.config.floatLabel?.showPlaceholder,
      DEFAULT_SHOW_PLACEHOLDER,
    ),
  );

  /** Whether a float label is in effect at all — `false` keeps the static label-above layout. */
  readonly isActive = computed(() => this.variant() !== 'none');

  /** Whether the label is at its floated target rather than resting like a placeholder. */
  readonly isFloated = computed(() => this.isFocused() || this.hasValue());

  /**
   * The placeholder the control should actually render. While a float label is active the
   * resting label already occupies that space, so the placeholder stays hidden unless the
   * consumer opted into `floatLabelShowPlaceholder` — and even then only once the label has
   * floated out of the way.
   */
  readonly effectivePlaceholder = computed(() => {
    if (!this.isActive()) return this.placeholder();
    if (!this.showPlaceholder()) return '';
    return this.isFloated() ? this.placeholder() : '';
  });
}
