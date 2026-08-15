import { Component, signal } from '@angular/core';
import { GogDropdownOption, MultiselectComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [MultiselectComponent],
  template: `
    <gog-multiselect #ms label="Tags" [options]="tags" [(value)]="selectedTags" />
    <p>Selected: {{ ms.selectedNames() }}</p>
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
export class MultiselectSelectedNamesExample {
  protected readonly selectedTags = signal<(string | number)[]>(['bug']);
  protected readonly tags: GogDropdownOption[] = [
    { id: 'bug', name: 'Bug' },
    { id: 'feature', name: 'Feature' },
    { id: 'chore', name: 'Chore' },
  ];
}
