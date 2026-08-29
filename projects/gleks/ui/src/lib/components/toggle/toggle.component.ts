import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

import { GogSize } from '../../shared/types';
import { GOG_CONFIG, resolveConfigured } from '../../shared/config';

/** Built-in defaults, used when neither the instance input nor `GOG_CONFIG` supplies one. */
const DEFAULT_SIZE: GogSize = 'md';

/**
 * An on/off switch.
 *
 * ```html
 * <gog-toggle label="Notifications" [(checked)]="on" />
 * <gog-toggle formControlName="darkMode" onLabel="ON" offLabel="OFF" />
 * ```
 *
 * Next to `gog-checkbox` rather than a variant of it, because the two answer different
 * questions. A checkbox is "is this one of the things you selected"; a switch is "is this
 * setting on", takes effect immediately, and announces as **"switch, on"** rather than
 * "checkbox, checked". That announcement comes from `role="switch"` on a native
 * `<input type="checkbox">`, so keyboard, forms and assistive tech all still come from the
 * platform — only the painting differs.
 */
@Component({
  selector: 'gog-toggle',
  imports: [],
  templateUrl: './toggle.component.html',
  styleUrl: './toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
  },
})
export class ToggleComponent implements ControlValueAccessor {
  readonly label = input('');
  readonly ariaLabel = input('');
  /** Unset, falls back to `GOG_CONFIG.control.size`, then to `'md'`. */
  readonly size = input<GogSize | undefined>(undefined);
  readonly disabled = input(false);
  readonly fullWidth = input(false);
  /** Which side of the switch the label sits on. */
  readonly labelPosition = input<'start' | 'end'>('end');
  /**
   * Text rendered *inside* the track — the one thing a checkbox genuinely cannot do, and what
   * makes a switch readable at a glance in a dense settings list. Both must be short; the
   * track sizes to the wider of the two.
   */
  readonly onLabel = input('');
  readonly offLabel = input('');

  /**
   * Two-way bindable on/off state: `[(checked)]="signal"`.
   * This is the same state Angular Forms drives via `writeValue`/`registerOnChange`
   * when the component is used with `formControlName`/`[formControl]`.
   * Don't wire both a form directive AND `[(checked)]` to the same instance —
   * pick one, otherwise you end up with two competing sources of truth.
   */
  readonly checked = model<boolean>(false);

  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly cvaDisabled = signal(false);
  private readonly globalConfig = inject(GOG_CONFIG);

  /** Instance input → `GOG_CONFIG` → the component's own default. See `resolveConfigured`. */
  protected readonly resolvedSize = computed(() =>
    resolveConfigured(this.size(), this.globalConfig.control?.size, DEFAULT_SIZE),
  );
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  protected readonly hasTrackLabels = computed(() => !!this.onLabel() || !!this.offLabel());

  protected readonly hostClasses = computed(() =>
    [
      'gog-toggle-host',
      `gog-toggle-host--${this.resolvedSize()}`,
      `gog-toggle-host--label-${this.labelPosition()}`,
      this.hasTrackLabels() ? 'gog-toggle-host--track-labels' : null,
      this.fullWidth() ? 'gog-host--full-width' : null,
    ]
      .filter((className): className is string => className !== null)
      .join(' '),
  );

  constructor() {
    // Registering through NgControl instead of NG_VALUE_ACCESSOR matches the pattern used
    // by every other form control in the library — providing NG_VALUE_ACCESSOR on the
    // component while also injecting NgControl would be a dependency cycle.
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  writeValue(val: boolean): void {
    this.checked.set(val ?? false);
  }

  registerOnChange(fn: (val: boolean) => void): void {
    this.onCheckedChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  protected onInputChange(event: Event): void {
    if (this.isDisabled()) return;
    const next = (event.target as HTMLInputElement).checked;
    this.checked.set(next);
    this.onCheckedChange(next);
    this.onTouched();
  }

  protected onBlur(): void {
    if (this.isDisabled()) return;
    this.onTouched();
  }

  private onCheckedChange: (val: boolean) => void = () => {};

  private onTouched: () => void = () => {};
}
