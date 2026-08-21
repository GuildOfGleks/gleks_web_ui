import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  GogDropdownChevronDirective,
  GogDropdownOption,
  GogDropdownOptionDirective,
  GogMultiselectClearIconDirective,
  GogSize,
  IconComponent,
  MultiselectComponent,
} from '@guildofgleks/ui';
import { CodeTabsComponent } from '../../shared/code-tabs/code-tabs';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';

interface ApiInputRow {
  readonly name: string;
  readonly type: string;
  readonly default: string;
  readonly description: string;
  readonly since?: string;
}

/** A deliberately un-`GogDropdownOption`-shaped DTO, to show the accessors doing their job. */
interface User {
  readonly uuid: string;
  readonly profile: { readonly fullName: string; readonly role: string };
  readonly suspended: boolean;
}

const API_INPUTS: readonly ApiInputRow[] = [
  {
    name: 'selectAllLabel',
    type: 'string | undefined',
    default: "'Select all'",
    description:
      "Visible text of the panel's select-all button (shown when showControls is on). Also via GOG_CONFIG.labels.selectAll.",
    since: '21.3.2',
  },
  {
    name: 'clearAllLabel',
    type: 'string | undefined',
    default: "'Clear'",
    description: 'The clear-all button next to it. Also via GOG_CONFIG.labels.clearAll.',
    since: '21.3.2',
  },
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
    type: 'TOption[]',
    default: '[]',
    description:
      'The list of choices — your own objects. GogDropdownOption ({ id, name, disabled? }) is just the shape the default accessors expect, not a requirement.',
  },
  {
    name: 'optionLabel',
    type: 'string | ((o: TOption) => string)',
    default: "'name'",
    description:
      'How an option turns into its visible text: a property path (dot-paths included) or a function.',
  },
  {
    name: 'optionValue',
    type: 'string | ((o: TOption) => unknown) | null',
    default: "'id'",
    description:
      'How an option turns into an emitted value. Set it to null and the control emits the option OBJECTS themselves.',
  },
  {
    name: 'optionDisabled',
    type: 'string | ((o: TOption) => boolean)',
    default: "'disabled'",
    description: 'Which options cannot be picked.',
  },
  {
    name: 'clearable',
    type: 'boolean',
    default: 'GOG_CONFIG.control.clearable ?? true',
    description:
      'Adds a clear button in the outermost trailing position. Deliberately the one control that defaults to true: gog-multiselect shipped a clear button before this input existed, and defaulting it to false would have silently removed it.',
  },
  {
    name: 'clearAriaLabel',
    type: 'string',
    default: "'Clear selection'",
    description: 'Accessible name for that clear button.',
  },
  {
    name: 'filter',
    type: 'boolean',
    default: 'GOG_CONFIG.dropdown.filter ?? false',
    description:
      'Puts a search box in the panel, matching case-insensitively on the resolved optionLabel. "Select all" then takes only the VISIBLE options, so it means what it says while a filter is active.',
  },
  {
    name: 'filterPosition',
    type: "'top' | 'bottom'",
    default: "GOG_CONFIG.dropdown.filterPosition ?? 'top'",
    description:
      'Which end of the panel the search box sticks to — the same vocabulary as controlsPosition, rather than a second one for the same idea.',
  },
  {
    name: 'filterPlaceholder / filterEmptyMessage',
    type: 'string',
    default: "'Search...' / 'No matches'",
    description: 'Wording for the search box and for the empty result.',
  },
  {
    name: 'filterMatch',
    type: '((option: TOption, query: string) => boolean) | null',
    default: 'null',
    description: 'Replaces the default case-insensitive substring match with your own predicate.',
  },
  {
    name: 'floatLabel',
    type: "'none' | 'in' | 'on' | 'over'",
    default: "GOG_CONFIG.floatLabel.variant ?? 'none'",
    description:
      'Rests the label inside the field like a placeholder and floats it up once the selection is non-empty or the field has focus.',
  },
  {
    name: 'floatLabelShowPlaceholder',
    type: 'boolean',
    default: 'GOG_CONFIG.floatLabel.showPlaceholder ?? false',
    description: 'Reveals the placeholder once the label has floated out of the way.',
  },
  {
    name: 'minWidth',
    type: 'string | null',
    default: 'null (--gog-multiselect-min-width, 120px)',
    description:
      'Floor for an auto-width trigger, any CSS length — so a short selection cannot collapse the field to its own chrome.',
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
    name: 'errorMessage',
    type: 'string',
    default: "''",
    description: 'Error text to display. Visibility is governed by errorDisplay.',
  },
  {
    name: 'errorDisplay',
    type: "'auto' | 'manual'",
    default: "GOG_CONFIG.control.errorDisplay ?? 'manual'",
    description:
      "'manual': shown for as long as errorMessage is non-empty — you decide the timing. 'auto': shown once the attached FormControl is touched and invalid; falls back to manual without one.",
  },
  {
    name: 'size',
    type: "'xsm' | 'sm' | 'md' | 'lg' | 'slg'",
    default: "GOG_CONFIG.control.size ?? 'md'",
    description: 'Field height, padding, and font size.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Disables the trigger and closes the panel if it is open.',
  },
  {
    name: 'fullWidth',
    type: 'boolean',
    default: 'true',
    description:
      'Fills its container by default. Set false to shrink to fit the selected summary instead.',
  },
  {
    name: 'dropdownDirection',
    type: "'auto' | 'up' | 'down'",
    default: "GOG_CONFIG.dropdown.direction ?? 'auto'",
    description:
      "Which side the panel opens on. 'auto' flips to whichever side has room in the viewport.",
  },
  {
    name: 'dropdownZIndex',
    type: 'number | null',
    default: 'null',
    description:
      'Explicit stacking order for the panel. Left unset it falls back to the --gog-dropdown-z token.',
  },
  {
    name: 'dropdownWidth',
    type: 'string | null',
    default: 'null',
    description:
      'Fixed panel width, any CSS length. Applies only with appendToBody. Left unset, the panel sizes to its own content with the trigger width as a floor, capped by --gog-{select,multiselect}-panel-max-width — so picking a short option no longer cuts the longer ones off the list.',
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
    default: 'GOG_CONFIG.dropdown.appendToBody ?? false',
    description:
      "Portals the panel into document.body instead of rendering it inline — escapes an ancestor's scroll/overflow clipping.",
  },
];

@Component({
  selector: 'app-multiselect-doc-page',
  imports: [
    MultiselectComponent,
    GogDropdownOptionDirective,
    GogDropdownChevronDirective,
    GogMultiselectClearIconDirective,
    IconComponent,
    MarkdownComponent,
    CodeTabsComponent,
    RouterLink,
    ReactiveFormsModule,
    SinceBadgeComponent,
  ],
  templateUrl: './multiselect-doc-page.html',
  styleUrl: './multiselect-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiselectDocPage {
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];

  protected readonly apiInputs = API_INPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'multiselect')?.tokens ?? [];

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
    '<gog-multiselect [options]="sortOptions" [(value)]="sortValue">',
    '  <ng-template gogDropdownChevron>',
    '    <gog-icon name="sort" />',
    '  </ng-template>',
    '  <ng-template gogMultiselectClearIcon>',
    '    <gog-icon name="error" />',
    '  </ng-template>',
    '</gog-multiselect>',
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
    'import {',
    '  GogDropdownChevronDirective,',
    '  GogDropdownOption,',
    '  GogMultiselectClearIconDirective,',
    '  IconComponent,',
    '  MultiselectComponent,',
    "} from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [',
    '    MultiselectComponent,',
    '    GogDropdownChevronDirective,',
    '    GogMultiselectClearIconDirective,',
    '    IconComponent,',
    '  ],',
    '  template: `',
    '    <gog-multiselect [options]="sortOptions" [(value)]="sortValue">',
    '      <ng-template gogDropdownChevron>',
    '        <gog-icon name="sort" />',
    '      </ng-template>',
    '      <ng-template gogMultiselectClearIcon>',
    '        <gog-icon name="error" />',
    '      </ng-template>',
    '    </gog-multiselect>',
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

  // ---- 21.3.0: option accessors, filtering, option slot -----------------------------------

  protected readonly users: User[] = [
    { uuid: 'u1', profile: { fullName: 'Ada Lovelace', role: 'Engineering' }, suspended: false },
    { uuid: 'u2', profile: { fullName: 'Grace Hopper', role: 'Engineering' }, suspended: false },
    { uuid: 'u3', profile: { fullName: 'Katherine Johnson', role: 'Research' }, suspended: false },
    { uuid: 'u4', profile: { fullName: 'Radia Perlman', role: 'Networking' }, suspended: true },
  ];
  protected readonly reviewerIds = signal<(string | number)[]>([]);
  protected readonly slotReviewerIds = signal<(string | number)[]>([]);
  protected readonly filteredCountries = signal<(string | number)[]>([]);
  protected readonly overflowCountries = signal<(string | number)[]>([]);

  protected readonly accessorsHtml = [
    '<gog-multiselect',
    '  label="Reviewers"',
    '  optionLabel="profile.fullName"',
    '  optionValue="uuid"',
    '  optionDisabled="suspended"',
    '  [options]="users"',
    '  [(value)]="reviewerIds"',
    '/>',
  ].join('\n');
  protected readonly accessorsTs = [
    "import { Component, signal } from '@angular/core';",
    "import { MultiselectComponent } from '@guildofgleks/ui';",
    '',
    'interface User {',
    '  uuid: string;',
    '  profile: { fullName: string; role: string };',
    '  suspended: boolean;',
    '}',
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [MultiselectComponent],',
    '  template: `',
    '    <gog-multiselect',
    '      label="Reviewers"',
    '      optionLabel="profile.fullName"',
    '      optionValue="uuid"',
    '      optionDisabled="suspended"',
    '      [options]="users"',
    '      [(value)]="reviewerIds"',
    '    />',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly users: User[] = [/* straight from the API */];',
    '  protected readonly reviewerIds = signal<(string | number)[]>([]);',
    '}',
  ].join('\n');

  protected readonly filterHtml = [
    '<gog-multiselect',
    '  label="Country"',
    '  [filter]="true"',
    '  [showControls]="true"',
    '  filterPlaceholder="Search countries…"',
    '  filterEmptyMessage="No country matches"',
    '  [options]="countries"',
    '  [(value)]="selected"',
    '/>',
  ].join('\n');
  protected readonly filterTs = [
    "import { Component, signal } from '@angular/core';",
    "import { MultiselectComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [MultiselectComponent],',
    '  template: `',
    '    <gog-multiselect',
    '      label="Country"',
    '      [filter]="true"',
    '      [showControls]="true"',
    '      [options]="countries"',
    '      [(value)]="selected"',
    '    />',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  // With a filter active, "select all" takes only what is visible.',
    '  protected readonly selected = signal<(string | number)[]>([]);',
    '}',
  ].join('\n');

  protected readonly optionSlotHtml = [
    '<gog-multiselect',
    '  label="Reviewers"',
    '  optionLabel="profile.fullName"',
    '  optionValue="uuid"',
    '  [options]="users"',
    '  [(value)]="reviewerIds"',
    '>',
    '  <ng-template gogDropdownOption let-user let-label="label">',
    '    <strong>{{ label }}</strong>',
    '    <small>{{ user.profile.role }}</small>',
    '  </ng-template>',
    '</gog-multiselect>',
  ].join('\n');
  protected readonly optionSlotTs = [
    "import { Component, signal } from '@angular/core';",
    "import { GogDropdownOptionDirective, MultiselectComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [MultiselectComponent, GogDropdownOptionDirective],',
    '  template: `',
    '    <gog-multiselect optionLabel="profile.fullName" [options]="users" [(value)]="reviewerIds">',
    '      <ng-template gogDropdownOption let-user let-label="label">',
    '        <strong>{{ label }}</strong>',
    '        <small>{{ asUser(user).profile.role }}</small>',
    '      </ng-template>',
    '    </gog-multiselect>',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  // The slot hands the option back as `unknown`, so narrow it once here.',
    '  protected asUser(option: unknown): User {',
    '    return option as User;',
    '  }',
    '}',
  ].join('\n');

  protected asUser(option: unknown): User {
    return option as User;
  }
}
