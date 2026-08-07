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
import { GogErrorState, type GogErrorDisplay } from '../../shared/error-state';
import { GOG_CONFIG, resolveConfigured } from '../../shared/config';

/** Built-in defaults, used when neither the instance input nor `GOG_CONFIG` supplies one. */
const DEFAULT_SIZE: GogSize = 'md';
const DEFAULT_ERROR_DISPLAY: GogErrorDisplay = 'manual';
import {
  GOG_CHECKABLE_CONTROL_PADDING,
  GOG_CHECKABLE_CONTROL_SIZE_MAP,
} from '../../shared/checkable-control.config';

/** A single choice in a `gog-radio-group`. */
export interface GogRadioOption {
  id: string | number;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'gog-radio-group',
  imports: [],
  templateUrl: './radio-group.component.html',
  styleUrl: './radio-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--gog-radio-box-size]': 'boxSize()',
    '[style.--gog-radio-label-size]': 'labelSize()',
    '[style.--gog-radio-padding]': 'radioPadding',
    // Drives the :host(.gog-host--full-width) rules in the stylesheet — without this
    // binding the `fullWidth` input has no visible effect. Same convention as gog-checkbox.
    '[class.gog-host--full-width]': 'fullWidth()',
  },
})
export class RadioGroupComponent implements ControlValueAccessor {
  private static nextUid = 0;
  protected readonly uid = `gog-radio-group-${++RadioGroupComponent.nextUid}`;

  readonly options = input<GogRadioOption[]>([]);
  readonly label = input('');
  readonly ariaLabel = input('');
  /** Shared `name` for the underlying native radios. Auto-generated per instance if unset. */
  readonly name = input('');
  /** Unset, falls back to `GOG_CONFIG.control.size`, then to `'md'`. */
  readonly size = input<GogSize | undefined>(undefined);
  readonly disabled = input(false);
  readonly orientation = input<'horizontal' | 'vertical'>('vertical');
  readonly errorMessage = input('');
  /** See `GogErrorDisplay`. Defaults to `'manual'`, matching every other control in the library. */
  /** Unset, falls back to `GOG_CONFIG.control.errorDisplay`, then to `'manual'`. */
  readonly errorDisplay = input<GogErrorDisplay | undefined>(undefined);
  readonly fullWidth = input(false);

  /** Two-way bindable selected option id: `[(value)]="signal"`. */
  readonly value = model<string | number | null>(null);

  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly cvaDisabled = signal(false);
  private readonly globalConfig = inject(GOG_CONFIG);
  /** Instance input → `GOG_CONFIG` → the component's own default. See `resolveConfigured`. */
  protected readonly resolvedSize = computed(() =>
    resolveConfigured(this.size(), this.globalConfig.control?.size, DEFAULT_SIZE),
  );
  private readonly resolvedErrorDisplay = computed(() =>
    resolveConfigured(
      this.errorDisplay(),
      this.globalConfig.control?.errorDisplay,
      DEFAULT_ERROR_DISPLAY,
    ),
  );
  private readonly errorState = new GogErrorState(
    this.errorMessage,
    this.resolvedErrorDisplay,
    this.ngControl,
  );

  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  protected readonly controlSize = computed(
    () => GOG_CHECKABLE_CONTROL_SIZE_MAP[this.resolvedSize()],
  );
  protected readonly boxSize = computed(() => this.controlSize().boxSize);
  protected readonly labelSize = computed(() => this.controlSize().labelSize);
  protected readonly radioPadding = GOG_CHECKABLE_CONTROL_PADDING;
  protected readonly groupName = computed(() => this.name() || this.uid);
  protected readonly hasError = this.errorState.hasError;
  protected readonly visibleError = this.errorState.visibleError;
  protected readonly errorId = computed(() => (this.hasError() ? `${this.uid}-error` : null));
  protected readonly labelId = computed(() => (this.label() ? `${this.uid}-label` : null));

  private onChange: (val: string | number | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    // Registering through NgControl instead of NG_VALUE_ACCESSOR matches the pattern used
    // by every other form control in the library — providing NG_VALUE_ACCESSOR on the
    // component while also injecting NgControl would be a dependency cycle.
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  writeValue(val: string | number | null): void {
    this.value.set(val ?? null);
  }

  registerOnChange(fn: (val: string | number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  protected isOptionDisabled(option: GogRadioOption): boolean {
    return this.isDisabled() || !!option.disabled;
  }

  protected isSelected(option: GogRadioOption): boolean {
    return this.value() === option.id;
  }

  protected onOptionChange(event: Event, option: GogRadioOption): void {
    if (this.isOptionDisabled(option)) return;
    const input = event.target as HTMLInputElement;
    if (!input.checked) return;

    this.value.set(option.id);
    this.onChange(option.id);
  }

  protected onBlur(): void {
    this.onTouched();
  }
}
