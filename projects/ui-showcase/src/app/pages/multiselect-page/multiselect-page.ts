import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  CheckboxComponent,
  GogDropdownChevronDirective,
  GogDropdownOption,
  GogDropdownOptionDirective,
  GogFloatLabelVariant,
  GogMultiselectClearIconDirective,
  GogSize,
  IconComponent,
  MultiselectComponent,
  SelectComponent,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-multiselect-page',
  imports: [
    CheckboxComponent,
    GogDropdownChevronDirective,
    GogDropdownOptionDirective,
    GogMultiselectClearIconDirective,
    IconComponent,
    MultiselectComponent,
    ReactiveFormsModule,
    SelectComponent,
  ],
  templateUrl: './multiselect-page.html',
  styleUrl: './multiselect-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiselectPage {
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];

  protected readonly selectedFeatures = signal<(string | number)[]>(['toast', 'dialog']);
  protected readonly filterDemoValue = signal<(string | number)[]>([]);
  protected readonly features: GogDropdownOption[] = [
    { id: 'toast', name: 'Toast' },
    { id: 'dialog', name: 'Dialog' },
    { id: 'forms', name: 'Forms' },
    { id: 'table', name: 'Table' },
  ];
  protected readonly featureSummary = computed(
    () => this.selectedFeatures().join(', ') || 'None selected',
  );

  protected readonly sizeDemoValue = signal<(string | number)[]>(['toast']);

  protected readonly permissionsWithDisabled: GogDropdownOption[] = [
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

  protected readonly tags: GogDropdownOption[] = [
    { id: 'urgent', name: 'Urgent' },
    { id: 'bug', name: 'Bug' },
    { id: 'feature', name: 'Feature' },
    { id: 'docs', name: 'Docs' },
  ];
  protected readonly selectedTags = signal<(string | number)[]>([]);

  /** `errorDisplay="auto"`: no manually computed error string, the field follows the
   * FormControl's own touched/invalid state instead. */
  protected readonly permissionsFormControl = new FormControl<(string | number)[]>([], {
    nonNullable: true,
    validators: Validators.required,
  });

  protected readonly countries: GogDropdownOption[] = Array.from({ length: 20 }, (_, i) => ({
    id: `country-${i}`,
    name: `Country ${i + 1}`,
  }));
  protected readonly topControlsValue = signal<(string | number)[]>([]);
  protected readonly bottomControlsValue = signal<(string | number)[]>([]);

  protected readonly compactPanelValue = signal<(string | number)[]>([]);
  protected readonly bottomOfPageValue = signal<(string | number)[]>([]);

  protected readonly fullWidthFeatures = signal<(string | number)[]>([]);
  protected readonly fullWidthTags = signal<(string | number)[]>(['bug']);

  protected readonly sortOptions: GogDropdownOption[] = [
    { id: 'name', name: 'Name' },
    { id: 'date', name: 'Date' },
  ];
  protected readonly sortValue = signal<(string | number)[]>([]);

  protected readonly ariaOnlyValue = signal<(string | number)[]>([]);

  protected readonly customOptionValue = signal<(string | number)[]>(['toast']);
  protected readonly clearIconValue = signal<(string | number)[]>(['bug']);
  protected readonly notClearableValue = signal<(string | number)[]>(['toast']);

  /**
   * A `gogDropdownOption` template's context cannot infer `TOption` when the directive is
   * declared standalone in a template — the documented cost of the component being generic.
   * One cast at the boundary keeps the rest of the template typed.
   */
  protected asOption(option: unknown): GogDropdownOption {
    return option as GogDropdownOption;
  }

  protected readonly floatLabelOptions: GogDropdownOption[] = [
    { id: 'none', name: 'None' },
    { id: 'in', name: 'In' },
    { id: 'on', name: 'On' },
    { id: 'over', name: 'Over' },
  ];
  protected readonly floatLabelVariant = signal<GogFloatLabelVariant>('in');
  protected readonly floatLabelShowPlaceholder = signal(false);
  protected readonly floatLabelDemoValue = signal<(string | number)[]>([]);

  protected setFloatLabelVariant(value: string | number | null): void {
    if (value === null) return;
    this.floatLabelVariant.set(value as GogFloatLabelVariant);
  }
}
