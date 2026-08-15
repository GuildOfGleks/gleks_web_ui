// GENERATED FILE — do not edit by hand.
// Run `npm run generate:examples` after adding or editing an example in this folder.
// See scripts/generate-example-sources.mjs for why the source text is generated rather than imported.

import type { ExampleSource } from '../../components/shared/example-sources';

import { SelectAccessorsExample } from './select-accessors/example';
import { SelectAppendToBodyExample } from './select-append-to-body/example';
import { SelectChevronExample } from './select-chevron/example';
import { SelectClearableExample } from './select-clearable/example';
import { SelectFilterExample } from './select-filter/example';
import { SelectFormExample } from './select-form/example';
import { SelectFullWidthExample } from './select-full-width/example';
import { SelectOptionSlotExample } from './select-option-slot/example';
import { SelectOverviewExample } from './select-overview/example';
import { SelectSizesExample } from './select-sizes/example';
import { SelectStatesExample } from './select-states/example';

/** The three files of each example in this folder, keyed by the example component itself. */
export const SELECT_EXAMPLE_SOURCES: ReadonlyMap<unknown, ExampleSource> = new Map<
  unknown,
  ExampleSource
>([
  [
    SelectAccessorsExample,
    {
      html: '<div class="example">\n  <gog-select\n    label="Assignee"\n    optionLabel="profile.fullName"\n    optionValue="uuid"\n    optionDisabled="suspended"\n    [options]="users"\n    [(value)]="userId"\n  />\n\n  <gog-select\n    label="Assignee (object)"\n    optionLabel="profile.fullName"\n    [optionValue]="null"\n    [options]="users"\n    [(value)]="userObject"\n  />\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { SelectComponent } from '@guildofgleks/ui';\n\ninterface User {\n  uuid: string;\n  profile: { fullName: string; role: string };\n  suspended: boolean;\n}\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [SelectComponent],\n})\nexport class SelectAccessorsExample {\n  protected readonly users: User[] = [\n    { uuid: 'u-1', profile: { fullName: 'Ada Lovelace', role: 'Engineering' }, suspended: false },\n    { uuid: 'u-2', profile: { fullName: 'Grace Hopper', role: 'Engineering' }, suspended: false },\n    { uuid: 'u-3', profile: { fullName: 'Katherine Johnson', role: 'Research' }, suspended: true },\n  ];\n\n  // An id…\n  protected readonly userId = signal<string | number | null>(null);\n  // …or the object itself, the same reference that went in.\n  protected readonly userObject = signal<User | null>(null);\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 12px;\n  max-width: 420px;\n}',
    },
  ],
  [
    SelectAppendToBodyExample,
    {
      html: '<div class="example">\n  <gog-select\n    label="Country (fixed 220px / 160px panel)"\n    [options]="countries"\n    [appendToBody]="true"\n    dropdownWidth="220px"\n    dropdownMaxHeight="160px"\n    [(value)]="compactPanelValue"\n  />\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { GogDropdownOption, SelectComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [SelectComponent],\n})\nexport class SelectAppendToBodyExample {\n  protected readonly countries: GogDropdownOption[] = Array.from({ length: 20 }, (_, i) => ({\n    id: `country-${i}`,\n    name: `Country ${i + 1}`,\n  }));\n  protected readonly compactPanelValue = signal<string | number | null>(null);\n}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    SelectChevronExample,
    {
      html: '<div class="example">\n  <gog-select [options]="sortOptions" [(value)]="sortValue">\n    <ng-template gogDropdownChevron>\n      <gog-icon name="sort" />\n    </ng-template>\n  </gog-select>\n\n  <gog-select\n    ariaLabel="Country (no visible label)"\n    placeholder="Pick a country"\n    [options]="countries"\n    [(value)]="ariaOnlyValue"\n  />\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport {\n  GogDropdownChevronDirective,\n  GogDropdownOption,\n  IconComponent,\n  SelectComponent,\n} from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [SelectComponent, GogDropdownChevronDirective, IconComponent],\n})\nexport class SelectChevronExample {\n  protected readonly countries: GogDropdownOption[] = [\n    { id: 'de', name: 'Germany' },\n    { id: 'nl', name: 'Netherlands' },\n    { id: 'ua', name: 'Ukraine' },\n  ];\n  protected readonly sortOptions: GogDropdownOption[] = [\n    { id: 'newest', name: 'Newest first' },\n    { id: 'oldest', name: 'Oldest first' },\n  ];\n  protected readonly sortValue = signal<string | number | null>('newest');\n  protected readonly ariaOnlyValue = signal<string | number | null>(null);\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 12px;\n  max-width: 420px;\n}',
    },
  ],
  [
    SelectClearableExample,
    {
      html: '<div class="example">\n  <gog-select label="Plan" [clearable]="true" [options]="plans" [(value)]="plan" />\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { SelectComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [SelectComponent],\n})\nexport class SelectClearableExample {\n  protected readonly plans = [\n    { id: 'free', name: 'Free' },\n    { id: 'pro', name: 'Pro' },\n    { id: 'team', name: 'Team' },\n  ];\n  protected readonly plan = signal<string | number | null>('pro');\n}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    SelectFilterExample,
    {
      html: '<div class="example">\n  <gog-select\n    label="Assignee"\n    optionLabel="profile.fullName"\n    [filter]="true"\n    [filterMatch]="matchNameOrRole"\n    [options]="users"\n    [(value)]="userId"\n  />\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { SelectComponent } from '@guildofgleks/ui';\n\ninterface User {\n  readonly id: number;\n  readonly profile: { readonly fullName: string; readonly role: string };\n}\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [SelectComponent],\n})\nexport class SelectFilterExample {\n  protected readonly users: User[] = [\n    { id: 1, profile: { fullName: 'Ada Lovelace', role: 'Engineering' } },\n    { id: 2, profile: { fullName: 'Grace Hopper', role: 'Engineering' } },\n    { id: 3, profile: { fullName: 'Katherine Johnson', role: 'Research' } },\n  ];\n  protected readonly userId = signal<string | number | null>(null);\n\n  // Searches a field the label never shows.\n  protected readonly matchNameOrRole = (user: User, query: string): boolean => {\n    const needle = query.toLowerCase();\n    return (\n      user.profile.fullName.toLowerCase().includes(needle) ||\n      user.profile.role.toLowerCase().includes(needle)\n    );\n  };\n}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    SelectFormExample,
    {
      html: '<div class="example">\n  <gog-select\n    label="Billing cycle"\n    placeholder="Choose a cycle..."\n    [options]="billingCycles"\n    [formControl]="billingCycleControl"\n    errorMessage="A billing cycle is required."\n    errorDisplay="auto"\n  />\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';\nimport { GogDropdownOption, SelectComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [SelectComponent, ReactiveFormsModule],\n})\nexport class SelectFormExample {\n  protected readonly billingCycles: GogDropdownOption[] = [\n    { id: 'monthly', name: 'Monthly' },\n    { id: 'yearly', name: 'Yearly (2 months free)' },\n  ];\n  protected readonly billingCycleControl = new FormControl<string | number | null>(\n    null,\n    Validators.required,\n  );\n}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    SelectFullWidthExample,
    {
      html: '<div class="example">\n  <gog-select label="Country" [options]="countries" [(value)]="fullWidthCountry" />\n  <gog-select label="Currency" [options]="currencies" [(value)]="currency" [fullWidth]="false" />\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { GogDropdownOption, SelectComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [SelectComponent],\n})\nexport class SelectFullWidthExample {\n  protected readonly fullWidthCountry = signal<string | number | null>(null);\n  protected readonly currency = signal<string | number | null>('usd');\n  protected readonly countries: GogDropdownOption[] = [\n    { id: 'de', name: 'Germany' },\n    { id: 'nl', name: 'Netherlands' },\n    { id: 'pt', name: 'Portugal' },\n    { id: 'ua', name: 'Ukraine' },\n  ];\n  protected readonly currencies: GogDropdownOption[] = [\n    { id: 'eur', name: 'Euro' },\n    { id: 'usd', name: 'US dollar' },\n    { id: 'uah', name: 'Hryvnia' },\n  ];\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 12px;\n  max-width: 420px;\n}',
    },
  ],
  [
    SelectOptionSlotExample,
    {
      html: '<div class="example">\n  <gog-select optionLabel="profile.fullName" [options]="users" [(value)]="userId">\n    <ng-template gogDropdownOption let-user let-label="label">\n      <strong>{{ label }}</strong>\n      <small>{{ asUser(user).profile.role }}</small>\n    </ng-template>\n  </gog-select>\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { GogDropdownOptionDirective, SelectComponent } from '@guildofgleks/ui';\n\ninterface User {\n  readonly id: number;\n  readonly profile: { readonly fullName: string; readonly role: string };\n}\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [SelectComponent, GogDropdownOptionDirective],\n})\nexport class SelectOptionSlotExample {\n  protected readonly users: User[] = [\n    { id: 1, profile: { fullName: 'Ada Lovelace', role: 'Engineering' } },\n    { id: 2, profile: { fullName: 'Grace Hopper', role: 'Engineering' } },\n    { id: 3, profile: { fullName: 'Katherine Johnson', role: 'Research' } },\n  ];\n  protected readonly userId = signal<string | number | null>(null);\n\n  // The slot hands the option back as `unknown`, so narrow it once here.\n  protected asUser(option: unknown): User {\n    return option as User;\n  }\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 12px;\n  max-width: 420px;\n}',
    },
  ],
  [
    SelectOverviewExample,
    {
      html: '<div class="example">\n  <gog-select label="Framework" [options]="frameworks" [(value)]="framework" />\n  <p class="readout">Selected: {{ selectionSummary() }}</p>\n</div>',
      ts: "import { Component, computed, signal } from '@angular/core';\nimport { GogDropdownOption, SelectComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [SelectComponent],\n})\nexport class SelectOverviewExample {\n  protected readonly framework = signal<string | number | null>(null);\n  protected readonly frameworks: GogDropdownOption[] = [\n    { id: 'angular', name: 'Angular' },\n    { id: 'react', name: 'React' },\n    { id: 'vue', name: 'Vue' },\n  ];\n\n  // The value is the option's `id`, not the option — so a label needs a lookup.\n  protected readonly selectionSummary = computed(() => {\n    const id = this.framework();\n    return this.frameworks.find((option) => option.id === id)?.name ?? 'nothing';\n  });\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 12px;\n  max-width: 420px;\n}\n.readout {\n  margin: 0;\n  color: var(--gog-muted-text-color);\n  font-size: 0.9em;\n}',
    },
  ],
  [
    SelectSizesExample,
    {
      html: '<div class="example">\n  @for (sizeOption of sizes; track sizeOption) {\n    <gog-select\n      [label]="\'Size: \' + sizeOption"\n      [size]="sizeOption"\n      [options]="frameworks"\n      [(value)]="sizeDemoValue"\n    />\n  }\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { GogDropdownOption, GogSize, SelectComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [SelectComponent],\n})\nexport class SelectSizesExample {\n  protected readonly frameworks: GogDropdownOption[] = [\n    { id: 'angular', name: 'Angular' },\n    { id: 'react', name: 'React' },\n    { id: 'vue', name: 'Vue' },\n  ];\n  protected readonly sizeDemoValue = signal<string | number | null>('angular');\n  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 12px;\n  max-width: 420px;\n}',
    },
  ],
  [
    SelectStatesExample,
    {
      html: '<div class="example">\n  <gog-select label="Disabled" [options]="frameworks" value="angular" [disabled]="true" />\n\n  <gog-select label="Plan (one option disabled)" [options]="plansWithDisabled" [(value)]="plan" />\n\n  <gog-select\n    label="Required plan"\n    placeholder="Choose a plan..."\n    [options]="plansWithDisabled"\n    [errorMessage]="requiredError()"\n    [(value)]="requiredValue"\n  />\n</div>',
      ts: "import { Component, computed, signal } from '@angular/core';\nimport { GogDropdownOption, SelectComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [SelectComponent],\n})\nexport class SelectStatesExample {\n  protected readonly frameworks: GogDropdownOption[] = [\n    { id: 'angular', name: 'Angular' },\n    { id: 'react', name: 'React' },\n    { id: 'vue', name: 'Vue' },\n  ];\n  protected readonly plansWithDisabled: GogDropdownOption[] = [\n    { id: 'free', name: 'Free' },\n    { id: 'pro', name: 'Pro' },\n    { id: 'enterprise', name: 'Enterprise (contact sales)', disabled: true },\n  ];\n  protected readonly plan = signal<string | number | null>('free');\n  protected readonly requiredValue = signal<string | number | null>(null);\n  protected readonly requiredError = computed(() =>\n    this.requiredValue() === null ? 'Please pick a plan.' : '',\n  );\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 12px;\n  max-width: 420px;\n}',
    },
  ],
]);
