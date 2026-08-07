import { Signal, computed } from '@angular/core';

import { GogGlobalConfig, resolveConfigured } from './config';

/**
 * Shared "show a clear button" state for the field-style controls.
 *
 * A plain composition class, same reasoning as `GogErrorState` and `GogFloatLabelState`: it has
 * to serve `gog-inputfield` and `gog-textarea` (no common base class) as well as
 * `GogDropdownBase`, which is one.
 *
 * The two things each control supplies itself are `hasValue` — "there is something to clear"
 * differs per control (non-empty string / non-null selection / non-empty array) — and the
 * actual clearing, since only the control knows its own empty value and how to notify forms.
 */
export class GogClearableState {
  /**
   * @param clearableInput the control's own `clearable` input (`undefined` when unset)
   * @param hasValue whether there is anything to clear
   * @param isDisabled whether the control is disabled — a disabled field offers no clear button
   * @param config the injected `GOG_CONFIG`
   * @param fallback the control's own default, read lazily — `GogDropdownBase` constructs this
   *   in a field initializer, before its subclass has assigned `clearableByDefault`. `false`
   *   everywhere except `gog-multiselect`, which shipped a clear button before this input
   *   existed and keeps it.
   */
  constructor(
    private readonly clearableInput: Signal<boolean | undefined>,
    private readonly hasValue: Signal<boolean>,
    private readonly isDisabled: Signal<boolean>,
    private readonly config: GogGlobalConfig,
    private readonly fallback: () => boolean,
  ) {}

  /** Whether the control is clearable at all — instance input, then config, then the default. */
  readonly enabled = computed(() =>
    resolveConfigured(this.clearableInput(), this.config.control?.clearable, this.fallback()),
  );

  /**
   * Whether the clear button should render *right now*. Deliberately value-driven: the control
   * shows nothing to clear until there is something to clear, so the affordance appears with the
   * content rather than sitting there permanently as dead chrome.
   */
  readonly isVisible = computed(() => this.enabled() && this.hasValue() && !this.isDisabled());
}
