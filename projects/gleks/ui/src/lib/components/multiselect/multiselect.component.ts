import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  TemplateRef,
  computed,
  contentChild,
  inject,
  input,
  model,
  viewChild,
} from '@angular/core';

import { GogDropdownBase, type GogDropdownOption } from '../../shared/dropdown-base';
import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '../icon/icon.component';
import { ScrollComponent } from '../scroll/scroll.component';

/**
 * @deprecated since 21.2.2 (2026-07-30) — use `GogDropdownOption` instead. Removed in 21.4.0.
 */
export type GogMultiselectOption = GogDropdownOption;

/** Height of the select-all/clear row, included in the panel height estimate. */
const CONTROLS_ROW_HEIGHT = 38;

/**
 * Custom markup for the multiselect's clear button:
 *
 * ```html
 * <ng-template gogMultiselectClearIcon><my-icon /></ng-template>
 * ```
 */
@Directive({ selector: '[gogMultiselectClearIcon]' })
export class GogMultiselectClearIconDirective {
  readonly templateRef = inject<TemplateRef<unknown>>(TemplateRef);
}

@Component({
  selector: 'gog-multiselect',
  imports: [ButtonComponent, IconComponent, NgTemplateOutlet, ScrollComponent],
  templateUrl: './multiselect.component.html',
  styleUrl: './multiselect.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiselectComponent extends GogDropdownBase<(string | number)[]> {
  readonly showControls = input(false);
  /** Where the "select all"/"clear" row sits relative to the option list. Sticky either way. */
  readonly controlsPosition = input<'top' | 'bottom'>('top');
  /**
   * @deprecated since 21.3.0 (2026-08-07) — project an `<ng-template gogMultiselectClearIcon>` into the component instead. Removed in 21.5.0.
   */
  readonly clearIconTemplate = input<TemplateRef<unknown> | null>(null);
  /** Projected `gogMultiselectClearIcon` template; wins over the deprecated `clearIconTemplate` input. */
  protected readonly clearIconSlot = contentChild(GogMultiselectClearIconDirective);

  /** Two-way bindable selected ids: `[(value)]="signal"`. */
  readonly value = model<(string | number)[]>([]);

  protected readonly panelTemplate = viewChild<TemplateRef<unknown>>('panelTpl');
  protected readonly emptyValue: (string | number)[] = [];
  protected readonly optionClass = 'gog-ms__option';
  protected readonly triggerClass = 'gog-ms';
  protected readonly sizeBlockClass = 'gog-ms-wrapper';
  protected readonly panelBlockClass = 'gog-ms__dropdown';
  protected override readonly optionGapToken = '--gog-ms-option-gap';
  protected override readonly optionsPaddingToken = '--gog-ms-options-padding';
  protected override readonly panelMaxHeightToken = '--gog-ms-panel-max-height';
  protected override readonly optionHeightToken = '--gog-ms-option-height';

  protected readonly listboxId = computed(() => `gog-ms-listbox-${this.uid}`);
  protected readonly labelId = computed(() => `gog-ms-label-${this.uid}`);

  readonly selectedNames = computed(() =>
    this.value()
      .map((id) => this.options().find((option) => option.id === id)?.name)
      .filter(Boolean)
      .join(', '),
  );
  protected readonly hasFloatValue = computed(() => this.value().length > 0);

  protected isSelected(id: string | number): boolean {
    return this.value().includes(id);
  }

  protected toggleOption(option: GogDropdownOption, event: MouseEvent): void {
    event.stopPropagation();
    if (option.disabled) return;

    const current = this.value();
    this.commitValue(
      this.isSelected(option.id)
        ? current.filter((id) => id !== option.id)
        : [...current, option.id],
    );
  }

  protected selectAll(event: MouseEvent): void {
    event.stopPropagation();
    this.commitValue(
      this.options()
        .filter((option) => !option.disabled)
        .map((option) => option.id),
    );
  }

  protected clearAll(event: Event): void {
    event.stopPropagation();
    this.commitValue([]);
  }

  protected override extraPanelHeight(): number {
    return this.showControls() ? CONTROLS_ROW_HEIGHT : 0;
  }
}
