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

  /**
   * Renders only the options in view instead of all of them.
   *
   * For lists long enough that stamping every row is the cost: 10 000 options build 10 000 DOM
   * nodes to show about six, which measures at 216ms of build and layout before Angular does any
   * of its own work, and 50 000 at over a second. Windowed, that is a fixed ~20 rows whatever the
   * count is.
   *
   * **Opt in per field, or app-wide with `GOG_CONFIG.dropdown.virtualize`; never automatic.** A
   * windowed list behaves differently in ways nothing about the data predicts -- `Ctrl+F` finds
   * only what is rendered, a screen reader's "list all items" reads the window rather than the
   * list (the count stays honest through `aria-setsize`, the rows do not), and CSS targeting
   * `:last-child` matches the last *rendered* row.
   *
   * Two things it also changes, both only while it is on. Scrolling a keyboard-focused row out
   * of view hands focus back to the trigger, because the row it was on no longer exists. And the
   * rows are laid out by a spacer above and below rather than by their own count, so a consumer
   * stylesheet reaching into the options list by position will not find what it expects.
   *
   * @default false
   */
  readonly virtualize = input<boolean | undefined>(undefined);
  protected override readonly virtualizeRequest = this.virtualize;

  protected readonly panelTemplate = viewChild<TemplateRef<unknown>>('panelTpl');
  /** A cleared select is `null`, whatever `TValue` the consumer bound. */
  protected readonly emptyValue = null as TValue;
  protected readonly optionClass = 'gog-select__option';
  protected readonly triggerClass = 'gog-select__control';
  /** Opt-in: a select had no clear affordance before 21.3.0. */
  protected readonly clearableByDefault = false;
  protected readonly sizeBlockClass = 'gog-select';
  protected readonly panelBlockClass = 'gog-select__dropdown';
  /*
   * `optionGapToken` is deliberately not overridden. `--gog-select-option-gap` is the gap *inside*
   * a row -- between the check mark and the label -- and the options container declares no gap
   * between rows at all, so the base's undeclared default resolving to zero is the
   * truth. Pointing the seed at this token by its name added 12px of panel per row to
   * the height estimate that up/down placement is decided from.
   */
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
