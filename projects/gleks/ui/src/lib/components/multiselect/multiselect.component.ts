import { fitLabels, type GogMultiselectSummary } from './fit-labels';
import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  TemplateRef,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  contentChild,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';

import { resolveConfigured } from '../../shared/config';
import { GogDropdownBase, type GogDropdownOption } from '../../shared/dropdown-base';
import { ButtonComponent } from '../button/button.component';
import { GogRippleDirective } from '../ripple/ripple.directive';
import { IconComponent } from '../icon/icon.component';
import { ScrollComponent } from '../scroll/scroll.component';
import { GogTooltipDirective } from '../tooltip/tooltip.directive';

/** Height of the select-all/clear row, included in the panel height estimate. */
const CONTROLS_ROW_HEIGHT = 38;

/** Built-in defaults, used when neither the instance input nor `GOG_CONFIG.labels` supplies one. */
const DEFAULT_SELECT_ALL_LABEL = 'Select all';
const DEFAULT_CLEAR_ALL_LABEL = 'Clear';

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
  imports: [
    ButtonComponent,
    GogRippleDirective,
    IconComponent,
    NgTemplateOutlet,
    ScrollComponent,
    GogTooltipDirective,
  ],
  templateUrl: './multiselect.component.html',
  styleUrl: './multiselect.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    // Only bites when the control has opted out of full width; otherwise the container decides.
    '[style.--gog-multiselect-min-width]': 'minWidth()',
  },
})
export class MultiselectComponent<
  TOption = GogDropdownOption,
  TValue = string | number,
> extends GogDropdownBase<TValue[], TOption> {
  readonly showControls = input(false);
  /** Where the "select all"/"clear" row sits relative to the option list. Sticky either way. */
  readonly controlsPosition = input<'top' | 'bottom'>('top');
  /**
   * Visible text of the select-all button. Unset, falls back to `GOG_CONFIG.labels.selectAll`,
   * then to `'Select all'`.
   */
  readonly selectAllLabel = input<string | undefined>(undefined);
  /**
   * Visible text of the clear-all button — the one inside the panel, next to select-all. The
   * trigger's own clear icon is `clearAriaLabel`. Unset, falls back to
   * `GOG_CONFIG.labels.clearAll`, then to `'Clear'`.
   */
  readonly clearAllLabel = input<string | undefined>(undefined);
  /** Projected `gogMultiselectClearIcon` template, replacing the clear-all glyph. */
  protected readonly clearIconSlot = contentChild(GogMultiselectClearIconDirective);

  /** Instance input → `GOG_CONFIG.labels` → the built-in English default. */
  protected readonly resolvedSelectAllLabel = computed(() =>
    resolveConfigured(
      this.selectAllLabel(),
      this.globalConfig.labels?.selectAll,
      DEFAULT_SELECT_ALL_LABEL,
    ),
  );
  protected readonly resolvedClearAllLabel = computed(() =>
    resolveConfigured(
      this.clearAllLabel(),
      this.globalConfig.labels?.clearAll,
      DEFAULT_CLEAR_ALL_LABEL,
    ),
  );

  /**
   * Two-way bindable selection: `[(value)]="signal"`.
   *
   * Each entry is whatever `optionValue` resolves to — an id by default, or the option objects
   * themselves when `optionValue` is `null`.
   */
  readonly value = model<TValue[]>([]);

  protected readonly panelTemplate = viewChild<TemplateRef<unknown>>('panelTpl');
  protected readonly emptyValue: TValue[] = [];
  protected readonly optionClass = 'gog-ms__option';
  protected readonly triggerClass = 'gog-ms';
  /**
   * On by default: this control shipped a clear button before `clearable` existed, so the
   * default preserves it. Set `[clearable]="false"` to drop it.
   */
  protected readonly clearableByDefault = true;
  protected readonly sizeBlockClass = 'gog-ms-wrapper';
  protected readonly panelBlockClass = 'gog-ms__dropdown';
  protected override readonly optionGapToken = '--gog-ms-option-gap';
  protected override readonly optionsPaddingToken = '--gog-ms-options-padding';
  protected override readonly panelMaxHeightToken = '--gog-ms-panel-max-height';
  protected override readonly optionHeightToken = '--gog-ms-option-height';

  protected readonly listboxId = computed(() => `gog-ms-listbox-${this.uid}`);
  protected readonly labelId = computed(() => `gog-ms-label-${this.uid}`);

  /** Labels of the current selection, driven off the selected *options* so it works whatever
   * `optionValue` resolves to. */
  readonly selectedLabels = computed(() =>
    this.options()
      .filter((option) => this.isSelected(option))
      .map((option) => this.labelOf(option)),
  );

  /** Comma-joined selection — the full text, before any overflow trimming. */
  readonly selectedNames = computed(() => this.selectedLabels().join(', '));

  private readonly valueRef = viewChild<ElementRef<HTMLElement>>('valueEl');
  private readonly resizeDestroyRef = inject(DestroyRef);
  /** Width available to the summary text, tracked so the split recomputes as the field resizes. */
  private readonly valueWidth = signal(0);
  private readonly valueFont = signal('');

  /**
   * Splits the selection into what fits on one line and a `+N` remainder.
   *
   * Measured with `canvas.measureText` rather than by rendering candidates and reading back
   * layout: the greedy fit is O(n) over the labels and costs no reflow, where a DOM-based probe
   * would thrash layout on every keystroke-sized change.
   */
  protected readonly summary = computed<GogMultiselectSummary>(() => {
    const labels = this.selectedLabels();
    const width = this.valueWidth();
    const font = this.valueFont();
    if (labels.length === 0) return { text: '', hidden: 0 };
    if (!this.isBrowser || width === 0 || font === '') {
      return { text: labels.join(', '), hidden: 0 };
    }

    return fitLabels(labels, width, measureWith(font));
  });
  protected readonly hasFloatValue = computed(() => this.value().length > 0);

  protected isSelected(option: TOption): boolean {
    const target = this.valueOf(option);
    return this.value().some((selected) => this.sameValue(selected, target));
  }

  protected toggleOption(option: TOption, event: MouseEvent): void {
    event.stopPropagation();
    if (this.isOptionDisabled(option)) return;

    const target = this.valueOf(option);
    const current = this.value();
    this.commitValue(
      this.isSelected(option)
        ? current.filter((selected) => !this.sameValue(selected, target))
        : [...current, target as TValue],
    );
  }

  /** Acts on the *visible* options, so "select all" under an active filter means what it says. */
  protected selectAll(event: MouseEvent): void {
    event.stopPropagation();
    this.commitValue(
      this.visibleOptions()
        .filter((option) => !this.isOptionDisabled(option))
        .map((option) => this.valueOf(option) as TValue),
    );
  }

  protected clearAll(event: Event): void {
    event.stopPropagation();
    this.commitValue([]);
  }

  constructor() {
    super();
    // Measured entirely from a ResizeObserver rather than an after-render hook: the field is
    // usually full width, so the space available to the summary changes when the *container*
    // resizes — something Angular never renders for. `observe()` also fires once immediately,
    // which covers the initial measurement, so one mechanism handles both.
    afterNextRender(() => {
      const el = this.valueRef()?.nativeElement;
      if (!el || typeof ResizeObserver === 'undefined') return;

      const read = () => {
        this.valueWidth.set(el.clientWidth);
        this.valueFont.set(getComputedStyle(el).font);
      };
      const observer = new ResizeObserver(read);
      observer.observe(el);
      read();
      this.resizeDestroyRef.onDestroy(() => observer.disconnect());
    });
  }

  protected override extraPanelHeight(): number {
    return this.showControls() ? CONTROLS_ROW_HEIGHT : 0;
  }
}

/** One shared 2D context; creating a canvas per measurement is what makes this approach slow. */
let measureContext: CanvasRenderingContext2D | null = null;

function measureWith(font: string): (text: string) => number {
  measureContext ??= document.createElement('canvas').getContext('2d');
  const ctx = measureContext;
  if (!ctx) return () => 0;
  ctx.font = font;
  return (text: string) => ctx.measureText(text).width;
}
