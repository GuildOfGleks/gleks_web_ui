import { Component, signal } from '@angular/core';
import { GogDropdownOption, MultiselectComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [MultiselectComponent],
  template: `
    <gog-multiselect #ms label="Tags" [options]="tags" [(value)]="selectedTags" />
    <p>Selected: {{ ms.selectedNames() }}</p>
  `,
})
export class MultiselectSelectedNamesExample {
  protected readonly selectedTags = signal<(string | number)[]>(['bug']);
  protected readonly tags: GogDropdownOption[] = [/* ... */];
}
