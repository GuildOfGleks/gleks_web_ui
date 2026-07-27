import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CheckboxComponent, GogSelectOption, GogSize, SelectComponent } from '@gleks/ui';

@Component({
  selector: 'app-select-page',
  imports: [SelectComponent, CheckboxComponent],
  templateUrl: './select-page.html',
  styleUrl: './select-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectPage {
  protected readonly sizes: GogSize[] = ['sm', 'md', 'lg'];

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
}
