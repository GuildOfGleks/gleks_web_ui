import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  GogDropdownChevronDirective,
  GogDropdownOptionDirective,
  IconComponent,
  SelectComponent,
  type GogDropdownDirection,
  type GogDropdownOption,
  type GogFloatLabelVariant,
  type GogSize,
} from '@guildofgleks/ui';

import { DocAttrs } from '../../doc/doc-attrs';
import { DocCell, DocMatrix } from '../../doc/doc-matrix';
import { DocPage } from '../../doc/doc-page';
import { DocSection } from '../../doc/doc-section';
import { SELECT_SCOPE_CONFIG, SelectConfigScope } from './select-config-scope';

type OptionValue = string | number | null;

interface VisualState {
  readonly name: string;
  readonly value: OptionValue;
  readonly disabled: boolean;
  readonly errorMessage: string;
}

interface Labelled<T> {
  readonly name: string;
  readonly value: T;
}

/** A DTO with no `id`/`name` at all — the shape a real API returns. */
interface Member {
  readonly uuid: string;
  readonly profile: { readonly fullName: string; readonly role: string };
  readonly suspended: boolean;
}

@Component({
  selector: 'app-select-page',
  imports: [
    JsonPipe,
    ReactiveFormsModule,
    GogDropdownChevronDirective,
    GogDropdownOptionDirective,
    IconComponent,
    SelectComponent,
    DocAttrs,
    DocCell,
    DocMatrix,
    DocPage,
    DocSection,
    SelectConfigScope,
  ],
  templateUrl: './select-page.html',
  styleUrl: './select-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectPage {
  protected readonly sizes: readonly GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];

  protected readonly frameworks: GogDropdownOption[] = [
    { id: 'angular', name: 'Angular' },
    { id: 'react', name: 'React' },
    { id: 'vue', name: 'Vue' },
    { id: 'svelte', name: 'Svelte' },
  ];

  /** One option disabled through the default `optionDisabled` path. */
  protected readonly plans: GogDropdownOption[] = [
    { id: 'free', name: 'Free' },
    { id: 'pro', name: 'Pro' },
    { id: 'enterprise', name: 'Enterprise (contact sales)', disabled: true },
  ];

  protected readonly countries: GogDropdownOption[] = Array.from({ length: 20 }, (_, i) => ({
    id: `country-${i}`,
    name: `Country ${i + 1}`,
  }));

  /**
   * Long enough that the difference is the point: unwindowed this stamps 10 000 rows to show
   * about six, which measures at 512ms before the panel appears, against 21ms windowed.
   */
  protected readonly cities: GogDropdownOption[] = Array.from({ length: 10000 }, (_, i) => ({
    id: `city-${i}`,
    name: `City ${(i + 1).toLocaleString('en-US')}`,
  }));

  protected readonly members: Member[] = [
    { uuid: 'u1', profile: { fullName: 'Ada Lovelace', role: 'Maintainer' }, suspended: false },
    { uuid: 'u2', profile: { fullName: 'Alan Turing', role: 'Reviewer' }, suspended: false },
    { uuid: 'u3', profile: { fullName: 'Grace Hopper', role: 'Admin' }, suspended: true },
  ];
  protected readonly memberLabel = (member: Member) => member.profile.fullName;

  protected readonly states: readonly VisualState[] = [
    { name: 'value unset (placeholder)', value: null, disabled: false, errorMessage: '' },
    { name: 'value="angular"', value: 'angular', disabled: false, errorMessage: '' },
    {
      name: '[disabled]="true" value="angular"',
      value: 'angular',
      disabled: true,
      errorMessage: '',
    },
    {
      name: 'errorMessage="Required field"',
      value: null,
      disabled: false,
      errorMessage: 'Required field',
    },
  ];

  protected readonly directions: readonly Labelled<GogDropdownDirection>[] = [
    { name: 'dropdownDirection unset (auto)', value: 'auto' },
    { name: 'dropdownDirection="down"', value: 'down' },
    { name: 'dropdownDirection="up"', value: 'up' },
  ];

  protected readonly floatLabelVariants: readonly GogFloatLabelVariant[] = [
    'none',
    'in',
    'on',
    'over',
  ];
  protected readonly floatStates: readonly Labelled<OptionValue>[] = [
    { name: 'value unset', value: null },
    { name: 'value="angular"', value: 'angular' },
  ];

  /** The single column of a matrix whose rows are the only axis. */
  protected readonly controlColumn = ['control'] as const;

  protected readonly scopeConfig = SELECT_SCOPE_CONFIG;
  protected readonly scopeAxis = ['outside scope', 'inside scope'] as const;
  protected readonly scopeColumns = [
    'size unset',
    'size="sm"',
    'clearable, filter unset, value="angular"',
  ] as const;

  protected readonly a11yStates = [
    'default',
    'value="angular"',
    '[disabled]="true"',
    'errorMessage="Required"',
    'label unset, ariaLabel="Framework"',
  ] as const;
  protected readonly a11yColumns = ['trigger'] as const;

  protected readonly clearA11yStates = [
    'clearAriaLabel unset',
    'clearAriaLabel="Clear framework"',
  ] as const;

  /** Prefix matching instead of the default case-insensitive substring. */
  protected readonly prefixMatch = (option: GogDropdownOption, query: string) =>
    option.name.toLowerCase().startsWith(query.toLowerCase());

  protected readonly boundValue = signal<OptionValue>(null);
  protected readonly memberId = signal<string | null>('u1');
  /** With `[optionValue]="null"` the control hands back the object, not an id. */
  protected readonly member = signal<Member | null>(null);
  protected readonly plan = signal<OptionValue>('free');

  protected readonly formControl = new FormControl<OptionValue>(null, {
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
