import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { GogSelectOption, SelectComponent } from '@gleks/ui';

@Component({
  selector: 'app-select-page',
  imports: [SelectComponent],
  templateUrl: './select-page.html',
  styleUrl: './select-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectPage {
  protected readonly framework = signal<string | number | null>('angular');

  protected readonly frameworks: GogSelectOption[] = [
    { id: 'angular', name: 'Angular' },
    { id: 'react', name: 'React' },
    { id: 'vue', name: 'Vue' },
  ];

  protected readonly selectionSummary = computed(
    () => this.frameworks.find((option) => option.id === this.framework())?.name ?? 'None selected',
  );
}
