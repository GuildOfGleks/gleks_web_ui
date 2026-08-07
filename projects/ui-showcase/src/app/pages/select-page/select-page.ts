import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  CheckboxComponent,
  GogDropdownChevronDirective,
  GogFloatLabelVariant,
  GogSelectOption,
  GogSize,
  IconComponent,
  SelectComponent,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-select-page',
  imports: [
    CheckboxComponent,
    GogDropdownChevronDirective,
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
