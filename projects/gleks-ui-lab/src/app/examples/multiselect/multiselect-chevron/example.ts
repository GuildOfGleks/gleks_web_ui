import { Component, signal } from '@angular/core';
import {
  GogDropdownChevronDirective,
  GogDropdownOption,
  GogMultiselectClearIconDirective,
  IconComponent,
  MultiselectComponent,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [
    MultiselectComponent,
    GogDropdownChevronDirective,
    GogMultiselectClearIconDirective,
    IconComponent,
  ],
})
export class MultiselectChevronExample {
  protected readonly tags: GogDropdownOption[] = [
    { id: 'bug', name: 'Bug' },
    { id: 'feature', name: 'Feature' },
    { id: 'chore', name: 'Chore' },
  ];
  protected readonly sortOptions: GogDropdownOption[] = [
    { id: 'name', name: 'Name' },
    { id: 'date', name: 'Date' },
  ];
  protected readonly sortValue = signal<(string | number)[]>([]);
  protected readonly ariaOnlyValue = signal<(string | number)[]>([]);
}
