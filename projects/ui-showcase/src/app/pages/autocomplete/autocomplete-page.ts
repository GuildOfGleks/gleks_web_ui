import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  AutocompleteComponent,
  GogDropdownOptionDirective,
  type GogDropdownOption,
  type GogFloatLabelVariant,
  type GogSize,
} from '@guildofgleks/ui';

import { DocAttrs } from '../../doc/doc-attrs';
import { DocCell, DocMatrix } from '../../doc/doc-matrix';
import { DocPage } from '../../doc/doc-page';
import { DocSection } from '../../doc/doc-section';
import { AUTOCOMPLETE_SCOPE_CONFIG, AutocompleteConfigScope } from './autocomplete-config-scope';

type CityValue = number | null;

interface VisualState {
  readonly name: string;
  readonly value: CityValue;
  readonly disabled: boolean;
  readonly errorMessage: string;
  readonly loading: boolean;
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

const CITY_NAMES = [
  'Amsterdam',
  'Athens',
  'Barcelona',
  'Berlin',
  'Bratislava',
  'Brussels',
  'Budapest',
  'Copenhagen',
  'Dublin',
  'Helsinki',
  'Lisbon',
  'Madrid',
  'Oslo',
  'Paris',
  'Prague',
  'Riga',
  'Rome',
  'Sofia',
  'Stockholm',
  'Tallinn',
  'Vienna',
  'Warsaw',
  'Zagreb',
];

/** Stands in for a source too large to hand over up front — 200 rows, 20 at a time. */
const CONTACTS: GogDropdownOption[] = Array.from({ length: 200 }, (_, i) => ({
  id: i + 1,
  name: `Contact #${i + 1}`,
}));
const PAGE_SIZE = 20;

@Component({
  selector: 'app-autocomplete-page',
  imports: [
    JsonPipe,
    ReactiveFormsModule,
    AutocompleteComponent,
    GogDropdownOptionDirective,
    DocAttrs,
    DocCell,
    DocMatrix,
    DocPage,
    DocSection,
    AutocompleteConfigScope,
  ],
  templateUrl: './autocomplete-page.html',
  styleUrl: './autocomplete-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompletePage {
  protected readonly sizes: readonly GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];

  protected readonly cities: GogDropdownOption[] = CITY_NAMES.map((name, index) => ({
    id: index + 1,
    name,
  }));
  /** Berlin — the id the states matrix and the float-label matrix both start from. */
  protected readonly berlin = 4;

  /** One option disabled through the default `optionDisabled` path. */
  protected readonly plans: GogDropdownOption[] = [
    { id: 'free', name: 'Free' },
    { id: 'pro', name: 'Pro' },
    { id: 'enterprise', name: 'Enterprise (contact sales)', disabled: true },
  ];

  /** Unwindowed, 10 000 options build 10 000 rows to show about six. */
  protected readonly manyCities: GogDropdownOption[] = Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    name: `City ${(i + 1).toLocaleString('en-US')}`,
  }));

  protected readonly members: Member[] = [
    { uuid: 'u1', profile: { fullName: 'Ada Lovelace', role: 'Maintainer' }, suspended: false },
    { uuid: 'u2', profile: { fullName: 'Alan Turing', role: 'Reviewer' }, suspended: false },
    { uuid: 'u3', profile: { fullName: 'Grace Hopper', role: 'Admin' }, suspended: true },
  ];
  protected readonly memberLabel = (member: Member) => member.profile.fullName;

  /** Matches on a prefix instead of the default substring. */
  protected readonly startsWith = (option: GogDropdownOption, query: string): boolean =>
    option.name.toLowerCase().startsWith(query.trim().toLowerCase());

  protected readonly states: readonly VisualState[] = [
    {
      name: 'value unset (placeholder)',
      value: null,
      disabled: false,
      errorMessage: '',
      loading: false,
    },
    { name: '[value]="4" (Berlin)', value: 4, disabled: false, errorMessage: '', loading: false },
    { name: '[disabled]="true"', value: 4, disabled: true, errorMessage: '', loading: false },
    {
      name: 'errorMessage="Pick a city"',
      value: null,
      disabled: false,
      errorMessage: 'Pick a city',
      loading: false,
    },
    { name: '[loading]="true"', value: null, disabled: false, errorMessage: '', loading: true },
  ];

  protected readonly floatLabelVariants: readonly GogFloatLabelVariant[] = [
    'none',
    'in',
    'on',
    'over',
  ];
  protected readonly floatStates: readonly Labelled<CityValue>[] = [
    { name: 'value unset', value: null },
    { name: 'value: 4 (Berlin)', value: 4 },
  ];

  /** The single column of a matrix whose rows are the only axis. */
  protected readonly controlColumn = ['control'] as const;

  protected readonly scopeConfig = AUTOCOMPLETE_SCOPE_CONFIG;
  protected readonly scopeAxis = ['outside scope', 'inside scope'] as const;
  protected readonly scopeColumns = [
    'size unset',
    'minLength and openOnFocus unset',
    'searchDebounce unset',
  ] as const;

  protected readonly a11yStates = [
    'default',
    '[value]="4"',
    '[disabled]="true"',
    'errorMessage="Required"',
    'label unset, ariaLabel="City"',
  ] as const;
  protected readonly a11yColumns = ['input'] as const;

  protected readonly busyStates = ['loading unset', '[loading]="true"'] as const;
  protected readonly clearA11yStates = [
    'clearAriaLabel unset',
    'clearAriaLabel="Clear city"',
  ] as const;

  protected readonly boundValue = signal<CityValue>(null);
  protected readonly memberId = signal<string | null>('u1');
  /** With `[optionValue]="null"` the control hands back the object, not an id. */
  protected readonly selectedMember = signal<Member | null>(null);

  protected readonly formControl = new FormControl<CityValue>(null, {
    validators: [Validators.required],
  });
  protected readonly formDisabled = signal(false);

  /** Server-backed demo: `filterLocal` is off, so this list is rendered exactly as returned. */
  protected readonly remoteResults = signal<GogDropdownOption[]>(this.cities);
  protected readonly remoteLoading = signal(false);
  private remoteTimer: ReturnType<typeof setTimeout> | null = null;

  /** Load-more demo: only one page of `CONTACTS` is ever handed over at once. */
  protected readonly contacts = signal<GogDropdownOption[]>(CONTACTS.slice(0, PAGE_SIZE));
  protected readonly contactsTotal = CONTACTS.length;
  protected readonly contactsLoading = signal(false);
  private contactsTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly counts = signal<Readonly<Record<string, number>>>({});
  private readonly queries = signal<Readonly<Record<string, string>>>({});

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      if (this.remoteTimer) clearTimeout(this.remoteTimer);
      if (this.contactsTimer) clearTimeout(this.contactsTimer);
    });
  }

  protected count(key: string): number {
    return this.counts()[key] ?? 0;
  }

  protected increment(key: string): void {
    this.counts.update((counts) => ({ ...counts, [key]: (counts[key] ?? 0) + 1 }));
  }

  /** Records a `gogSearch` query per demo, so a cell can show what the debounce let through. */
  protected recordQuery(key: string, query: string): void {
    this.queries.update((queries) => ({ ...queries, [key]: query }));
    this.increment(key);
  }

  protected query(key: string): string {
    return this.queries()[key] ?? '';
  }

  protected cityName(id: CityValue): string {
    return this.cities.find((city) => city.id === id)?.name ?? 'none';
  }

  /** Stands in for an HTTP call: a deliberate 600 ms, so the spinner is there to be seen. */
  protected searchRemote(query: string): void {
    this.recordQuery('remote', query);
    if (this.remoteTimer) clearTimeout(this.remoteTimer);

    this.remoteLoading.set(true);
    this.remoteTimer = setTimeout(() => {
      const needle = query.trim().toLowerCase();
      this.remoteResults.set(
        needle === ''
          ? this.cities
          : this.cities.filter((city) => city.name.toLowerCase().startsWith(needle)),
      );
      this.remoteLoading.set(false);
      this.remoteTimer = null;
    }, 600);
  }

  /** Appends the next page of `CONTACTS` — stands in for a paginated API call. */
  protected loadMoreContacts(): void {
    const loaded = this.contacts().length;
    if (loaded >= CONTACTS.length || this.contactsLoading()) return;

    this.contactsLoading.set(true);
    if (this.contactsTimer) clearTimeout(this.contactsTimer);
    this.contactsTimer = setTimeout(() => {
      this.contacts.set(CONTACTS.slice(0, loaded + PAGE_SIZE));
      this.contactsLoading.set(false);
      this.contactsTimer = null;
    }, 400);
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
