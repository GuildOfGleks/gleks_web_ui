import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  model,
  TemplateRef,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { GogSize } from '../../shared/types';

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
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true,
    },
  ],
})
export class CheckboxComponent implements ControlValueAccessor {
  readonly label = input('');
  readonly ariaLabel = input('');
  readonly size = input<GogSize>('md');
  readonly indeterminate = input(false);
  readonly disabled = input(false);
  readonly checkIconTemplate = input<TemplateRef<unknown> | null>(null);

  /** Two-way bindable checked state: `[(checked)]="signal"`. */
  readonly checked = model<boolean>(false);

  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  protected readonly boxSize = computed(() => {
    switch (this.size()) {
      case 'sm':
        return '18px';
      case 'lg':
        return '32px';
      default:
        return '24px';
    }
  });
  protected readonly labelSize = computed(() => {
    switch (this.size()) {
      case 'sm':
        return '0.8125rem';
      case 'lg':
        return '1.0625rem';
      default:
        return '0.9375rem';
    }
  });
  protected readonly iconSize = computed(() => {
    switch (this.size()) {
      case 'sm':
        return '12px';
      case 'lg':
        return '18px';
      default:
        return '14px';
    }
  });

  private onCheckedChange: (val: boolean) => void = () => {};
  private onTouched: () => void = () => {};

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
}
