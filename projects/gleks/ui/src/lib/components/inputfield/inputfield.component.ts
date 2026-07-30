import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DoCheck,
  inject,
  input,
  model,
  TemplateRef,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

import { GogErrorState, type GogErrorDisplay } from '../../shared/error-state';
import { GogSize } from '../../shared/types';
import { IconComponent, type GogIconName } from '../icon/icon.component';

@Component({
  selector: 'gog-inputfield',
  imports: [IconComponent],
  templateUrl: './inputfield.component.html',
  styleUrl: './inputfield.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputfieldComponent implements ControlValueAccessor, DoCheck {
  readonly label = input('');
  readonly placeholder = input('');
  readonly type = input<'text' | 'password' | 'email'>('text');
  /** Defaults to 'current-password' for password fields, 'off' otherwise */
  readonly autocomplete = input('');
  readonly errorMessage = input('');
  /** See `GogErrorDisplay`. Defaults to `'manual'`, matching every other control in the library. */
  readonly errorDisplay = input<GogErrorDisplay>('manual');
  readonly name = input('');
  readonly inputId = input('');
  readonly disabled = input(false);
  readonly size = input<GogSize>('md');
  /** Default icon name for the leading icon. */
  readonly iconStart = input<GogIconName | ''>('');
  /** Default icon name for the trailing icon. */
  readonly iconEnd = input<GogIconName | ''>('');
  /** Custom leading icon template. */
  readonly iconStartTemplate = input<TemplateRef<unknown> | null>(null);
  /** Custom trailing icon template. */
  readonly iconEndTemplate = input<TemplateRef<unknown> | null>(null);
  /** When provided, the start icon becomes a clickable button invoking this fn */
  readonly iconStartFn = input<(() => void) | null>(null);
  /** When provided, the end icon becomes a clickable button invoking this fn */
  readonly iconEndFn = input<(() => void) | null>(null);
  /** aria-label for the start icon button (required when iconStartFn is set) */
  readonly iconStartLabel = input('');
  /** aria-label for the end icon button (required when iconEndFn is set) */
  readonly iconEndLabel = input('');
  /** aria-label for the reveal-password button, shown when `type` is `'password'` */
  readonly showPasswordLabel = input('Show password');
  /** aria-label for the hide-password button, shown once the password is revealed */
  readonly hidePasswordLabel = input('Hide password');

  /** Two-way bindable value: `[(value)]="signal"` or `[value]` / `(valueChange)`. */
  readonly value = model<string>('');

  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly cvaDisabled = signal(false);
  private readonly errorState = new GogErrorState(
    this.errorMessage,
    this.errorDisplay,
    this.ngControl,
  );
  private readonly passwordVisible = signal(false);

  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  protected readonly isPasswordField = computed(() => this.type() === 'password');
  protected readonly effectiveType = computed(() =>
    this.isPasswordField() && this.passwordVisible() ? 'text' : this.type(),
  );
  protected readonly effectiveAutocomplete = computed(
    () => this.autocomplete() || (this.type() === 'password' ? 'current-password' : 'off'),
  );
  protected readonly hasError = this.errorState.hasError;
  protected readonly visibleError = this.errorState.visibleError;
  protected readonly hasIconStart = computed(
    () => !!this.iconStartTemplate() || !!this.iconStart(),
  );
  protected readonly hasIconStartAction = computed(() => !!this.iconStartFn());

  /** For password fields the trailing icon is always the built-in show/hide toggle. */
  protected readonly effectiveIconEnd = computed<GogIconName | ''>(() =>
    this.isPasswordField() ? (this.passwordVisible() ? 'eye-off' : 'eye') : this.iconEnd(),
  );
  protected readonly effectiveIconEndLabel = computed(() =>
    this.isPasswordField()
      ? this.passwordVisible()
        ? this.hidePasswordLabel()
        : this.showPasswordLabel()
      : this.iconEndLabel(),
  );
  protected readonly hasIconEnd = computed(
    () => !!this.iconEndTemplate() || !!this.effectiveIconEnd(),
  );
  protected readonly hasIconEndAction = computed(
    () => this.isPasswordField() || !!this.iconEndFn(),
  );

  private _onChange: (val: string) => void = () => {};
  private _onTouched: () => void = () => {};

  constructor() {
    // Registering through NgControl instead of NG_VALUE_ACCESSOR keeps `this.ngControl`
    // available for `hasError` — providing NG_VALUE_ACCESSOR on the component while also
    // injecting NgControl would be a dependency cycle.
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngDoCheck(): void {
    this.errorState.check();
  }

  writeValue(val: string): void {
    this.value.set(val ?? '');
  }

  registerOnChange(fn: (val: string) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  protected onIconStartClick(): void {
    this.iconStartFn()?.();
  }

  protected onIconEndClick(): void {
    if (this.isPasswordField()) {
      this.passwordVisible.update((visible) => !visible);
      return;
    }
    this.iconEndFn()?.();
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value.set(input.value);
    this._onChange(input.value);
  }

  onBlur(): void {
    this._onTouched();
  }
}
