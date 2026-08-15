import { Component, signal } from '@angular/core';
import { GogDropdownOption, SelectComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [SelectComponent],
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
