// GENERATED FILE — do not edit by hand.
// Run `npm run generate:examples` after adding or editing an example in this folder.
// See scripts/generate-example-sources.mjs for why the source text is generated rather than imported.

import type { ExampleSource } from '../../components/shared/example-sources';

import { MultiselectAccessorsExample } from './multiselect-accessors/example';
import { MultiselectAppendToBodyExample } from './multiselect-append-to-body/example';
import { MultiselectChevronExample } from './multiselect-chevron/example';
import { MultiselectControlsExample } from './multiselect-controls/example';
import { MultiselectFilterExample } from './multiselect-filter/example';
import { MultiselectFormExample } from './multiselect-form/example';
import { MultiselectFullWidthExample } from './multiselect-full-width/example';
import { MultiselectOptionSlotExample } from './multiselect-option-slot/example';
import { MultiselectOverviewExample } from './multiselect-overview/example';
import { MultiselectSelectedNamesExample } from './multiselect-selected-names/example';
import { MultiselectSizesExample } from './multiselect-sizes/example';
import { MultiselectStatesExample } from './multiselect-states/example';

/** The three files of each example in this folder, keyed by the example component itself. */
export const MULTISELECT_EXAMPLE_SOURCES: ReadonlyMap<unknown, ExampleSource> = new Map<
  unknown,
  ExampleSource
>([
  [
    MultiselectAccessorsExample,
    {
      html: '<div class="example">\n  <gog-multiselect\n    label="Reviewers"\n    optionLabel="profile.fullName"\n    optionValue="uuid"\n    optionDisabled="suspended"\n    [options]="users"\n    [(value)]="reviewerIds"\n  />\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { MultiselectComponent } from '@guildofgleks/ui';\n\ninterface User {\n  uuid: string;\n  profile: { fullName: string; role: string };\n  suspended: boolean;\n}\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [MultiselectComponent],\n})\nexport class MultiselectAccessorsExample {\n  protected readonly users: User[] = [\n    { uuid: 'u-1', profile: { fullName: 'Ada Lovelace', role: 'Engineering' }, suspended: false },\n    { uuid: 'u-2', profile: { fullName: 'Grace Hopper', role: 'Engineering' }, suspended: false },\n    { uuid: 'u-3', profile: { fullName: 'Katherine Johnson', role: 'Research' }, suspended: true },\n  ];\n  protected readonly reviewerIds = signal<(string | number)[]>([]);\n}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    MultiselectAppendToBodyExample,
    {
      html: '<div class="example">\n  <gog-multiselect\n    label="Country (fixed 240px / 160px panel)"\n    [options]="countries"\n    [appendToBody]="true"\n    dropdownWidth="240px"\n    dropdownMaxHeight="160px"\n    [(value)]="compactPanelValue"\n  />\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { GogDropdownOption, MultiselectComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [MultiselectComponent],\n})\nexport class MultiselectAppendToBodyExample {\n  protected readonly countries: GogDropdownOption[] = Array.from({ length: 20 }, (_, i) => ({\n    id: `country-${i}`,\n    name: `Country ${i + 1}`,\n  }));\n  protected readonly compactPanelValue = signal<(string | number)[]>([]);\n}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    MultiselectChevronExample,
    {
      html: '<div class="example">\n  <gog-multiselect [options]="sortOptions" [(value)]="sortValue">\n    <ng-template gogDropdownChevron>\n      <gog-icon name="sort" />\n    </ng-template>\n    <ng-template gogMultiselectClearIcon>\n      <gog-icon name="error" />\n    </ng-template>\n  </gog-multiselect>\n\n  <gog-multiselect\n    ariaLabel="Tags (no visible label)"\n    placeholder="Pick tags"\n    [options]="tags"\n    [(value)]="ariaOnlyValue"\n  />\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport {\n  GogDropdownChevronDirective,\n  GogDropdownOption,\n  GogMultiselectClearIconDirective,\n  IconComponent,\n  MultiselectComponent,\n} from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [\n    MultiselectComponent,\n    GogDropdownChevronDirective,\n    GogMultiselectClearIconDirective,\n    IconComponent,\n  ],\n})\nexport class MultiselectChevronExample {\n  protected readonly tags: GogDropdownOption[] = [\n    { id: 'bug', name: 'Bug' },\n    { id: 'feature', name: 'Feature' },\n    { id: 'chore', name: 'Chore' },\n  ];\n  protected readonly sortOptions: GogDropdownOption[] = [\n    { id: 'name', name: 'Name' },\n    { id: 'date', name: 'Date' },\n  ];\n  protected readonly sortValue = signal<(string | number)[]>([]);\n  protected readonly ariaOnlyValue = signal<(string | number)[]>([]);\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 12px;\n  max-width: 420px;\n}',
    },
  ],
  [
    MultiselectControlsExample,
    {
      html: '<div class="example">\n  <gog-multiselect\n    label="Top (default)"\n    [options]="countries"\n    [showControls]="true"\n    [(value)]="topControlsValue"\n  />\n\n  <gog-multiselect\n    label="Bottom"\n    [options]="countries"\n    [showControls]="true"\n    controlsPosition="bottom"\n    [(value)]="bottomControlsValue"\n  />\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { GogDropdownOption, MultiselectComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [MultiselectComponent],\n})\nexport class MultiselectControlsExample {\n  protected readonly countries: GogDropdownOption[] = [\n    { id: 'de', name: 'Germany' },\n    { id: 'nl', name: 'Netherlands' },\n    { id: 'pt', name: 'Portugal' },\n    { id: 'ua', name: 'Ukraine' },\n  ];\n  protected readonly topControlsValue = signal<(string | number)[]>([]);\n  protected readonly bottomControlsValue = signal<(string | number)[]>([]);\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 12px;\n  max-width: 420px;\n}',
    },
  ],
  [
    MultiselectFilterExample,
    {
      html: '<div class="example">\n  <gog-multiselect\n    label="Country"\n    [filter]="true"\n    [showControls]="true"\n    [options]="countries"\n    [(value)]="selected"\n  />\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { MultiselectComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [MultiselectComponent],\n})\nexport class MultiselectFilterExample {\n  protected readonly countries = [\n    { id: 'de', name: 'Germany' },\n    { id: 'nl', name: 'Netherlands' },\n    { id: 'pt', name: 'Portugal' },\n    { id: 'ua', name: 'Ukraine' },\n  ];\n\n  // With a filter active, \"select all\" takes only what is visible.\n  protected readonly selected = signal<(string | number)[]>([]);\n}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    MultiselectFormExample,
    {
      html: '<div class="example">\n  <gog-multiselect\n    label="Permissions"\n    placeholder="Pick at least one..."\n    [options]="permissionsWithDisabled"\n    [formControl]="permissionsFormControl"\n    errorMessage="Pick at least one permission."\n    errorDisplay="auto"\n  />\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';\nimport { MultiselectComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [MultiselectComponent, ReactiveFormsModule],\n})\nexport class MultiselectFormExample {\n  protected readonly permissionsWithDisabled = [\n    { id: 'read', name: 'Read' },\n    { id: 'write', name: 'Write' },\n    { id: 'admin', name: 'Admin (owner only)', disabled: true },\n  ];\n\n  protected readonly permissionsFormControl = new FormControl<(string | number)[]>([], {\n    nonNullable: true,\n    validators: Validators.required,\n  });\n}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    MultiselectFullWidthExample,
    {
      html: '<div class="example">\n  <gog-multiselect label="Features" [options]="features" [(value)]="fullWidthFeatures" />\n  <gog-multiselect label="Tags" [options]="tags" [(value)]="fullWidthTags" [fullWidth]="false" />\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { GogDropdownOption, MultiselectComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [MultiselectComponent],\n})\nexport class MultiselectFullWidthExample {\n  protected readonly fullWidthFeatures = signal<(string | number)[]>([]);\n  protected readonly fullWidthTags = signal<(string | number)[]>(['bug']);\n  protected readonly features: GogDropdownOption[] = [\n    { id: 'sso', name: 'SSO' },\n    { id: 'audit', name: 'Audit log' },\n    { id: 'api', name: 'API access' },\n  ];\n  protected readonly tags: GogDropdownOption[] = [\n    { id: 'bug', name: 'Bug' },\n    { id: 'feature', name: 'Feature' },\n    { id: 'chore', name: 'Chore' },\n  ];\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 12px;\n  max-width: 420px;\n}',
    },
  ],
  [
    MultiselectOptionSlotExample,
    {
      html: '<div class="example">\n  <gog-multiselect optionLabel="profile.fullName" [options]="users" [(value)]="reviewerIds">\n    <ng-template gogDropdownOption let-user let-label="label">\n      <strong>{{ label }}</strong>\n      <small>{{ asUser(user).profile.role }}</small>\n    </ng-template>\n  </gog-multiselect>\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { GogDropdownOptionDirective, MultiselectComponent } from '@guildofgleks/ui';\n\ninterface User {\n  readonly id: number;\n  readonly profile: { readonly fullName: string; readonly role: string };\n}\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [MultiselectComponent, GogDropdownOptionDirective],\n})\nexport class MultiselectOptionSlotExample {\n  protected readonly users: User[] = [\n    { id: 1, profile: { fullName: 'Ada Lovelace', role: 'Engineering' } },\n    { id: 2, profile: { fullName: 'Grace Hopper', role: 'Engineering' } },\n    { id: 3, profile: { fullName: 'Katherine Johnson', role: 'Research' } },\n  ];\n  protected readonly reviewerIds = signal<(string | number)[]>([]);\n\n  // The slot hands the option back as `unknown`, so narrow it once here.\n  protected asUser(option: unknown): User {\n    return option as User;\n  }\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 12px;\n  max-width: 420px;\n}',
    },
  ],
  [
    MultiselectOverviewExample,
    {
      html: '<div class="example">\n  <gog-multiselect label="Features" [options]="features" [(value)]="selectedFeatures" />\n  <p class="readout">Selected: {{ featureSummary() }}</p>\n</div>',
      ts: "import { Component, computed, signal } from '@angular/core';\nimport { GogDropdownOption, MultiselectComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [MultiselectComponent],\n})\nexport class MultiselectOverviewExample {\n  protected readonly selectedFeatures = signal<(string | number)[]>([]);\n  protected readonly features: GogDropdownOption[] = [\n    { id: 'toast', name: 'Toast' },\n    { id: 'dialog', name: 'Dialog' },\n    { id: 'forms', name: 'Forms' },\n    { id: 'table', name: 'Table' },\n  ];\n\n  // The value is an array of option `id`s, not of options — so labels need a lookup.\n  protected readonly featureSummary = computed(() => {\n    const ids = this.selectedFeatures();\n    if (ids.length === 0) return 'nothing';\n    return this.features\n      .filter((option) => ids.includes(option.id))\n      .map((option) => option.name)\n      .join(', ');\n  });\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 12px;\n  max-width: 420px;\n}\n.readout {\n  margin: 0;\n  color: var(--gog-muted-text-color);\n  font-size: 0.9em;\n}',
    },
  ],
  [
    MultiselectSelectedNamesExample,
    {
      html: '<div class="example">\n  <gog-multiselect #ms label="Tags" [options]="tags" [(value)]="selectedTags" />\n  <p>Selected: {{ ms.selectedNames() }}</p>\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { GogDropdownOption, MultiselectComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [MultiselectComponent],\n})\nexport class MultiselectSelectedNamesExample {\n  protected readonly selectedTags = signal<(string | number)[]>(['bug']);\n  protected readonly tags: GogDropdownOption[] = [\n    { id: 'bug', name: 'Bug' },\n    { id: 'feature', name: 'Feature' },\n    { id: 'chore', name: 'Chore' },\n  ];\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 12px;\n  max-width: 420px;\n}',
    },
  ],
  [
    MultiselectSizesExample,
    {
      html: '<div class="example">\n  @for (sizeOption of sizes; track sizeOption) {\n    <gog-multiselect\n      [label]="\'Size: \' + sizeOption"\n      [size]="sizeOption"\n      [options]="features"\n      [(value)]="sizeDemoValue"\n    />\n  }\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { GogDropdownOption, GogSize, MultiselectComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [MultiselectComponent],\n})\nexport class MultiselectSizesExample {\n  protected readonly features: GogDropdownOption[] = [\n    { id: 'sso', name: 'SSO' },\n    { id: 'audit', name: 'Audit log' },\n  ];\n  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];\n  protected readonly sizeDemoValue = signal<(string | number)[]>(['toast']);\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 12px;\n  max-width: 420px;\n}',
    },
  ],
  [
    MultiselectStatesExample,
    {
      html: '<div class="example">\n  <gog-multiselect label="Disabled" [options]="features" [value]="[\'toast\']" [disabled]="true" />\n\n  <gog-multiselect\n    label="Permissions (one disabled)"\n    [options]="permissionsWithDisabled"\n    [(value)]="permissions"\n  />\n\n  <gog-multiselect\n    label="Required tags"\n    placeholder="Pick at least one..."\n    [options]="permissionsWithDisabled"\n    [errorMessage]="requiredError()"\n    [(value)]="requiredValue"\n  />\n</div>',
      ts: "import { Component, computed, signal } from '@angular/core';\nimport { GogDropdownOption, MultiselectComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [MultiselectComponent],\n})\nexport class MultiselectStatesExample {\n  protected readonly features: GogDropdownOption[] = [\n    { id: 'sso', name: 'SSO' },\n    { id: 'audit', name: 'Audit log' },\n    { id: 'api', name: 'API access' },\n  ];\n  protected readonly permissionsWithDisabled: GogDropdownOption[] = [\n    { id: 'read', name: 'Read' },\n    { id: 'write', name: 'Write' },\n    { id: 'admin', name: 'Admin (contact owner)', disabled: true },\n  ];\n  protected readonly permissions = signal<(string | number)[]>(['read']);\n  protected readonly requiredValue = signal<(string | number)[]>([]);\n  protected readonly requiredError = computed(() =>\n    this.requiredValue().length === 0 ? 'Pick at least one option.' : '',\n  );\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 12px;\n  max-width: 420px;\n}',
    },
  ],
]);
