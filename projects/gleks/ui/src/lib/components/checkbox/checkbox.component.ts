import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  signal,
  TemplateRef,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { GogSize } from '../../shared/types';
import {
  GOG_CHECKABLE_CONTROL_PADDING,
  GOG_CHECKABLE_CONTROL_SIZE_MAP,
} from '../../shared/checkable-control.config';

@Component({
  selector: 'gog-checkbox',
  imports: [IconComponent],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--gog-checkbox-box-size]': 'boxSize()',
    '[style.--gog-checkbox-label-size]': 'labelSize()',
    '[style.--gog-checkbox-icon-size]': 'iconSize()',
    '[style.--gog-checkbox-padding]': 'checkboxPadding',
    // Drives the :host(.gog-host--full-width) rules in the stylesheet — without this
    // binding the `fullWidth` input has no visible effect.
    '[class.gog-host--full-width]': 'fullWidth()',
  },
})
export class CheckboxComponent implements ControlValueAccessor {
  readonly label = input('');
  readonly ariaLabel = input('');
  readonly size = input<GogSize>('md');
  readonly indeterminate = input(false);
  readonly disabled = input(false);
  readonly fullWidth = input(false);
  readonly checkIconTemplate = input<TemplateRef<unknown> | null>(null);

  /**
   * Two-way bindable checked state: `[(checked)]="signal"`.
   * This is the same state Angular Forms drives via `writeValue`/`registerOnChange`
   * when the component is used with `formControlName`/`[formControl]`.
   * Don't wire both a form directive AND `[(checked)]` to the same instance —
   * pick one, otherwise you end up with two competing sources of truth.
   */
  readonly checked = model<boolean>(false);
  protected readonly controlSize = computed(() => GOG_CHECKABLE_CONTROL_SIZE_MAP[this.size()]);
  protected readonly boxSize = computed(() => this.controlSize().boxSize);
  protected readonly checkboxPadding = GOG_CHECKABLE_CONTROL_PADDING;
  protected readonly labelSize = computed(() => this.controlSize().labelSize);
  protected readonly iconSize = computed(() => this.controlSize().indicatorSize);
  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

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

  onInputChange(event: Event): void {
    if (this.isDisabled()) return;
    const input = event.target as HTMLInputElement;
    const next = input.checked;
    this.checked.set(next);
    this.onCheckedChange(next);
    this.onTouched();
  }

  onBlur(): void {
    if (this.isDisabled()) return;
    this.onTouched();
  }

  private onCheckedChange: (val: boolean) => void = () => {};

  private onTouched: () => void = () => {};
}
