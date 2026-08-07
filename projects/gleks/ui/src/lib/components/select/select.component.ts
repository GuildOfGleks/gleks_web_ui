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
import { IconComponent } from '../icon/icon.component';
import { ScrollComponent } from '../scroll/scroll.component';

/**
 * @deprecated since 21.2.2 (2026-07-30) — use `GogDropdownOption` instead. Removed in 21.4.0.
 */
export type GogSelectOption = GogDropdownOption;

@Component({
  selector: 'gog-select',
  imports: [IconComponent, NgTemplateOutlet, ScrollComponent],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectComponent extends GogDropdownBase<string | number | null> {
  readonly inputId = input('');

  /** Two-way bindable selected value: `[(value)]="signal"`. */
  readonly value = model<string | number | null>(null);

  protected readonly panelTemplate = viewChild<TemplateRef<unknown>>('panelTpl');
  protected readonly emptyValue = null;
  protected readonly optionClass = 'gog-select__option';
  protected readonly triggerClass = 'gog-select__control';
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
    () => this.options().find((option) => String(option.id) === String(this.value())) ?? null,
  );
  protected readonly hasFloatValue = computed(() => this.value() !== null);

  protected isSelected(id: string | number): boolean {
    return this.selectedOption()?.id === id;
  }

  protected selectOption(option: GogDropdownOption, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (option.disabled) return;

    this.commitValue(option.id);
    this.close();
  }
}
