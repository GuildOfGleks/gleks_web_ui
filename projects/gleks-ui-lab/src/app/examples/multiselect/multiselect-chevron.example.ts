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
  imports: [
    MultiselectComponent,
    GogDropdownChevronDirective,
    GogMultiselectClearIconDirective,
    IconComponent,
  ],
  template: `
    <gog-multiselect [options]="sortOptions" [(value)]="sortValue">
      <ng-template gogDropdownChevron>
        <gog-icon name="sort" />
      </ng-template>
      <ng-template gogMultiselectClearIcon>
        <gog-icon name="error" />
      </ng-template>
    </gog-multiselect>

    <gog-multiselect
      ariaLabel="Tags (no visible label)"
      placeholder="Pick tags"
      [options]="tags"
      [(value)]="ariaOnlyValue"
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
