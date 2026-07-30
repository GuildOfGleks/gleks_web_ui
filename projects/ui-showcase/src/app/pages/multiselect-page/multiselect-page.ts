import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CheckboxComponent, GogMultiselectOption, GogSize, MultiselectComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-multiselect-page',
  imports: [MultiselectComponent, CheckboxComponent],
  templateUrl: './multiselect-page.html',
  styleUrl: './multiselect-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiselectPage {
  protected readonly sizes: GogSize[] = ['sm', 'md', 'lg'];

  protected readonly selectedFeatures = signal<(string | number)[]>(['toast', 'dialog']);
  protected readonly features: GogMultiselectOption[] = [
    { id: 'toast', name: 'Toast' },
    { id: 'dialog', name: 'Dialog' },
    { id: 'forms', name: 'Forms' },
    { id: 'table', name: 'Table' },
  ];
  protected readonly featureSummary = computed(() => this.selectedFeatures().join(', ') || 'None selected');

  protected readonly sizeDemoValue = signal<(string | number)[]>(['toast']);

  protected readonly permissionsWithDisabled: GogMultiselectOption[] = [
    { id: 'read', name: 'Read' },
    { id: 'write', name: 'Write' },
    { id: 'admin', name: 'Admin (contact owner)', disabled: true },
  ];
  protected readonly permissions = signal<(string | number)[]>(['read']);

  protected readonly requireSelection = signal(true);
  protected readonly requiredValue = signal<(string | number)[]>([]);
  protected readonly requiredError = computed(() =>
    this.requireSelection() && this.requiredValue().length === 0 ? 'Pick at least one option.' : '',
  );

  protected readonly tags: GogMultiselectOption[] = [
    { id: 'urgent', name: 'Urgent' },
    { id: 'bug', name: 'Bug' },
    { id: 'feature', name: 'Feature' },
    { id: 'docs', name: 'Docs' },
  ];
  protected readonly selectedTags = signal<(string | number)[]>([]);
}
