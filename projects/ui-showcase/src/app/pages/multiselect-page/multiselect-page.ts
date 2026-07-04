import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { GogMultiselectOption, MultiselectComponent } from '@gleks/ui';

@Component({
  selector: 'app-multiselect-page',
  imports: [MultiselectComponent],
  templateUrl: './multiselect-page.html',
  styleUrl: './multiselect-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiselectPage {
  protected readonly selectedFeatures = signal<(string | number)[]>(['toast', 'dialog']);

  protected readonly features: GogMultiselectOption[] = [
    { id: 'toast', name: 'Toast' },
    { id: 'dialog', name: 'Dialog' },
    { id: 'forms', name: 'Forms' },
    { id: 'table', name: 'Table' },
  ];

  protected readonly featureSummary = computed(() => this.selectedFeatures().join(', ') || 'None selected');
}
