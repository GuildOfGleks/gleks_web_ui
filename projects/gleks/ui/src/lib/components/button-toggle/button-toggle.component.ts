import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  TemplateRef,
  computed,
  contentChild,
  inject,
  input,
  model,
  signal,
  viewChildren,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

import { NgTemplateOutlet } from '@angular/common';

import { IconComponent, type GogIconName } from '../icon/icon.component';
import { GOG_CONFIG, resolveConfigured } from '../../shared/config';
import {
  type GogOptionAccessor,
  isSameOptionValue,
  readOption,
} from '../../shared/option-accessor';
import { handleRovingFocusKeydown } from '../../shared/roving-focus';
import { GogButtonToggleAppearance, GogOrientation, GogSize } from '../../shared/types';

/** Built-in defaults, used when neither the instance input nor `GOG_CONFIG` supplies one. */
const DEFAULT_SIZE: GogSize = 'md';

/** Context handed to a `gogButtonToggleOption` template. */
export interface GogButtonToggleOptionContext<TOption> {
  /** The consumer's own option object, untouched. */
  $implicit: TOption;
  selected: boolean;
  disabled: boolean;
  /** The resolved label, so custom markup can decorate it rather than re-derive it. */
  label: string;
}

/**
 * Custom markup for one button in the group:
 *
 * ```html
 * <gog-button-toggle-group [options]="views">
 *   <ng-template gogButtonToggleOption let-view let-selected="selected">
 *     <gog-icon [name]="view.icon" /> {{ view.title }}
 *   </ng-template>
 * </gog-button-toggle-group>
 * ```
 */
@Directive({ selector: '[gogButtonToggleOption]' })
export class GogButtonToggleOptionDirective<TOption = unknown> {
  readonly templateRef = inject<TemplateRef<GogButtonToggleOptionContext<TOption>>>(TemplateRef);

  static ngTemplateContextGuard<TOption>(
    _dir: GogButtonToggleOptionDirective<TOption>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- only used as a type guard
    ctx: unknown,
  ): ctx is GogButtonToggleOptionContext<TOption> {
    return true;
  }
}

/**
 * A row of buttons where one — or, with `multiple`, several — can be picked.
 *
 * ```html
 * <gog-button-toggle-group [options]="alignments" [(value)]="align" />
 * <gog-button-toggle-group [options]="tools" [multiple]="true" [(value)]="active" />
 * ```
 *
 * Takes the consumer's own objects through `optionLabel` / `optionValue` / `optionDisabled`
 * accessors — the same ones `gog-select` uses — rather than a fixed `{ id, label }` shape.
 *
 * **Single and multiple are different widgets to assistive tech, not a cosmetic switch.**
 * Single mode is a radio group: `role="radiogroup"` / `role="radio"` with `aria-checked`, and
 * the arrow keys move *and* select, because that is what a radio group does. Multiple mode is
 * a toolbar of independent toggles: `role="group"` with `aria-pressed`, arrows only move and
 * Space toggles. Getting this backwards is the usual defect in this component.
 */
@Component({
  selector: 'gog-button-toggle-group',
  imports: [IconComponent, NgTemplateOutlet],
  templateUrl: './button-toggle.component.html',
  styleUrl: './button-toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
    '[attr.role]': 'multiple() ? "group" : "radiogroup"',
    '[attr.aria-label]': 'ariaLabel() || null',
    '[attr.aria-orientation]': 'orientation()',
    '[attr.aria-disabled]': 'isDisabled() ? "true" : null',
  },
})
export class ButtonToggleGroupComponent<
  TOption = unknown,
  TValue = unknown,
> implements ControlValueAccessor {
  readonly options = input<TOption[]>([]);
  readonly optionLabel = input<GogOptionAccessor<TOption, string>>('name');
  /**
   * How an option turns into the emitted value. `null` emits the **option object itself**,
   * exactly as `gog-select` does, so a consumer's DTO survives the round trip.
   */
  readonly optionValue = input<GogOptionAccessor<TOption, unknown> | null>('id');
  readonly optionDisabled = input<GogOptionAccessor<TOption, boolean>>('disabled');
  /** Optional leading icon per option. Unset means no icons anywhere in the group. */
  readonly optionIcon = input<GogOptionAccessor<TOption, GogIconName | null> | null>(null);

  /** Whether more than one option can be active at a time. */
  readonly multiple = input(false);
  readonly appearance = input<GogButtonToggleAppearance>('joined');
  readonly orientation = input<GogOrientation>('horizontal');
  /** Unset, falls back to `GOG_CONFIG.control.size`, then to `'md'`. */
  readonly size = input<GogSize | undefined>(undefined);
  readonly disabled = input(false);
  readonly fullWidth = input(false);
  readonly ariaLabel = input('');

  /**
   * Two-way bindable selection: `[(value)]="signal"`. A single value in single mode, an array
   * in `multiple` mode. Also drivable through `formControl` / `formControlName`.
   */
  readonly value = model<TValue | TValue[] | null>(null);

  protected readonly optionSlot = contentChild(GogButtonToggleOptionDirective);
  private readonly buttonRefs = viewChildren<ElementRef<HTMLButtonElement>>('toggleButton');

  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly cvaDisabled = signal(false);
  private readonly globalConfig = inject(GOG_CONFIG);

  /** Instance input → `GOG_CONFIG` → the component's own default. See `resolveConfigured`. */
  protected readonly resolvedSize = computed(() =>
    resolveConfigured(this.size(), this.globalConfig.control?.size, DEFAULT_SIZE),
  );
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  /** The current selection as an array, whatever mode the group is in. */
  private readonly selectedValues = computed<unknown[]>(() => {
    const current = this.value();
    if (current === null || current === undefined) return [];
    return Array.isArray(current) ? current : [current];
  });

  protected readonly hostClasses = computed(() =>
    [
      'gog-button-toggle',
      `gog-button-toggle--${this.appearance()}`,
      `gog-button-toggle--${this.orientation()}`,
      `gog-button-toggle--${this.resolvedSize()}`,
      this.fullWidth() ? 'gog-host--full-width' : null,
    ]
      .filter((className): className is string => className !== null)
      .join(' '),
  );

  /**
   * A roving tabindex: the group is one tab stop and the arrows move within it. The *selected*
   * option is the one that keeps `tabindex="0"` so Tab returns to where the user left off;
   * with nothing selected, the first enabled option takes it, since a group nobody can Tab
   * into is unreachable by keyboard.
   */
  protected readonly tabStopIndex = computed(() => {
    const options = this.options();
    const selected = options.findIndex(
      (option) => this.isSelected(option) && !this.isOptionDisabled(option),
    );
    if (selected !== -1) return selected;
    const firstEnabled = options.findIndex((option) => !this.isOptionDisabled(option));
    return firstEnabled === -1 ? 0 : firstEnabled;
  });

  private onChange: (val: TValue | TValue[] | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    // Registering through NgControl instead of NG_VALUE_ACCESSOR matches the pattern used
    // by every other form control in the library — providing NG_VALUE_ACCESSOR on the
    // component while also injecting NgControl would be a dependency cycle.
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  writeValue(val: TValue | TValue[] | null): void {
    this.value.set(val ?? null);
  }

  registerOnChange(fn: (val: TValue | TValue[] | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  protected labelOf(option: TOption): string {
    return String(readOption(option, this.optionLabel()) ?? '');
  }

  protected iconOf(option: TOption): GogIconName | null {
    const accessor = this.optionIcon();
    return accessor ? (readOption(option, accessor) ?? null) : null;
  }

  protected valueOf(option: TOption): unknown {
    const accessor = this.optionValue();
    return accessor === null ? option : readOption(option, accessor);
  }

  protected isOptionDisabled(option: TOption): boolean {
    return this.isDisabled() || !!readOption(option, this.optionDisabled());
  }

  protected isSelected(option: TOption): boolean {
    const target = this.valueOf(option);
    return this.selectedValues().some((selected) => isSameOptionValue(selected, target));
  }

  protected optionContext(option: TOption): GogButtonToggleOptionContext<TOption> {
    return {
      $implicit: option,
      selected: this.isSelected(option),
      disabled: this.isOptionDisabled(option),
      label: this.labelOf(option),
    };
  }

  protected onOptionClick(option: TOption): void {
    if (this.isOptionDisabled(option)) return;
    this.commit(option);
  }

  /**
   * Arrow keys. In single mode moving also selects — that is the radio-group contract, and it
   * is why `role="radio"` is only used there. In multiple mode the arrows are pure navigation
   * and Space/Enter (handled natively by the `<button>`) does the toggling.
   */
  protected onKeydown(event: KeyboardEvent): void {
    const buttons = this.buttonRefs().map((ref) => ref.nativeElement);
    const options = this.options();
    const moved = handleRovingFocusKeydown(event, buttons, {
      orientation: this.orientation(),
      isDisabled: (_button, index) => this.isOptionDisabled(options[index]),
    });

    if (!moved || this.multiple()) return;

    const focusedIndex = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (focusedIndex !== -1) {
      this.commit(options[focusedIndex]);
    }
  }

  protected onBlur(): void {
    this.onTouched();
  }

  private commit(option: TOption): void {
    const target = this.valueOf(option) as TValue;

    if (!this.multiple()) {
      this.setValue(target);
      return;
    }

    const current = this.selectedValues();
    const next = this.isSelected(option)
      ? (current.filter((selected) => !isSameOptionValue(selected, target)) as TValue[])
      : ([...current, target] as TValue[]);
    this.setValue(next);
  }

  private setValue(next: TValue | TValue[]): void {
    this.value.set(next);
    this.onChange(next);
    this.onTouched();
  }
}
