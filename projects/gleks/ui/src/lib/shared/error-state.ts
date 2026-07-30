import { Signal, computed, signal } from '@angular/core';
import { NgControl } from '@angular/forms';

/**
 * `'manual'` (default): the field shows `errorMessage` for as long as it is non-empty — the
 * consumer decides when to clear it, e.g.
 * `errorMessage="control.invalid && control.touched ? 'Required' : ''"`.
 *
 * `'auto'`: shown once the attached form control has been touched and is invalid — the
 * consumer only supplies the message text, not the timing. Requires a
 * `[formControl]` / `formControlName` / `ngModel` on the element; without one this falls
 * back to `'manual'`, since there is no control state to key off.
 */
export type GogErrorDisplay = 'auto' | 'manual';

/**
 * Shared error-visibility state for the library's form controls. A plain class rather than
 * a base class or directive so it drops into components that can't share a base class
 * (`gog-inputfield`, `gog-slider`) as well as ones that already do (`GogDropdownBase`).
 * Each consumer owns its own instance and wires `check()` into its own `ngDoCheck`.
 */
export class GogErrorState {
  private readonly controlTouched = signal(false);
  private readonly controlInvalid = signal(false);

  constructor(
    private readonly errorMessage: Signal<string>,
    private readonly errorDisplay: Signal<GogErrorDisplay>,
    private readonly ngControl: NgControl | null,
  ) {}

  readonly hasError = computed(() => {
    if (this.errorDisplay() === 'auto' && this.ngControl) {
      return this.controlTouched() && this.controlInvalid();
    }
    return !!this.errorMessage();
  });

  readonly visibleError = computed(() => (this.hasError() ? this.errorMessage() : ''));

  /**
   * `NgControl` exposes validity as plain properties, and has no change notification for
   * `touched` at all — `statusChanges` fires only on validity transitions, never on
   * `markAsTouched()` — while its `control` does not exist yet during construction, so
   * subscribing early would miss it regardless. Mirroring on each check sidesteps both;
   * re-setting a signal to its current value notifies nothing, so the common case costs two
   * comparisons.
   */
  check(): void {
    const control = this.ngControl?.control;
    if (!control) return;

    this.controlTouched.set(control.touched);
    this.controlInvalid.set(control.invalid);
  }
}
