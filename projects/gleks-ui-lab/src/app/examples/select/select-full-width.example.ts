import { Component, signal } from '@angular/core';
import { GogDropdownOption, SelectComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [SelectComponent],
  template: `
    <gog-select label="Country" [options]="countries" [(value)]="fullWidthCountry" />
    <gog-select label="Currency" [options]="currencies" [(value)]="currency" [fullWidth]="false" />
  `,
})
export class SelectFullWidthExample {
  protected readonly fullWidthCountry = signal<string | number | null>(null);
  protected readonly currency = signal<string | number | null>('usd');
  protected readonly countries: GogDropdownOption[] = [/* ... */];
  protected readonly currencies: GogDropdownOption[] = [/* ... */];
}
