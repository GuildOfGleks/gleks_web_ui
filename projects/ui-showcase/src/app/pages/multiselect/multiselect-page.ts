import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  GogDropdownChevronDirective,
  GogDropdownOptionDirective,
  GogMultiselectClearIconDirective,
  IconComponent,
  MultiselectComponent,
  type GogDropdownOption,
  type GogFloatLabelVariant,
  type GogSize,
} from '@guildofgleks/ui';

import { DocAttrs } from '../../doc/doc-attrs';
import { DocCell, DocMatrix } from '../../doc/doc-matrix';
import { DocPage } from '../../doc/doc-page';
import { DocSection } from '../../doc/doc-section';
import { MULTISELECT_SCOPE_CONFIG, MultiselectConfigScope } from './multiselect-config-scope';

type OptionValue = string | number;

interface VisualState {
  readonly name: string;
  readonly value: OptionValue[];
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
  selector: 'app-multiselect-page',
  imports: [
    JsonPipe,
    ReactiveFormsModule,
    GogDropdownChevronDirective,
    GogDropdownOptionDirective,
    GogMultiselectClearIconDirective,
    IconComponent,
    MultiselectComponent,
    DocAttrs,
    DocCell,
    DocMatrix,
    DocPage,
    DocSection,
    MultiselectConfigScope,
  ],
  templateUrl: './multiselect-page.html',
  styleUrl: './multiselect-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiselectPage {
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

  /** Unwindowed, 10 000 options build 10 000 rows to show about six. */
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

  protected readonly two: OptionValue[] = ['angular', 'vue'];
  protected readonly states: readonly VisualState[] = [
    { name: 'value unset (placeholder)', value: [], disabled: false, errorMessage: '' },
    { name: "[value]=\"['angular', 'vue']\"", value: this.two, disabled: false, errorMessage: '' },
    {
      name: '[disabled]="true", two selected',
      value: this.two,
      disabled: true,
      errorMessage: '',
    },
    {
      name: 'errorMessage="Pick at least one"',
      value: [],
      disabled: false,
      errorMessage: 'Pick at least one',
    },
  ];

  protected readonly controlRows: readonly Labelled<'top' | 'bottom'>[] = [
    { name: 'controlsPosition unset (top)', value: 'top' },
    { name: 'controlsPosition="bottom"', value: 'bottom' },
  ];

  protected readonly floatLabelVariants: readonly GogFloatLabelVariant[] = [
    'none',
    'in',
    'on',
    'over',
  ];
  protected readonly floatStates: readonly Labelled<OptionValue[]>[] = [
    { name: 'value unset', value: [] },
    { name: "value: ['angular', 'vue']", value: this.two },
  ];

  /** The single column of a matrix whose rows are the only axis. */
  protected readonly controlColumn = ['control'] as const;

  protected readonly scopeConfig = MULTISELECT_SCOPE_CONFIG;
  protected readonly scopeAxis = ['outside scope', 'inside scope'] as const;
  protected readonly scopeColumns = [
    'size unset',
    'size="sm"',
    'filter unset, showControls, labels unset',
  ] as const;

  protected readonly a11yStates = [
    'default',
    'two selected',
    '[disabled]="true"',
    'errorMessage="Required"',
    'label unset, ariaLabel="Frameworks"',
  ] as const;
  protected readonly a11yColumns = ['trigger'] as const;

  protected readonly clearA11yStates = [
    'clearAriaLabel unset',
    'clearAriaLabel="Clear frameworks"',
  ] as const;

  /** Ten of twenty countries: more than the trigger fits on one line. */
  protected readonly overflowValue = signal<OptionValue[]>(
    this.countries.slice(0, 10).map((option) => option.id),
  );

  protected readonly boundValue = signal<OptionValue[]>([]);
  protected readonly memberIds = signal<string[]>(['u1']);
  /** With `[optionValue]="null"` the control hands back the objects, not ids. */
  protected readonly selectedMembers = signal<Member[]>([]);
  protected readonly plan = signal<OptionValue[]>(['free']);

  protected readonly formControl = new FormControl<OptionValue[]>([], {
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

  protected names(members: readonly Member[]): string {
    return members.map((member) => member.uuid).join(', ') || 'none';
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
