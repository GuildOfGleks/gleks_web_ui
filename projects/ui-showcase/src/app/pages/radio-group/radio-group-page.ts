import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  RadioGroupComponent,
  type GogOrientation,
  type GogRadioOption,
  type GogSize,
} from '@guildofgleks/ui';

import { DocAttrs } from '../../doc/doc-attrs';
import { DocCell, DocMatrix } from '../../doc/doc-matrix';
import { DocPage } from '../../doc/doc-page';
import { DocSection } from '../../doc/doc-section';
import { RADIO_GROUP_SCOPE_CONFIG, RadioGroupConfigScope } from './radio-group-config-scope';

interface VisualState {
  readonly name: string;
  readonly value: string | null;
  readonly disabled: boolean;
  readonly errorMessage: string;
}

interface Layout {
  readonly name: string;
  readonly orientation: GogOrientation;
  readonly fullWidth: boolean;
}

@Component({
  selector: 'app-radio-group-page',
  imports: [
    JsonPipe,
    ReactiveFormsModule,
    RadioGroupComponent,
    DocAttrs,
    DocCell,
    DocMatrix,
    DocPage,
    DocSection,
    RadioGroupConfigScope,
  ],
  templateUrl: './radio-group-page.html',
  styleUrl: './radio-group-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioGroupPage {
  protected readonly sizes: readonly GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];

  protected readonly plans: GogRadioOption[] = [
    { id: 'free', label: 'Free' },
    { id: 'pro', label: 'Pro' },
    { id: 'enterprise', label: 'Enterprise', disabled: true },
  ];

  /** Numeric ids: `value` is the id itself, so it comes back as a number. */
  protected readonly seats: GogRadioOption[] = [
    { id: 1, label: '1 seat' },
    { id: 5, label: '5 seats' },
    { id: 25, label: '25 seats' },
  ];

  protected readonly longOptions: GogRadioOption[] = [
    { id: 'keep', label: 'Keep a copy on this device and sync changes when a connection is back' },
    { id: 'discard', label: 'Discard local changes' },
  ];

  protected readonly states: readonly VisualState[] = [
    { name: 'value unset', value: null, disabled: false, errorMessage: '' },
    { name: 'value="pro"', value: 'pro', disabled: false, errorMessage: '' },
    { name: '[disabled]="true" value="pro"', value: 'pro', disabled: true, errorMessage: '' },
    {
      name: 'errorMessage="Pick a plan"',
      value: null,
      disabled: false,
      errorMessage: 'Pick a plan',
    },
  ];

  protected readonly layouts: readonly Layout[] = [
    { name: 'orientation unset (vertical)', orientation: 'vertical', fullWidth: false },
    { name: 'orientation="horizontal"', orientation: 'horizontal', fullWidth: false },
    { name: '[fullWidth]="true"', orientation: 'vertical', fullWidth: true },
    {
      name: 'orientation="horizontal" [fullWidth]="true"',
      orientation: 'horizontal',
      fullWidth: true,
    },
  ];

  /** The single column of a matrix whose rows are the only axis. */
  protected readonly controlColumn = ['control'] as const;

  protected readonly scopeConfig = RADIO_GROUP_SCOPE_CONFIG;
  protected readonly scopeAxis = ['outside scope', 'inside scope'] as const;
  protected readonly scopeColumns = ['size unset', 'size="sm"'] as const;

  protected readonly groupA11yStates = [
    'label="Plan"',
    'label unset, ariaLabel="Plan"',
    'errorMessage="Pick a plan"',
    '[disabled]="true"',
  ] as const;

  protected readonly optionA11yStates = [
    'an option',
    'an option with disabled: true',
    'an option in a [disabled]="true" group',
  ] as const;

  protected readonly bound = signal<string | number | null>('pro');
  protected readonly seatCount = signal<string | number | null>(5);

  protected readonly formControl = new FormControl<string | number | null>(
    null,
    Validators.required,
  );
  protected readonly formDisabled = signal(false);

  private readonly counts = signal<Readonly<Record<string, number>>>({});

  protected count(key: string): number {
    return this.counts()[key] ?? 0;
  }

  protected increment(key: string): void {
    this.counts.update((counts) => ({ ...counts, [key]: (counts[key] ?? 0) + 1 }));
  }

  protected typeOf(value: unknown): string {
    return value === null ? 'null' : typeof value;
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
