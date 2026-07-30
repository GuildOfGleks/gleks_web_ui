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

/** @deprecated Prefer `GogDropdownOption`; kept as an alias so existing imports keep working. */
export type GogSelectOption = GogDropdownOption;

@Component({
  selector: 'gog-select',
  imports: [IconComponent, NgTemplateOutlet],
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

  protected readonly triggerId = computed(() => this.inputId() || `gog-select-${this.uid}`);
  protected readonly listboxId = computed(() => `${this.triggerId()}-listbox`);
  protected readonly labelId = computed(() => `${this.triggerId()}-label`);
  protected readonly errorId = computed(() => (this.hasError() ? `${this.triggerId()}-error` : null));

  protected readonly selectedOption = computed(
    () => this.options().find((option) => String(option.id) === String(this.value())) ?? null,
  );

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
