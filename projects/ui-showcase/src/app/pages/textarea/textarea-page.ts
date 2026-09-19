import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  TextareaComponent,
  type GogFloatLabelVariant,
  type GogSize,
  type GogTextareaResize,
} from '@guildofgleks/ui';

import { DocAttrs } from '../../doc/doc-attrs';
import { DocCell, DocMatrix } from '../../doc/doc-matrix';
import { DocPage } from '../../doc/doc-page';
import { DocSection } from '../../doc/doc-section';
import { TEXTAREA_SCOPE_CONFIG, TextareaConfigScope } from './textarea-config-scope';

interface VisualState {
  readonly name: string;
  readonly disabled: boolean;
  readonly isReadonly: boolean;
  readonly errorMessage: string;
  readonly value: string;
}

interface Labelled<T> {
  readonly name: string;
  readonly value: T;
}

const SHORT_TEXT = 'Ship on Friday.';
const LONG_TEXT = [
  'A first line long enough to run the whole width of the field and reach its end edge.',
  'Second line.',
  'Third line.',
  'Fourth line.',
  'Fifth line, past the four visible rows, so the field scrolls.',
  'Sixth line.',
].join('\n');

@Component({
  selector: 'app-textarea-page',
  imports: [
    JsonPipe,
    ReactiveFormsModule,
    TextareaComponent,
    DocAttrs,
    DocCell,
    DocMatrix,
    DocPage,
    DocSection,
    TextareaConfigScope,
  ],
  templateUrl: './textarea-page.html',
  styleUrl: './textarea-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextareaPage {
  protected readonly sizes: readonly GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];

  protected readonly states: readonly VisualState[] = [
    { name: 'default', disabled: false, isReadonly: false, errorMessage: '', value: '' },
    {
      name: '[disabled]="true" value="Notes"',
      disabled: true,
      isReadonly: false,
      errorMessage: '',
      value: 'Notes',
    },
    {
      name: '[readonly]="true" value="Notes"',
      disabled: false,
      isReadonly: true,
      errorMessage: '',
      value: 'Notes',
    },
    {
      name: 'errorMessage="Required field"',
      disabled: false,
      isReadonly: false,
      errorMessage: 'Required field',
      value: '',
    },
  ];

  protected readonly rowCounts: readonly Labelled<number>[] = [
    { name: '[rows]="2"', value: 2 },
    { name: 'rows unset (4)', value: 4 },
    { name: '[rows]="8"', value: 8 },
  ];

  protected readonly resizes: readonly Labelled<GogTextareaResize>[] = [
    { name: 'resize unset (vertical)', value: 'vertical' },
    { name: 'resize="horizontal"', value: 'horizontal' },
    { name: 'resize="both"', value: 'both' },
    { name: 'resize="none"', value: 'none' },
  ];
  protected readonly resizeStates: readonly Labelled<boolean>[] = [
    { name: 'enabled', value: false },
    { name: '[disabled]="true"', value: true },
  ];

  protected readonly clearValues: readonly Labelled<string>[] = [
    { name: '[clearable]="true", one line', value: SHORT_TEXT },
    { name: '[clearable]="true", long first line and overflowing', value: LONG_TEXT },
  ];

  protected readonly floatLabelVariants: readonly GogFloatLabelVariant[] = [
    'none',
    'in',
    'on',
    'over',
  ];
  protected readonly floatStates: readonly Labelled<string>[] = [
    { name: 'value unset', value: '' },
    { name: 'value="Ship on Friday."', value: SHORT_TEXT },
  ];

  /** The single column of a matrix whose rows are the only axis. */
  protected readonly controlColumn = ['control'] as const;

  protected readonly scopeConfig = TEXTAREA_SCOPE_CONFIG;
  protected readonly scopeAxis = ['outside scope', 'inside scope'] as const;
  protected readonly scopeColumns = [
    'size unset',
    'size="sm"',
    'clearable, resize unset, value="Notes"',
  ] as const;

  protected readonly a11yStates = [
    'default',
    '[disabled]="true"',
    '[readonly]="true" value="Notes"',
    'errorMessage="Required"',
    '[spellcheck]="false"',
  ] as const;
  protected readonly a11yColumns = ['textarea'] as const;

  protected readonly clearA11yStates = [
    'clearAriaLabel unset',
    'clearAriaLabel="Erase notes"',
  ] as const;

  protected readonly shortText = SHORT_TEXT;

  protected readonly boundValue = signal('');
  protected readonly formControl = new FormControl('', {
    nonNullable: true,
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
