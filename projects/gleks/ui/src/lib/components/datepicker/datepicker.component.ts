import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  DoCheck,
  ElementRef,
  PLATFORM_ID,
  TemplateRef,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

import { NgTemplateOutlet } from '@angular/common';

import { CalendarComponent, type GogDatepickerValue } from './calendar/calendar.component';
import { IconComponent } from '../icon/icon.component';
import { GOG_CONFIG, resolveConfigured } from '../../shared/config';
import { GogClearableState } from '../../shared/clearable-state';
import { GogErrorState, type GogErrorDisplay } from '../../shared/error-state';
import { GogFloatLabelState } from '../../shared/float-label-state';
import { GogDropdownOverlay } from '../../shared/dropdown-overlay';
import {
  type GogDropdownDirection,
  type GogDropdownPlacement,
  resolveDropdownPlacement,
} from '../../shared/dropdown-position';
import {
  GogDateSelectionMode,
  GogFloatLabelVariant,
  GogHourFormat,
  GogSize,
} from '../../shared/types';
import { type GogDateRange, formatDate, parseDate } from './date-utils';

/** Built-in defaults, used when neither the instance input nor `GOG_CONFIG` supplies one. */
const DEFAULT_SIZE: GogSize = 'md';
const DEFAULT_ERROR_DISPLAY: GogErrorDisplay = 'manual';
const DEFAULT_APPEND_TO_BODY = false;
const DEFAULT_DIRECTION: GogDropdownDirection = 'auto';
const DEFAULT_LOCALE = 'en-US';
const DEFAULT_DATE_FORMAT = 'dd.MM.yyyy';
const DEFAULT_TIME_FORMAT = 'HH:mm';
const DEFAULT_CLEAR_DATE_LABEL = 'Clear date';
const DEFAULT_OPEN_CALENDAR_LABEL = 'Open calendar';
/** Rough panel height fed into the up/down placement math before it is on screen. */
const ESTIMATED_PANEL_HEIGHT = 330;

export type { GogDateRange, GogDatepickerValue };

/**
 * A date field with a calendar panel.
 *
 * ```html
 * <gog-datepicker [(value)]="date" label="Date of birth" [max]="today" />
 * <gog-datepicker selectionMode="range" [(value)]="range" [numberOfMonths]="2" />
 * <gog-datepicker [showTime]="true" hourFormat="24" [(value)]="when" />
 * ```
 *
 * Native `Date`, no date library and no adapter abstraction: this package has zero runtime
 * dependencies, and pulling one in for a single component would be the largest dependency
 * decision it has ever made. `Intl` covers month and weekday names; the display/parse format is
 * a token pattern (`dd.MM.yyyy`) so what is written can always be read back — see
 * `date-utils.ts`, which also explains why nothing here goes near `toISOString()`.
 *
 * The calendar itself is `gog-calendar`, exported separately and usable on its own. `inline`
 * mode is literally that component rendered without this field.
 */
@Component({
  selector: 'gog-datepicker',
  imports: [CalendarComponent, IconComponent, NgTemplateOutlet],
  templateUrl: './datepicker.component.html',
  styleUrl: './datepicker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.gog-host--auto-width]': '!fullWidth()',
  },
})
export class DatepickerComponent implements ControlValueAccessor, DoCheck {
  private static nextUid = 0;
  protected readonly uid = ++DatepickerComponent.nextUid;

  readonly inputId = input('');
  readonly label = input('');
  readonly ariaLabel = input('');
  readonly placeholder = input('');
  readonly selectionMode = input<GogDateSelectionMode>('single');
  readonly min = input<Date | null>(null);
  readonly max = input<Date | null>(null);
  readonly disabledDates = input<((date: Date) => boolean) | null>(null);
  readonly defaultMonth = input<Date | null>(null);
  readonly numberOfMonths = input(1);
  readonly showTime = input(false);
  readonly hourFormat = input<GogHourFormat>('24');
  readonly minuteStep = input(1);
  readonly showSeconds = input(false);
  /** The "Today" button in the panel's footer, which **selects** today's date. */
  readonly showTodayButton = input(true);
  /**
   * A second footer button that only moves the *view* back to the current month, leaving the
   * selection alone. Off by default; see `gog-calendar` for why the two are separate controls.
   */
  readonly showThisMonthButton = input(false);
  /**
   * Forwarded to `gog-calendar`. Left unset they stay `undefined` all the way down, so the
   * calendar resolves them against `GOG_CONFIG.labels` itself rather than receiving an English
   * default from here that would shadow the app's own.
   */
  readonly todayLabel = input<string | undefined>(undefined);
  readonly thisMonthLabel = input<string | undefined>(undefined);
  /**
   * Display and parse pattern (`dd.MM.yyyy`, `yyyy-MM-dd`, …). Left unset it is derived from
   * `showTime`, so switching the time section on does not also require restating the format.
   */
  readonly format = input<string | null>(null);
  /** Unset, falls back to `GOG_CONFIG.datepicker.locale`, then to `'en-US'`. */
  readonly locale = input<string | undefined>(undefined);
  /** Unset, falls back to `GOG_CONFIG.datepicker.firstDayOfWeek`, then to the locale's own. */
  readonly firstDayOfWeek = input<number | undefined>(undefined);
  /**
   * Whether the date can be typed as well as picked. Typed text is parsed against `format`;
   * text that isn't a real date leaves the value untouched and is reverted on blur, rather
   * than silently resetting the field.
   */
  readonly allowTextInput = input(true);
  /** Renders the calendar directly, with no field and no panel. */
  readonly inline = input(false);
  readonly disabled = input(false);
  readonly fullWidth = input(true);
  readonly clearable = input<boolean | undefined>(undefined);
  /** Unset, falls back to `GOG_CONFIG.labels.clearDate`, then to `'Clear date'`. */
  readonly clearAriaLabel = input<string | undefined>(undefined);
  readonly errorMessage = input('');
  readonly errorDisplay = input<GogErrorDisplay | undefined>(undefined);
  readonly size = input<GogSize | undefined>(undefined);
  readonly floatLabel = input<GogFloatLabelVariant | undefined>(undefined);
  readonly floatLabelShowPlaceholder = input<boolean | undefined>(undefined);
  readonly appendToBody = input<boolean | undefined>(undefined);
  readonly dropdownDirection = input<GogDropdownDirection | undefined>(undefined);
  readonly dropdownZIndex = input<number | null>(null);
  /** Unset, falls back to `GOG_CONFIG.labels.openCalendar`, then to `'Open calendar'`. */
  readonly openCalendarLabel = input<string | undefined>(undefined);

  /** Two-way bindable value: a `Date` in `'single'` mode, a `GogDateRange` in `'range'`. */
  readonly value = model<GogDatepickerValue>(null);

  readonly isOpen = signal(false);

  private readonly elRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly destroyRef = inject(DestroyRef);
  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly globalConfig = inject(GOG_CONFIG);
  private readonly overlay = new GogDropdownOverlay(inject(ApplicationRef), this.document);

  protected readonly panelTemplate = viewChild<TemplateRef<unknown>>('panelTpl');

  private readonly cvaDisabled = signal(false);
  protected readonly isFocused = signal(false);
  protected readonly panelPlacement = signal<GogDropdownPlacement | null>(null);
  protected readonly directionState = signal<'up' | 'down'>('down');
  /** What is in the `<input>`; diverges from `value` only while the user is typing. */
  protected readonly text = signal('');
  /**
   * Whether the user is part-way through typing a date.
   *
   * Deliberately **not** the same thing as "the field has focus": picking a date from the
   * calendar hands focus back to the field, and keying the guard on focus meant the text was
   * then refused — you would pick a date and watch the field stay empty.
   */
  private readonly isEditing = signal(false);

  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  /** Instance input → `GOG_CONFIG.labels` → the built-in English default. */
  protected readonly resolvedClearLabel = computed(() =>
    resolveConfigured(
      this.clearAriaLabel(),
      this.globalConfig.labels?.clearDate,
      DEFAULT_CLEAR_DATE_LABEL,
    ),
  );
  protected readonly resolvedOpenCalendarLabel = computed(() =>
    resolveConfigured(
      this.openCalendarLabel(),
      this.globalConfig.labels?.openCalendar,
      DEFAULT_OPEN_CALENDAR_LABEL,
    ),
  );
  protected readonly resolvedSize = computed(() =>
    resolveConfigured(this.size(), this.globalConfig.control?.size, DEFAULT_SIZE),
  );
  protected readonly resolvedErrorDisplay = computed(() =>
    resolveConfigured(
      this.errorDisplay(),
      this.globalConfig.control?.errorDisplay,
      DEFAULT_ERROR_DISPLAY,
    ),
  );
  protected readonly resolvedAppendToBody = computed(() =>
    resolveConfigured(
      this.appendToBody(),
      this.globalConfig.dropdown?.appendToBody,
      DEFAULT_APPEND_TO_BODY,
    ),
  );
  protected readonly resolvedDirection = computed(() =>
    resolveConfigured(
      this.dropdownDirection(),
      this.globalConfig.dropdown?.direction,
      DEFAULT_DIRECTION,
    ),
  );
  protected readonly resolvedLocale = computed(() =>
    resolveConfigured(this.locale(), this.globalConfig.datepicker?.locale, DEFAULT_LOCALE),
  );
  protected readonly resolvedFirstDayOfWeek = computed(
    () => this.firstDayOfWeek() ?? this.globalConfig.datepicker?.firstDayOfWeek ?? null,
  );
  /** Derived from `showTime` so turning the clock on doesn't also require a new format. */
  protected readonly resolvedFormat = computed(() => {
    const explicit = this.format() ?? this.globalConfig.datepicker?.format;
    if (explicit) return explicit;
    return this.showTime() ? `${DEFAULT_DATE_FORMAT} ${DEFAULT_TIME_FORMAT}` : DEFAULT_DATE_FORMAT;
  });

  private readonly errorState = new GogErrorState(
    this.errorMessage,
    this.resolvedErrorDisplay,
    this.ngControl,
  );
  protected readonly hasError = this.errorState.hasError;
  protected readonly visibleError = this.errorState.visibleError;

  protected readonly hasValue = computed(() => {
    const current = this.value();
    if (current === null) return false;
    if (current instanceof Date) return true;
    return current.start !== null || current.end !== null;
  });

  private readonly clearableState = new GogClearableState(
    this.clearable,
    this.hasValue,
    this.isDisabled,
    this.globalConfig,
    () => false,
  );
  protected readonly showClear = this.clearableState.isVisible;

  private readonly floatLabelState = new GogFloatLabelState(
    this.floatLabel,
    this.floatLabelShowPlaceholder,
    this.placeholder,
    this.isFocused,
    this.hasValue,
    this.globalConfig,
  );
  protected readonly resolvedFloatLabel = this.floatLabelState.variant;
  protected readonly isFloatLabelActive = this.floatLabelState.isActive;
  protected readonly isFloatLabelFloated = this.floatLabelState.isFloated;
  protected readonly effectivePlaceholder = this.floatLabelState.effectivePlaceholder;

  protected readonly triggerId = computed(() => this.inputId() || `gog-datepicker-${this.uid}`);
  protected readonly panelId = computed(() => `${this.triggerId()}-panel`);
  protected readonly labelId = computed(() => `${this.triggerId()}-label`);
  protected readonly errorId = computed(() =>
    this.hasError() ? `${this.triggerId()}-error` : null,
  );

  protected readonly sizeClass = computed(() =>
    this.resolvedSize() === DEFAULT_SIZE ? '' : `gog-datepicker--${this.resolvedSize()}`,
  );

  /** How `value` reads in the field. A half-picked range shows only its start. */
  protected readonly displayText = computed(() => {
    const current = this.value();
    const pattern = this.resolvedFormat();
    if (current === null) return '';
    if (current instanceof Date) return formatDate(current, pattern);

    const start = current.start ? formatDate(current.start, pattern) : '';
    const end = current.end ? formatDate(current.end, pattern) : '';
    if (!start) return '';
    return end ? `${start} — ${end}` : start;
  });

  private onChangeFn: (val: GogDatepickerValue) => void = () => {};
  private onTouchedFn: () => void = () => {};
  private repositionFrame: number | null = null;

  constructor() {
    // Registering through NgControl instead of NG_VALUE_ACCESSOR keeps `this.ngControl`
    // available for `hasError` — providing NG_VALUE_ACCESSOR while also injecting NgControl
    // would be a dependency cycle.
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
    this.destroyRef.onDestroy(() => this.overlay.detach());

    // The field follows the value except while it is being typed into.
    effect(() => {
      const formatted = this.displayText();
      if (!this.isEditing()) {
        this.text.set(formatted);
      }
    });

    this.bindWhileOpen();
  }

  ngDoCheck(): void {
    this.errorState.check();
  }

  writeValue(val: GogDatepickerValue): void {
    this.value.set(val ?? null);
  }

  registerOnChange(fn: (val: GogDatepickerValue) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
    if (isDisabled) this.close();
  }

  protected toggle(): void {
    if (this.isDisabled()) return;
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  protected open(): void {
    if (this.isDisabled() || this.isOpen() || this.inline()) return;

    this.isOpen.set(true);
    this.updatePlacement();

    if (this.resolvedAppendToBody() && this.isBrowser) {
      const template = this.panelTemplate();
      if (template) this.overlay.attach(template, this.elRef.nativeElement);
    }
  }

  protected close(): void {
    if (!this.isOpen()) return;

    this.isOpen.set(false);
    this.overlay.detach();
    this.onTouchedFn();
  }

  /** A completed selection closes the panel; a half-picked range leaves it open. */
  protected onCalendarSelect(next: GogDatepickerValue): void {
    this.isEditing.set(false);
    this.commit(next);
    if (!this.showTime()) {
      this.close();
      this.focusTrigger();
    }
  }

  /** Every calendar change, including the half-picked ones, has to reach the form. */
  protected onCalendarValue(next: GogDatepickerValue): void {
    this.isEditing.set(false);
    this.commit(next);
  }

  protected onTextInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    this.isEditing.set(true);
    this.text.set(raw);

    if (!this.allowTextInput() || this.selectionMode() === 'range') return;

    if (raw.trim() === '') {
      this.commit(null);
      return;
    }

    const parsed = parseDate(raw, this.resolvedFormat());
    // An unparseable draft leaves the value alone rather than clearing it: the user is
    // mid-way through typing a date almost every keystroke, and wiping the value each time
    // would fire a stream of nulls at an attached form.
    if (parsed) {
      this.commit(parsed);
    }
  }

  protected onFocus(): void {
    this.isFocused.set(true);
  }

  protected onBlur(): void {
    this.isFocused.set(false);
    this.isEditing.set(false);
    // Snap back to whatever the value actually is, discarding an unfinished draft.
    this.text.set(this.displayText());
    this.onTouchedFn();
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isOpen()) {
      event.preventDefault();
      this.close();
      return;
    }
    if ((event.key === 'ArrowDown' || event.key === 'Enter') && !this.isOpen()) {
      event.preventDefault();
      this.open();
    }
  }

  protected clearValue(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.isEditing.set(false);
    this.commit(null);
    this.text.set('');
  }

  protected focusTrigger(): void {
    this.elRef.nativeElement.querySelector<HTMLElement>('.gog-datepicker__control')?.focus();
  }

  private commit(next: GogDatepickerValue): void {
    this.value.set(next);
    this.onChangeFn(next);
  }

  /**
   * Binds click-outside and reposition listeners only while the panel is open — bound
   * permanently, every datepicker on the page would run a handler on every document click and
   * every scroll frame whether or not it is showing anything.
   */
  private bindWhileOpen(): void {
    effect((onCleanup) => {
      if (!this.isOpen() || !this.isBrowser) return;

      const onDocumentClick = (event: MouseEvent) => this.closeIfClickedOutside(event);
      const onReflow = () => this.scheduleReposition();

      // Capture phase: scroll does not bubble, so a bubble-phase listener on window would miss
      // scrolling inside a nested container — the case appendToBody exists for.
      this.document.addEventListener('click', onDocumentClick);
      window.addEventListener('scroll', onReflow, { passive: true, capture: true });
      window.addEventListener('resize', onReflow, { passive: true });

      onCleanup(() => {
        this.document.removeEventListener('click', onDocumentClick);
        window.removeEventListener('scroll', onReflow, { capture: true });
        window.removeEventListener('resize', onReflow);
        if (this.repositionFrame !== null) {
          cancelAnimationFrame(this.repositionFrame);
          this.repositionFrame = null;
        }
      });
    });
  }

  private closeIfClickedOutside(event: MouseEvent): void {
    const target = event.target as Node | null;
    if (!target) return;

    const inside =
      this.elRef.nativeElement.contains(target) ||
      (this.overlay.hostElement?.contains(target) ?? false);
    if (!inside) this.close();
  }

  private scheduleReposition(): void {
    if (this.repositionFrame !== null) return;

    this.repositionFrame = requestAnimationFrame(() => {
      this.repositionFrame = null;
      if (this.isOpen()) this.updatePlacement();
    });
  }

  private updatePlacement(): void {
    if (!this.isBrowser) return;

    const trigger = this.elRef.nativeElement.querySelector<HTMLElement>('.gog-datepicker__field');
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const placement = resolveDropdownPlacement(
      this.resolvedDirection(),
      { top: rect.top, bottom: rect.bottom, left: rect.left, width: rect.width },
      ESTIMATED_PANEL_HEIGHT,
      window.innerHeight,
    );

    this.panelPlacement.set(placement);
    this.directionState.set(placement.direction);
  }
}
