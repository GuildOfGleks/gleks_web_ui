import { Component, computed, signal } from '@angular/core';
import { GogDropdownOption, SelectComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [SelectComponent],
  template: `
    <gog-select label="Disabled" [options]="frameworks" value="angular" [disabled]="true" />

    <gog-select label="Plan (one option disabled)" [options]="plansWithDisabled" [(value)]="plan" />

    <gog-select
      label="Required plan"
      placeholder="Choose a plan..."
      [options]="plansWithDisabled"
      [errorMessage]="requiredError()"
      [(value)]="requiredValue"
    />
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
      max-width: 420px;
    }
  `,
})
export class SelectStatesExample {
  protected readonly frameworks: GogDropdownOption[] = [
    { id: 'angular', name: 'Angular' },
    { id: 'react', name: 'React' },
    { id: 'vue', name: 'Vue' },
  ];
  protected readonly plansWithDisabled: GogDropdownOption[] = [
    { id: 'free', name: 'Free' },
    { id: 'pro', name: 'Pro' },
    { id: 'enterprise', name: 'Enterprise (contact sales)', disabled: true },
  ];
  protected readonly plan = signal<string | number | null>('free');
  protected readonly requiredValue = signal<string | number | null>(null);
  protected readonly requiredError = computed(() =>
    this.requiredValue() === null ? 'Please pick a plan.' : '',
  );
}
