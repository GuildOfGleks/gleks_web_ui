import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  CheckboxComponent,
  GogDropdownChevronDirective,
  GogDropdownOption,
  GogDropdownOptionDirective,
  GogFloatLabelVariant,
  GogSelectOption,
  GogSize,
  IconComponent,
  SelectComponent,
} from '@guildofgleks/ui';

interface Member {
  uuid: string;
  profile: { fullName: string; role: string };
  suspended: boolean;
}

@Component({
  selector: 'app-select-page',
  imports: [
    CheckboxComponent,
    GogDropdownChevronDirective,
    GogDropdownOptionDirective,
    IconComponent,
    ReactiveFormsModule,
    SelectComponent,
  ],
  templateUrl: './select-page.html',
  styleUrl: './select-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectPage {
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];

  /** A DTO with no `id`/`name` at all — the shape a real API actually returns. */
  protected readonly members: Member[] = [
    { uuid: 'u1', profile: { fullName: 'Ada Lovelace', role: 'Maintainer' }, suspended: false },
    { uuid: 'u2', profile: { fullName: 'Alan Turing', role: 'Reviewer' }, suspended: false },
    { uuid: 'u3', profile: { fullName: 'Grace Hopper', role: 'Admin' }, suspended: true },
  ];
  protected readonly memberId = signal<string | null>('u1');
  /** With `[optionValue]="null"` the control hands back the object, not an id. */
  protected readonly member = signal<Member | null>(null);
  protected readonly memberLabel = (m: Member) => m.profile.fullName;

  protected readonly filterDemoValue = signal<string | number | null>(null);
  protected readonly prefixDemoValue = signal<string | number | null>(null);
  /** Prefix matching instead of the default substring search. */
  protected readonly prefixMatch = (option: GogDropdownOption, query: string) =>
    option.name.toLowerCase().startsWith(query.toLowerCase());

  protected readonly framework = signal<string | number | null>('angular');
  protected readonly frameworks: GogSelectOption[] = [
    { id: 'angular', name: 'Angular' },
    { id: 'react', name: 'React' },
    { id: 'vue', name: 'Vue' },
  ];
  protected readonly selectionSummary = computed(
    () => this.frameworks.find((option) => option.id === this.framework())?.name ?? 'None selected',
  );

  protected readonly sizeDemoValue = signal<string | number | null>('md');

  protected readonly plansWithDisabled: GogSelectOption[] = [
    { id: 'free', name: 'Free' },
    { id: 'pro', name: 'Pro' },
    { id: 'enterprise', name: 'Enterprise (contact sales)', disabled: true },
  ];
  protected readonly plan = signal<string | number | null>('free');

  protected readonly requireSelection = signal(true);
  protected readonly requiredValue = signal<string | number | null>(null);
  protected readonly requiredError = computed(() =>
    this.requireSelection() && this.requiredValue() === null ? 'Please pick a plan.' : '',
  );

  protected readonly regions: GogSelectOption[] = [
    { id: 'eu', name: 'Europe' },
    { id: 'us', name: 'United States' },
    { id: 'apac', name: 'Asia Pacific' },
  ];
  protected readonly region = signal<string | number | null>(null);

  /** `errorDisplay="auto"`: no manually computed error string, the field follows the
   * FormControl's own touched/invalid state instead. */
  protected readonly billingCycles: GogSelectOption[] = [
    { id: 'monthly', name: 'Monthly' },
    { id: 'yearly', name: 'Yearly (2 months free)' },
  ];
  protected readonly billingCycleControl = new FormControl<string | number | null>(
    null,
    Validators.required,
  );

  protected readonly countries: GogSelectOption[] = Array.from({ length: 20 }, (_, i) => ({
    id: `country-${i}`,
    name: `Country ${i + 1}`,
  }));
  protected readonly compactPanelValue = signal<string | number | null>(null);
  protected readonly bottomOfPageValue = signal<string | number | null>(null);

  protected readonly fullWidthCountry = signal<string | number | null>(null);
  protected readonly currencies: GogSelectOption[] = [
    { id: 'usd', name: 'USD' },
    { id: 'eur', name: 'EUR' },
    { id: 'gbp', name: 'GBP' },
  ];
  protected readonly currency = signal<string | number | null>('usd');

  protected readonly sortOptions: GogSelectOption[] = [
    { id: 'newest', name: 'Newest first' },
    { id: 'oldest', name: 'Oldest first' },
  ];
  protected readonly sortValue = signal<string | number | null>('newest');

  protected readonly ariaOnlyValue = signal<string | number | null>(null);

  protected readonly floatLabelOptions: GogSelectOption[] = [
    { id: 'none', name: 'None' },
    { id: 'in', name: 'In' },
    { id: 'on', name: 'On' },
    { id: 'over', name: 'Over' },
  ];
  protected readonly floatLabelVariant = signal<GogFloatLabelVariant>('in');
  protected readonly floatLabelShowPlaceholder = signal(false);
  protected readonly floatLabelDemoValue = signal<string | number | null>(null);

  protected setFloatLabelVariant(value: string | number | null): void {
    if (value === null) return;
    this.floatLabelVariant.set(value as GogFloatLabelVariant);
  }
}
