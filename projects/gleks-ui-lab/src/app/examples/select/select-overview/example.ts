import { Component, computed, signal } from '@angular/core';
import { GogDropdownOption, SelectComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [SelectComponent],
})
export class SelectOverviewExample {
  protected readonly framework = signal<string | number | null>(null);
  protected readonly frameworks: GogDropdownOption[] = [
    { id: 'angular', name: 'Angular' },
    { id: 'react', name: 'React' },
    { id: 'vue', name: 'Vue' },
  ];

  // The value is the option's `id`, not the option — so a label needs a lookup.
  protected readonly selectionSummary = computed(() => {
    const id = this.framework();
    return this.frameworks.find((option) => option.id === id)?.name ?? 'nothing';
  });
}
