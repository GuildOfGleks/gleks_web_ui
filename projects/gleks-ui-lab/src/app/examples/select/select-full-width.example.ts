import { Component, signal } from '@angular/core';
import { GogDropdownOption, SelectComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [SelectComponent],
  template: `
    <gog-select label="Country" [options]="countries" [(value)]="fullWidthCountry" />
    <gog-select label="Currency" [options]="currencies" [(value)]="currency" [fullWidth]="false" />
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
export class SelectFullWidthExample {
  protected readonly fullWidthCountry = signal<string | number | null>(null);
  protected readonly currency = signal<string | number | null>('usd');
  protected readonly countries: GogDropdownOption[] = [
    { id: 'de', name: 'Germany' },
    { id: 'nl', name: 'Netherlands' },
    { id: 'pt', name: 'Portugal' },
    { id: 'ua', name: 'Ukraine' },
  ];
  protected readonly currencies: GogDropdownOption[] = [
    { id: 'eur', name: 'Euro' },
    { id: 'usd', name: 'US dollar' },
    { id: 'uah', name: 'Hryvnia' },
  ];
}
