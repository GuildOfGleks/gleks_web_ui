import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  GogInputAddonEndDirective,
  GogInputAddonStartDirective,
  InputfieldComponent,
  type GogFloatLabelVariant,
  type GogInputType,
  type GogSize,
} from '@guildofgleks/ui';

import { DocAttrs } from '../../doc/doc-attrs';
import { DocCell, DocMatrix } from '../../doc/doc-matrix';
import { DocPage } from '../../doc/doc-page';
import { DocSection } from '../../doc/doc-section';
import { INPUTFIELD_SCOPE_CONFIG, InputfieldConfigScope } from './inputfield-config-scope';

interface VisualState {
  readonly name: string;
  readonly disabled: boolean;
  readonly isReadonly: boolean;
  readonly errorMessage: string;
  readonly value: string;
}

interface TypeDemo {
  readonly name: string;
  readonly type: GogInputType;
  readonly placeholder: string;
}

type ContentKind = 'iconStart' | 'iconEnd' | 'addonStart' | 'addonEnd' | 'clearable';

interface ContentDemo {
  readonly name: string;
  readonly kind: ContentKind;
}

interface NumberState {
  readonly name: string;
  readonly showSpin: boolean | undefined;
  readonly min: number | null;
  readonly max: number | null;
  readonly step: number | null;
  readonly value: string;
  readonly clearable: boolean;
}

type EndSlotKind = 'default' | 'iconEnd' | 'addonEnd' | 'clearWins';

interface EndSlotDemo {
  readonly name: string;
  readonly kind: EndSlotKind;
}

interface FloatState {
  readonly name: string;
  readonly value: string;
}

@Component({
  selector: 'app-inputfield-page',
  imports: [
    JsonPipe,
    ReactiveFormsModule,
    InputfieldComponent,
    GogInputAddonStartDirective,
    GogInputAddonEndDirective,
    DocAttrs,
    DocCell,
    DocMatrix,
    DocPage,
    DocSection,
    InputfieldConfigScope,
  ],
  templateUrl: './inputfield-page.html',
  styleUrl: './inputfield-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputfieldPage {
  protected readonly sizes: readonly GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];

  protected readonly states: readonly VisualState[] = [
    { name: 'default', disabled: false, isReadonly: false, errorMessage: '', value: '' },
    {
      name: '[disabled]="true" value="Value"',
      disabled: true,
      isReadonly: false,
      errorMessage: '',
      value: 'Value',
    },
    {
      name: '[readonly]="true" value="Value"',
      disabled: false,
      isReadonly: true,
      errorMessage: '',
      value: 'Value',
    },
    {
      name: 'errorMessage="Required field"',
      disabled: false,
      isReadonly: false,
      errorMessage: 'Required field',
      value: '',
    },
  ];

  protected readonly types: readonly TypeDemo[] = [
    { name: 'text', type: 'text', placeholder: 'Jane Doe' },
    { name: 'password', type: 'password', placeholder: 'Enter password' },
    { name: 'email', type: 'email', placeholder: 'jane@example.com' },
    { name: 'number', type: 'number', placeholder: '0' },
    { name: 'search', type: 'search', placeholder: 'Search…' },
    { name: 'tel', type: 'tel', placeholder: '+1 555 0100' },
    { name: 'url', type: 'url', placeholder: 'https://example.com' },
    { name: 'date', type: 'date', placeholder: '' },
    { name: 'time', type: 'time', placeholder: '' },
    { name: 'datetime-local', type: 'datetime-local', placeholder: '' },
  ];

  protected readonly contents: readonly ContentDemo[] = [
    { name: 'iconStart="search"', kind: 'iconStart' },
    { name: 'iconEnd="star"', kind: 'iconEnd' },
    { name: '<span gogInputAddonStart>€</span>', kind: 'addonStart' },
    { name: '<span gogInputAddonEnd>kg</span>', kind: 'addonEnd' },
    { name: '[clearable]="true" value="Ada Lovelace"', kind: 'clearable' },
  ];

  protected readonly numberStates: readonly NumberState[] = [
    {
      name: 'value="5"',
      showSpin: undefined,
      min: null,
      max: null,
      step: null,
      value: '5',
      clearable: false,
    },
    {
      name: '[showSpinButtons]="false" value="5"',
      showSpin: false,
      min: null,
      max: null,
      step: null,
      value: '5',
      clearable: false,
    },
    {
      name: '[min]="0" [max]="10" [step]="2" value="10"',
      showSpin: undefined,
      min: 0,
      max: 10,
      step: 2,
      value: '10',
      clearable: false,
    },
    {
      name: '[min]="0" [max]="10" [step]="2" value="0"',
      showSpin: undefined,
      min: 0,
      max: 10,
      step: 2,
      value: '0',
      clearable: false,
    },
    {
      name: '[clearable]="true" value="5"',
      showSpin: undefined,
      min: null,
      max: null,
      step: null,
      value: '5',
      clearable: true,
    },
  ];

  protected readonly passwordDemos: readonly EndSlotDemo[] = [
    { name: 'default', kind: 'default' },
    { name: 'iconEnd="star"', kind: 'iconEnd' },
    { name: '<span gogInputAddonEnd>kg</span>', kind: 'addonEnd' },
  ];

  protected readonly numberEndSlotDemos: readonly EndSlotDemo[] = [
    { name: 'iconEnd="star" value="5"', kind: 'iconEnd' },
    { name: '<span gogInputAddonEnd>kg</span> value="5"', kind: 'addonEnd' },
    { name: '[clearable]="true" iconEnd="star" value="5"', kind: 'clearWins' },
  ];

  protected readonly floatLabelVariants: readonly GogFloatLabelVariant[] = [
    'none',
    'in',
    'on',
    'over',
  ];
  protected readonly floatStates: readonly FloatState[] = [
    { name: 'value unset', value: '' },
    { name: 'value="Ada Lovelace"', value: 'Ada Lovelace' },
  ];

  /** The single column of a matrix whose rows are the only axis. */
  protected readonly controlColumn = ['control'] as const;

  protected readonly scopeConfig = INPUTFIELD_SCOPE_CONFIG;
  protected readonly scopeAxis = ['outside scope', 'inside scope'] as const;
  protected readonly scopeColumns = [
    'size unset',
    'size="sm"',
    'clearable unset, value="42"',
  ] as const;

  protected readonly a11yStates = [
    'default',
    '[disabled]="true"',
    '[readonly]="true" value="Ada"',
    'errorMessage="Required"',
    'inputMode="numeric"',
    '[spellcheck]="false"',
  ] as const;
  protected readonly a11yColumns = ['input'] as const;

  protected readonly spinA11yStates = ['value="5"', '[max]="10" value="10"'] as const;

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
