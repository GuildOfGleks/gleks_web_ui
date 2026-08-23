import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  computed,
  input,
  model,
  viewChild,
} from '@angular/core';

import { GogDropdownBase, type GogDropdownOption } from '../../shared/dropdown-base';
import { GogRippleDirective } from '../ripple/ripple.directive';
import { IconComponent } from '../icon/icon.component';
import { ScrollComponent } from '../scroll/scroll.component';

@Component({
  selector: 'gog-select',
  imports: [GogRippleDirective, IconComponent, NgTemplateOutlet, ScrollComponent],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    // Only bites when the control has opted out of full width; otherwise the container decides.
    '[style.--gog-select-min-width]': 'minWidth()',
  },
})
export class SelectComponent<
  TOption = GogDropdownOption,
  TValue = string | number | null,
> extends GogDropdownBase<TValue, TOption> {
  readonly inputId = input('');

  /**
   * Two-way bindable selected value: `[(value)]="signal"`.
   *
   * Carries whatever `optionValue` resolves to — an id by default, or the option object itself
   * when `optionValue` is `null`. `TValue` is inferred from the signal you bind, so a
   * `WritableSignal<string | null>` keeps typing exactly as before.
   */
  readonly value = model<TValue>(null as TValue);

  protected readonly panelTemplate = viewChild<TemplateRef<unknown>>('panelTpl');
  /** A cleared select is `null`, whatever `TValue` the consumer bound. */
  protected readonly emptyValue = null as TValue;
  protected readonly optionClass = 'gog-select__option';
  protected readonly triggerClass = 'gog-select__control';
  /** Opt-in: a select had no clear affordance before 21.3.0. */
  protected readonly clearableByDefault = false;
  protected readonly sizeBlockClass = 'gog-select';
  protected readonly panelBlockClass = 'gog-select__dropdown';
  protected override readonly optionGapToken = '--gog-select-option-gap';
  protected override readonly panelMaxHeightToken = '--gog-select-panel-max-height';
  protected override readonly optionHeightToken = '--gog-select-option-height';

  protected readonly triggerId = computed(() => this.inputId() || `gog-select-${this.uid}`);
  protected readonly listboxId = computed(() => `${this.triggerId()}-listbox`);
  protected readonly labelId = computed(() => `${this.triggerId()}-label`);
  protected readonly errorId = computed(() =>
    this.hasError() ? `${this.triggerId()}-error` : null,
  );

  protected readonly selectedOption = computed(
    () =>
      this.options().find((option) => this.sameValue(this.valueOf(option), this.value())) ?? null,
  );
  protected readonly selectedLabel = computed(() => {
    const option = this.selectedOption();
    return option === null ? '' : this.labelOf(option);
  });
  protected readonly hasFloatValue = computed(() => this.value() != null);

  protected isSelected(option: TOption): boolean {
    return this.sameValue(this.valueOf(option), this.value());
  }

  protected selectOption(option: TOption, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.isOptionDisabled(option)) return;

    this.commitValue(this.valueOf(option) as TValue);
    this.close();
  }
}
