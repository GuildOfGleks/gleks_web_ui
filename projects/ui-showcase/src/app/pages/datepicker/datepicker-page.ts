import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  formatDate,
  type GogDateRange,
  type GogFloatLabelVariant,
  type GogSize,
} from '@guildofgleks/ui';
import {
  CalendarComponent,
  DatepickerComponent,
  type GogDatepickerValue,
} from '@guildofgleks/ui/datepicker';

import { DocAttrs } from '../../doc/doc-attrs';
import { DocCell, DocMatrix } from '../../doc/doc-matrix';
import { DocPage } from '../../doc/doc-page';
import { DocSection } from '../../doc/doc-section';
import { DATEPICKER_SCOPE_CONFIG, DatepickerConfigScope } from './datepicker-config-scope';

interface VisualState {
  readonly name: string;
  readonly value: Date | null;
  readonly disabled: boolean;
  readonly errorMessage: string;
}

interface Labelled<T> {
  readonly name: string;
  readonly value: T;
}

/*
 * Built once, at midnight, so every demo on the page agrees on what "today" is — and so a cell
 * cannot straddle a day boundary while the page is open. A prerendered page carries the build's
 * date until the client takes over, which is why nothing here is asserted against a fixed string.
 */
const NOW = new Date();
const TODAY = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate());

@Component({
  selector: 'app-datepicker-page',
  imports: [
    JsonPipe,
    ReactiveFormsModule,
    CalendarComponent,
    DatepickerComponent,
    DocAttrs,
    DocCell,
    DocMatrix,
    DocPage,
    DocSection,
    DatepickerConfigScope,
  ],
  templateUrl: './datepicker-page.html',
  styleUrl: './datepicker-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerPage {
  protected readonly sizes: readonly GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];

  protected readonly today = TODAY;
  protected readonly monthStart = new Date(TODAY.getFullYear(), TODAY.getMonth(), 1);
  protected readonly monthEnd = new Date(TODAY.getFullYear(), TODAY.getMonth() + 1, 0);
  /** A year out, so the "Today" button has nothing it is allowed to pick. */
  protected readonly nextYear = new Date(TODAY.getFullYear() + 1, TODAY.getMonth(), 1);

  /** Weekends are unpickable — a predicate, which a list of dates could not express. */
  protected readonly noWeekends = (date: Date): boolean =>
    date.getDay() === 0 || date.getDay() === 6;

  protected readonly states: readonly VisualState[] = [
    { name: 'value unset', value: null, disabled: false, errorMessage: '' },
    { name: '[value]="today"', value: TODAY, disabled: false, errorMessage: '' },
    { name: '[disabled]="true"', value: TODAY, disabled: true, errorMessage: '' },
    {
      name: 'errorMessage="Choose a date"',
      value: null,
      disabled: false,
      errorMessage: 'Choose a date',
    },
  ];

  protected readonly floatLabelVariants: readonly GogFloatLabelVariant[] = [
    'none',
    'in',
    'on',
    'over',
  ];
  protected readonly floatStates: readonly Labelled<Date | null>[] = [
    { name: 'value unset', value: null },
    { name: '[value]="today"', value: TODAY },
  ];

  /** The single column of a matrix whose rows are the only axis. */
  protected readonly controlColumn = ['control'] as const;

  protected readonly locales: readonly Labelled<string>[] = [
    { name: 'en-US (default)', value: 'en-US' },
    { name: 'de-DE', value: 'de-DE' },
    { name: 'ja-JP', value: 'ja-JP' },
  ];

  protected readonly scopeConfig = DATEPICKER_SCOPE_CONFIG;
  protected readonly scopeAxis = ['outside scope', 'inside scope'] as const;
  protected readonly scopeColumns = [
    'size unset',
    'locale and firstDayOfWeek unset',
    'format unset',
  ] as const;

  protected readonly a11yStates = [
    'default',
    '[value]="today"',
    '[disabled]="true"',
    'errorMessage="Required"',
    'selectionMode="range"',
    'label unset, ariaLabel="Date"',
  ] as const;
  protected readonly a11yColumns = ['input'] as const;

  protected readonly buttonA11yStates = [
    'openCalendarLabel unset',
    'openCalendarLabel="Pick a date"',
  ] as const;
  protected readonly clearA11yStates = [
    'clearAriaLabel unset',
    'clearAriaLabel="Clear the date"',
  ] as const;

  protected readonly date = signal<Date | null>(null);
  protected readonly range = signal<GogDateRange | null>(null);
  protected readonly withTime = signal<Date | null>(null);
  protected readonly inlineDate = signal<Date | null>(null);
  protected readonly calendarDate = signal<Date | null>(TODAY);
  protected readonly lastSelect = signal<string>('none yet');

  protected readonly formControl = new FormControl<GogDatepickerValue>(null, {
    validators: [Validators.required],
  });
  protected readonly formDisabled = signal(false);

  private readonly counts = signal<Readonly<Record<string, number>>>({});

  protected count(key: string): number {
    return this.counts()[key] ?? 0;
  }

  protected increment(key: string): void {
    this.counts.update((counts) => ({ ...counts, [key]: (counts[key] ?? 0) + 1 }));
  }

  /** What a `GogDatepickerValue` reads as, whichever of its three shapes it is holding. */
  protected show(value: GogDatepickerValue, pattern = 'dd.MM.yyyy'): string {
    if (value === null) return 'null';
    if (value instanceof Date) return formatDate(value, pattern);

    const start = value.start ? formatDate(value.start, pattern) : '…';
    const end = value.end ? formatDate(value.end, pattern) : '…';
    return `{ start: ${start}, end: ${end} }`;
  }

  protected recordSelect(value: GogDatepickerValue): void {
    this.increment('select');
    this.lastSelect.set(this.show(value));
  }

  protected toggleFormDisabled(): void {
    const next = !this.formDisabled();
    this.formDisabled.set(next);
    if (next) {
      this.formControl.disable();
    } else {
      this.formControl.enable();
    }
  }
}
