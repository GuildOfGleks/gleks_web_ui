import { Component, computed, signal } from '@angular/core';
import { GogDropdownOption, SelectComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [SelectComponent],
  template: `
    <gog-select label="Framework" [options]="frameworks" [(value)]="framework" />
    <p class="readout">Selected: {{ selectionSummary() }}</p>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
      max-width: 420px;
    }
    .readout {
      margin: 0;
      color: var(--gog-muted-text-color);
      font-size: 0.9em;
    }
  `,
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
