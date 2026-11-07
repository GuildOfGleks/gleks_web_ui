import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DoCheck,
  inject,
  input,
  model,
  signal,
  booleanAttribute,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

import { GogOrientation, GogSize } from '@guildofgleks/ui/shared';
import { nextGogControlId } from '@guildofgleks/ui/shared';
import { GogErrorState, type GogErrorDisplay } from '@guildofgleks/ui/shared';
import { GOG_CONFIG, resolveConfigured } from '@guildofgleks/ui/shared';
import { type GogOptionAccessor, readOption } from '@guildofgleks/ui/shared';

/** Built-in defaults, used when neither the instance input nor `GOG_CONFIG` supplies one. */
const DEFAULT_SIZE: GogSize = 'md';
const DEFAULT_ERROR_DISPLAY: GogErrorDisplay = 'manual';
import {
  GOG_CHECKABLE_CONTROL_PADDING,
  GOG_CHECKABLE_CONTROL_SIZE_MAP,
} from '@guildofgleks/ui/shared';

/** A single choice in a `gog-radio-group`, in the shape the accessors read by default. */
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
export class RadioGroupComponent implements ControlValueAccessor, DoCheck {
  protected readonly uid = nextGogControlId('gog-radio-group');

  /**
   * The choices: your own objects, read through `optionLabel` / `optionValue` / `optionDisabled`
   * like every other collection control. The defaults read `GogRadioOption`'s `label`, `id` and
   * `disabled`, so `{ id, label }` options work with no accessor at all.
   *
   * Not a generic component, unlike `gog-button-toggle-group`: making it one would change the type
   * `TestBed.createComponent(RadioGroupComponent)` returns in a consumer's own tests, which a minor
   * may not do. The accessors' option parameter is `never`, so a function written for your type —
   * `(plan: Plan) => plan.retired` — is accepted as it is.
   */
  // `any`, not `unknown`: before 21.19.0 this read as `GogRadioOption[]`, and code reading it back
  // (`group.options()[0].label`) must keep compiling in a minor.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly options = input<readonly any[]>([]);
  readonly optionLabel = input<GogOptionAccessor<never, string>>('label');
  /** What the group's value holds for an option: a string or a number, as `value` does. */
  readonly optionValue = input<GogOptionAccessor<never, string | number>>('id');
  readonly optionDisabled = input<GogOptionAccessor<never, boolean>>('disabled');
  readonly label = input('');
  readonly ariaLabel = input('');
  /** Shared `name` for the underlying native radios. Auto-generated per instance if unset. */
  readonly name = input('');
  /** Unset, falls back to `GOG_CONFIG.control.size`, then to `'md'`. */
  readonly size = input<GogSize | undefined>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly orientation = input<GogOrientation>('vertical');
  readonly errorMessage = input('');
  /** See `GogErrorDisplay`. Defaults to `'manual'`, matching every other control in the library. */
  /** Unset, falls back to `GOG_CONFIG.control.errorDisplay`, then to `'manual'`. */
  readonly errorDisplay = input<GogErrorDisplay | undefined>(undefined);
  readonly fullWidth = input(false, { transform: booleanAttribute });

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

  ngDoCheck(): void {
    this.errorState.check();
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

  protected labelOf(option: unknown): string {
    return String(readOption(option as never, this.optionLabel()) ?? '');
  }

  protected valueOf(option: unknown): string | number {
    return readOption(option as never, this.optionValue());
  }

  /** The option's own `disabled`, apart from the group's. */
  protected isOwnDisabled(option: unknown): boolean {
    return !!readOption(option as never, this.optionDisabled());
  }

  protected isOptionDisabled(option: unknown): boolean {
    return this.isDisabled() || this.isOwnDisabled(option);
  }

  protected isSelected(option: unknown): boolean {
    return this.value() === this.valueOf(option);
  }

  protected onOptionChange(event: Event, option: unknown): void {
    if (this.isOptionDisabled(option)) return;
    const input = event.target as HTMLInputElement;
    if (!input.checked) return;

    const value = this.valueOf(option);
    this.value.set(value);
    this.onChange(value);
  }

  protected onBlur(): void {
    this.onTouched();
  }
}
