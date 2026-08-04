import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { GogDropdownOption, GogSize, IconComponent, MultiselectComponent } from '@guildofgleks/ui';
import { CodeTabsComponent } from '../../shared/code-tabs/code-tabs';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';

interface ApiInputRow {
  readonly name: string;
  readonly type: string;
  readonly default: string;
  readonly description: string;
}

const API_INPUTS: readonly ApiInputRow[] = [
  {
    name: 'value',
    type: '(string | number)[] (model)',
    default: '[]',
    description:
      'Two-way bindable selected option ids via [(value)]. Also driven by Angular Forms through writeValue/registerOnChange when used with formControlName/[formControl]/ngModel.',
  },
  { name: 'label', type: 'string', default: "''", description: 'Field label.' },
  {
    name: 'ariaLabel',
    type: 'string',
    default: "''",
    description: 'Accessible name for the field when there is no visible label.',
  },
  {
    name: 'placeholder',
    type: 'string',
    default: "'Select...'",
    description: 'Text shown while no option is selected.',
  },
  {
    name: 'options',
    type: 'GogDropdownOption[]',
    default: '[]',
    description: 'The list of choices: { id: string | number; name: string; disabled?: boolean }.',
  },
  {
    name: 'showControls',
    type: 'boolean',
    default: 'false',
    description: 'Shows a "select all" / "clear" row above (or below) the option list.',
  },
  {
    name: 'controlsPosition',
    type: "'top' | 'bottom'",
    default: "'top'",
    description:
      'Where the select-all/clear row sits relative to the option list. Sticky either way, so it stays visible while a long list scrolls.',
  },
  {
    name: 'clearIconTemplate',
    type: 'TemplateRef<unknown> | null',
    default: 'null',
    description: 'Custom icon for the "clear" control, in place of the default.',
  },
  {
    name: 'errorMessage',
    type: 'string',
    default: "''",
    description: 'Error text to display. Visibility is governed by errorDisplay.',
  },
  {
    name: 'errorDisplay',
    type: "'auto' | 'manual'",
    default: "'manual'",
    description:
      "'manual': shown for as long as errorMessage is non-empty — you decide the timing. 'auto': shown once the attached FormControl is touched and invalid; falls back to manual without one.",
  },
  {
    name: 'size',
    type: "'xsm' | 'sm' | 'md' | 'lg' | 'slg'",
    default: "'md'",
    description: 'Field height, padding, and font size.',
  },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the trigger and closes the panel if it is open.' },
  {
    name: 'fullWidth',
    type: 'boolean',
    default: 'true',
    description: 'Fills its container by default. Set false to shrink to fit the selected summary instead.',
  },
  {
    name: 'dropdownDirection',
    type: "'auto' | 'up' | 'down'",
    default: "'auto'",
    description: "Which side the panel opens on. 'auto' flips to whichever side has room in the viewport.",
  },
  {
    name: 'dropdownZIndex',
    type: 'number | null',
    default: 'null',
    description: 'Explicit stacking order for the panel. Left unset it falls back to the --gog-dropdown-z token.',
  },
  {
    name: 'dropdownWidth',
    type: 'string | null',
    default: 'null',
    description: 'Fixed panel width, any CSS length. Applies only with appendToBody — otherwise the panel matches the trigger width.',
  },
  {
    name: 'dropdownMaxHeight',
    type: 'string | null',
    default: 'null',
    description: 'Fixed panel max-height, any CSS length. Applies only with appendToBody.',
  },
  {
    name: 'appendToBody',
    type: 'boolean',
    default: 'false',
    description: "Portals the panel into document.body instead of rendering it inline — escapes an ancestor's scroll/overflow clipping.",
  },
  {
    name: 'chevronTemplate',
    type: 'TemplateRef<unknown> | null',
    default: 'null',
    description: 'Custom trigger icon, in place of the default chevron.',
  },
];

@Component({
  selector: 'app-multiselect-doc-page',
  imports: [MultiselectComponent, IconComponent, MarkdownComponent, CodeTabsComponent, RouterLink, ReactiveFormsModule],
  templateUrl: './multiselect-doc-page.html',
  styleUrl: './multiselect-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiselectDocPage {
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];

  protected readonly apiInputs = API_INPUTS;
  protected readonly styleTokens = TOKEN_SECTIONS.find((section) => section.id === 'multiselect')?.tokens ?? [];

  protected readonly selectedFeatures = signal<(string | number)[]>([]);
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
  protected readonly requiredValue = signal<(string | number)[]>([]);
  protected readonly requiredError = computed(() =>
    this.requiredValue().length === 0 ? 'Pick at least one option.' : '',
  );

  protected readonly permissionsFormControl = new FormControl<(string | number)[]>([], {
    nonNullable: true,
    validators: Validators.required,
  });

  protected readonly tags: GogDropdownOption[] = [
    { id: 'urgent', name: 'Urgent' },
    { id: 'bug', name: 'Bug' },
    { id: 'feature', name: 'Feature' },
    { id: 'docs', name: 'Docs' },
  ];
  protected readonly fullWidthTags = signal<(string | number)[]>(['bug']);
  protected readonly fullWidthFeatures = signal<(string | number)[]>([]);

  protected readonly countries: GogDropdownOption[] = [
    { id: 'de', name: 'Germany' },
    { id: 'fr', name: 'France' },
    { id: 'es', name: 'Spain' },
    { id: 'it', name: 'Italy' },
    { id: 'pl', name: 'Poland' },
  ];
  protected readonly topControlsValue = signal<(string | number)[]>([]);
  protected readonly bottomControlsValue = signal<(string | number)[]>([]);

  protected readonly sortOptions: GogDropdownOption[] = [
    { id: 'name', name: 'Name' },
    { id: 'date', name: 'Date' },
  ];
  protected readonly sortValue = signal<(string | number)[]>([]);
  protected readonly ariaOnlyValue = signal<(string | number)[]>([]);

  protected readonly manyCountries: GogDropdownOption[] = Array.from({ length: 20 }, (_, i) => ({
    id: `country-${i}`,
    name: `Country ${i + 1}`,
  }));
  protected readonly compactPanelValue = signal<(string | number)[]>([]);

  protected readonly importSnippet =
    "```typescript\nimport { MultiselectComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [MultiselectComponent],\n})\n```";

  protected readonly overviewHtml = [
    '<gog-multiselect label="Features" [options]="features" [(value)]="selectedFeatures" />',
  ].join('\n');
  protected readonly overviewTs = [
    "import { Component, signal } from '@angular/core';",
    "import { GogDropdownOption, MultiselectComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [MultiselectComponent],',
    '  template: `<gog-multiselect label="Features" [options]="features" [(value)]="selectedFeatures" />`,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly selectedFeatures = signal<(string | number)[]>([]);',
    '  protected readonly features: GogDropdownOption[] = [',
    "    { id: 'toast', name: 'Toast' },",
    "    { id: 'dialog', name: 'Dialog' },",
    "    { id: 'forms', name: 'Forms' },",
    "    { id: 'table', name: 'Table' },",
    '  ];',
    '}',
  ].join('\n');

  protected readonly selectedNamesHtml = [
    '<gog-multiselect #ms label="Tags" [options]="tags" [(value)]="fullWidthTags" />',
    '<p>Selected: {{ ms.selectedNames() }}</p>',
  ].join('\n');
  protected readonly selectedNamesTs = [
    "import { Component, signal } from '@angular/core';",
    "import { GogDropdownOption, MultiselectComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [MultiselectComponent],',
    '  template: `',
    '    <gog-multiselect #ms label="Tags" [options]="tags" [(value)]="selectedTags" />',
    '    <p>Selected: {{ ms.selectedNames() }}</p>',
    '  `,',
    '})',
    'export class ExampleComponent {',
    "  protected readonly selectedTags = signal<(string | number)[]>(['bug']);",
    '  protected readonly tags: GogDropdownOption[] = [/* ... */];',
    '}',
  ].join('\n');

  protected readonly sizesHtml = [
    '@for (sizeOption of sizes; track sizeOption) {',
    '  <gog-multiselect [label]="\'Size: \' + sizeOption" [size]="sizeOption" [options]="features" [(value)]="sizeDemoValue" />',
    '}',
  ].join('\n');
  protected readonly sizesTs = [
    "import { Component } from '@angular/core';",
    "import { GogDropdownOption, GogSize, MultiselectComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [MultiselectComponent],',
    '  template: `',
    '    @for (sizeOption of sizes; track sizeOption) {',
    '      <gog-multiselect [label]="\'Size: \' + sizeOption" [size]="sizeOption" [options]="features" [(value)]="sizeDemoValue" />',
    '    }',
    '  `,',
    '})',
    'export class ExampleComponent {',
    "  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];",
    '  protected readonly features: GogDropdownOption[] = [/* ... */];',
    "  protected readonly sizeDemoValue = signal<(string | number)[]>(['toast']);",
    '}',
  ].join('\n');

  protected readonly controlsHtml = [
    '<gog-multiselect',
    '  label="Top (default)"',
    '  [options]="countries"',
    '  [showControls]="true"',
    '  [(value)]="topControlsValue"',
    '/>',
    '',
    '<gog-multiselect',
    '  label="Bottom"',
    '  [options]="countries"',
    '  [showControls]="true"',
    '  controlsPosition="bottom"',
    '  [(value)]="bottomControlsValue"',
    '/>',
  ].join('\n');
  protected readonly controlsTs = [
    "import { Component, signal } from '@angular/core';",
    "import { GogDropdownOption, MultiselectComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [MultiselectComponent],',
    '  template: `',
    '    <gog-multiselect',
    '      label="Top (default)"',
    '      [options]="countries"',
    '      [showControls]="true"',
    '      [(value)]="topControlsValue"',
    '    />',
    '',
    '    <gog-multiselect',
    '      label="Bottom"',
    '      [options]="countries"',
    '      [showControls]="true"',
    '      controlsPosition="bottom"',
    '      [(value)]="bottomControlsValue"',
    '    />',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly countries: GogDropdownOption[] = [/* ... */];',
    '  protected readonly topControlsValue = signal<(string | number)[]>([]);',
    '  protected readonly bottomControlsValue = signal<(string | number)[]>([]);',
    '}',
  ].join('\n');

  protected readonly statesHtml = [
    '<gog-multiselect label="Disabled" [options]="features" [value]="[\'toast\']" [disabled]="true" />',
    '',
    '<gog-multiselect label="Permissions (one disabled)" [options]="permissionsWithDisabled" [(value)]="permissions" />',
    '',
    '<gog-multiselect',
    '  label="Required tags"',
    '  placeholder="Pick at least one..."',
    '  [options]="permissionsWithDisabled"',
    '  [errorMessage]="requiredError()"',
    '  [(value)]="requiredValue"',
    '/>',
  ].join('\n');
  protected readonly statesTs = [
    "import { Component, computed, signal } from '@angular/core';",
    "import { GogDropdownOption, MultiselectComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [MultiselectComponent],',
    '  template: `',
    '    <gog-multiselect label="Disabled" [options]="features" [value]="[\'toast\']" [disabled]="true" />',
    '',
    '    <gog-multiselect label="Permissions (one disabled)" [options]="permissionsWithDisabled" [(value)]="permissions" />',
    '',
    '    <gog-multiselect',
    '      label="Required tags"',
    '      placeholder="Pick at least one..."',
    '      [options]="permissionsWithDisabled"',
    '      [errorMessage]="requiredError()"',
    '      [(value)]="requiredValue"',
    '    />',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly permissionsWithDisabled: GogDropdownOption[] = [',
    "    { id: 'read', name: 'Read' },",
    "    { id: 'write', name: 'Write' },",
    "    { id: 'admin', name: 'Admin (contact owner)', disabled: true },",
    '  ];',
    "  protected readonly permissions = signal<(string | number)[]>(['read']);",
    '  protected readonly requiredValue = signal<(string | number)[]>([]);',
    '  protected readonly requiredError = computed(() =>',
    "    this.requiredValue().length === 0 ? 'Pick at least one option.' : '',",
    '  );',
    '}',
  ].join('\n');

  protected readonly formHtml = [
    '<gog-multiselect',
    '  label="Permissions"',
    '  placeholder="Pick at least one..."',
    '  [options]="permissionsWithDisabled"',
    '  [formControl]="permissionsFormControl"',
    '  errorMessage="Pick at least one permission."',
    '  errorDisplay="auto"',
    '/>',
  ].join('\n');
  protected readonly formTs = [
    "import { Component } from '@angular/core';",
    "import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';",
    "import { GogDropdownOption, MultiselectComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [MultiselectComponent, ReactiveFormsModule],',
    '  template: `',
    '    <gog-multiselect',
    '      label="Permissions"',
    '      placeholder="Pick at least one..."',
    '      [options]="permissionsWithDisabled"',
    '      [formControl]="permissionsFormControl"',
    '      errorMessage="Pick at least one permission."',
    '      errorDisplay="auto"',
    '    />',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly permissionsFormControl = new FormControl<(string | number)[]>([], {',
    '    nonNullable: true,',
    '    validators: Validators.required,',
    '  });',
    '}',
  ].join('\n');

  protected readonly fullWidthHtml = [
    '<gog-multiselect label="Features" [options]="features" [(value)]="fullWidthFeatures" />',
    '<gog-multiselect label="Tags" [options]="tags" [(value)]="fullWidthTags" [fullWidth]="false" />',
  ].join('\n');
  protected readonly fullWidthTs = [
    "import { Component, signal } from '@angular/core';",
    "import { GogDropdownOption, MultiselectComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [MultiselectComponent],',
    '  template: `',
    '    <gog-multiselect label="Features" [options]="features" [(value)]="fullWidthFeatures" />',
    '    <gog-multiselect label="Tags" [options]="tags" [(value)]="fullWidthTags" [fullWidth]="false" />',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly fullWidthFeatures = signal<(string | number)[]>([]);',
    "  protected readonly fullWidthTags = signal<(string | number)[]>(['bug']);",
    '  protected readonly features: GogDropdownOption[] = [/* ... */];',
    '  protected readonly tags: GogDropdownOption[] = [/* ... */];',
    '}',
  ].join('\n');

  protected readonly chevronHtml = [
    '<ng-template #sortChevron>',
    '  <gog-icon name="sort" />',
    '</ng-template>',
    '',
    '<gog-multiselect [options]="sortOptions" [chevronTemplate]="sortChevron" [(value)]="sortValue" />',
    '',
    '<gog-multiselect',
    '  ariaLabel="Tags (no visible label)"',
    '  placeholder="Pick tags"',
    '  [options]="tags"',
    '  [(value)]="ariaOnlyValue"',
    '/>',
  ].join('\n');
  protected readonly chevronTs = [
    "import { Component, signal } from '@angular/core';",
    "import { GogDropdownOption, IconComponent, MultiselectComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [MultiselectComponent, IconComponent],',
    '  template: `',
    '    <ng-template #sortChevron>',
    '      <gog-icon name="sort" />',
    '    </ng-template>',
    '',
    '    <gog-multiselect [options]="sortOptions" [chevronTemplate]="sortChevron" [(value)]="sortValue" />',
    '',
    '    <gog-multiselect',
    '      ariaLabel="Tags (no visible label)"',
    '      placeholder="Pick tags"',
    '      [options]="tags"',
    '      [(value)]="ariaOnlyValue"',
    '    />',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly sortOptions: GogDropdownOption[] = [',
    "    { id: 'name', name: 'Name' },",
    "    { id: 'date', name: 'Date' },",
    '  ];',
    '  protected readonly sortValue = signal<(string | number)[]>([]);',
    '  protected readonly ariaOnlyValue = signal<(string | number)[]>([]);',
    '}',
  ].join('\n');

  protected readonly appendToBodyHtml = [
    '<gog-multiselect',
    '  label="Country (fixed 240px / 160px panel)"',
    '  [options]="countries"',
    '  [appendToBody]="true"',
    '  dropdownWidth="240px"',
    '  dropdownMaxHeight="160px"',
    '  [(value)]="compactPanelValue"',
    '/>',
  ].join('\n');
  protected readonly appendToBodyTs = [
    "import { Component, signal } from '@angular/core';",
    "import { GogDropdownOption, MultiselectComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [MultiselectComponent],',
    '  template: `',
    '    <gog-multiselect',
    '      label="Country (fixed 240px / 160px panel)"',
    '      [options]="countries"',
    '      [appendToBody]="true"',
    '      dropdownWidth="240px"',
    '      dropdownMaxHeight="160px"',
    '      [(value)]="compactPanelValue"',
    '    />',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly countries: GogDropdownOption[] = Array.from({ length: 20 }, (_, i) => ({',
    '    id: `country-${i}`,',
    '    name: `Country ${i + 1}`,',
    '  }));',
    '  protected readonly compactPanelValue = signal<(string | number)[]>([]);',
    '}',
  ].join('\n');
}
