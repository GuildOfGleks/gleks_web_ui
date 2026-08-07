import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { GogDropdownOption, GogSize, IconComponent, SelectComponent } from '@guildofgleks/ui';
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
    type: 'string | number | null (model)',
    default: 'null',
    description:
      'Two-way bindable selected option id via [(value)]. Also driven by Angular Forms through writeValue/registerOnChange when used with formControlName/[formControl]/ngModel.',
  },
  { name: 'label', type: 'string', default: "''", description: 'Field label.' },
  {
    name: 'ariaLabel',
    type: 'string',
    default: "''",
    description: 'Accessible name for the field when there is no visible label.',
  },
  {
    name: 'inputId',
    type: 'string',
    default: "''",
    description: "id on the trigger button, and target of the label's for attribute.",
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
      'Fills its container by default. Set false to shrink to fit the selected label instead.',
  },
  {
    name: 'dropdownDirection',
    type: "'auto' | 'up' | 'down'",
    default: "'auto'",
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
      'Fixed panel width, any CSS length. Applies only with appendToBody — otherwise the panel matches the trigger width.',
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
    description:
      "Portals the panel into document.body instead of rendering it inline — escapes an ancestor's scroll/overflow clipping.",
  },
  {
    name: 'chevronTemplate',
    type: 'TemplateRef<unknown> | null',
    default: 'null',
    description: 'Custom trigger icon, in place of the default chevron.',
  },
];

@Component({
  selector: 'app-select-doc-page',
  imports: [
    SelectComponent,
    IconComponent,
    MarkdownComponent,
    CodeTabsComponent,
    RouterLink,
    ReactiveFormsModule,
  ],
  templateUrl: './select-doc-page.html',
  styleUrl: './select-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectDocPage {
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];

  protected readonly apiInputs = API_INPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'select')?.tokens ?? [];

  protected readonly framework = signal<string | number | null>(null);
  protected readonly frameworks: GogDropdownOption[] = [
    { id: 'angular', name: 'Angular' },
    { id: 'react', name: 'React' },
    { id: 'vue', name: 'Vue' },
  ];
  protected readonly selectionSummary = computed(
    () => this.frameworks.find((option) => option.id === this.framework())?.name ?? 'None selected',
  );

  protected readonly sizeDemoValue = signal<string | number | null>('angular');

  protected readonly plansWithDisabled: GogDropdownOption[] = [
    { id: 'free', name: 'Free' },
    { id: 'pro', name: 'Pro' },
    { id: 'enterprise', name: 'Enterprise (contact sales)', disabled: true },
  ];
  protected readonly plan = signal<string | number | null>('free');
  protected readonly requiredValue = signal<string | number | null>(null);
  protected readonly requiredError = computed(() =>
    this.requiredValue() === null ? 'Please pick a plan.' : '',
  );

  protected readonly billingCycles: GogDropdownOption[] = [
    { id: 'monthly', name: 'Monthly' },
    { id: 'yearly', name: 'Yearly (2 months free)' },
  ];
  protected readonly billingCycleControl = new FormControl<string | number | null>(
    null,
    Validators.required,
  );

  protected readonly countries: GogDropdownOption[] = [
    { id: 'de', name: 'Germany' },
    { id: 'fr', name: 'France' },
    { id: 'es', name: 'Spain' },
    { id: 'it', name: 'Italy' },
    { id: 'pl', name: 'Poland' },
  ];
  protected readonly fullWidthCountry = signal<string | number | null>(null);
  protected readonly currencies: GogDropdownOption[] = [
    { id: 'usd', name: 'USD' },
    { id: 'eur', name: 'EUR' },
    { id: 'gbp', name: 'GBP' },
  ];
  protected readonly currency = signal<string | number | null>('usd');

  protected readonly sortOptions: GogDropdownOption[] = [
    { id: 'newest', name: 'Newest first' },
    { id: 'oldest', name: 'Oldest first' },
  ];
  protected readonly sortValue = signal<string | number | null>('newest');
  protected readonly ariaOnlyValue = signal<string | number | null>(null);

  protected readonly manyCountries: GogDropdownOption[] = Array.from({ length: 20 }, (_, i) => ({
    id: `country-${i}`,
    name: `Country ${i + 1}`,
  }));
  protected readonly compactPanelValue = signal<string | number | null>(null);

  protected readonly importSnippet =
    "```typescript\nimport { SelectComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [SelectComponent],\n})\n```";

  protected readonly overviewHtml = [
    '<gog-select label="Framework" [options]="frameworks" [(value)]="framework" />',
  ].join('\n');
  protected readonly overviewTs = [
    "import { Component, signal } from '@angular/core';",
    "import { GogDropdownOption, SelectComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [SelectComponent],',
    '  template: `<gog-select label="Framework" [options]="frameworks" [(value)]="framework" />`,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly framework = signal<string | number | null>(null);',
    '  protected readonly frameworks: GogDropdownOption[] = [',
    "    { id: 'angular', name: 'Angular' },",
    "    { id: 'react', name: 'React' },",
    "    { id: 'vue', name: 'Vue' },",
    '  ];',
    '}',
  ].join('\n');

  protected readonly sizesHtml = [
    '@for (sizeOption of sizes; track sizeOption) {',
    '  <gog-select [label]="\'Size: \' + sizeOption" [size]="sizeOption" [options]="frameworks" [(value)]="sizeDemoValue" />',
    '}',
  ].join('\n');
  protected readonly sizesTs = [
    "import { Component } from '@angular/core';",
    "import { GogDropdownOption, GogSize, SelectComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [SelectComponent],',
    '  template: `',
    '    @for (sizeOption of sizes; track sizeOption) {',
    '      <gog-select [label]="\'Size: \' + sizeOption" [size]="sizeOption" [options]="frameworks" [(value)]="sizeDemoValue" />',
    '    }',
    '  `,',
    '})',
    'export class ExampleComponent {',
    "  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];",
    '  protected readonly frameworks: GogDropdownOption[] = [/* ... */];',
    "  protected readonly sizeDemoValue = signal<string | number | null>('angular');",
    '}',
  ].join('\n');

  protected readonly statesHtml = [
    '<gog-select label="Disabled" [options]="frameworks" value="angular" [disabled]="true" />',
    '',
    '<gog-select label="Plan (one option disabled)" [options]="plansWithDisabled" [(value)]="plan" />',
    '',
    '<gog-select',
    '  label="Required plan"',
    '  placeholder="Choose a plan..."',
    '  [options]="plansWithDisabled"',
    "  [errorMessage]=\"requiredValue() === null ? 'Please pick a plan.' : ''\"",
    '  [(value)]="requiredValue"',
    '/>',
  ].join('\n');
  protected readonly statesTs = [
    "import { Component, computed, signal } from '@angular/core';",
    "import { GogDropdownOption, SelectComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [SelectComponent],',
    '  template: `',
    '    <gog-select label="Disabled" [options]="frameworks" value="angular" [disabled]="true" />',
    '',
    '    <gog-select label="Plan (one option disabled)" [options]="plansWithDisabled" [(value)]="plan" />',
    '',
    '    <gog-select',
    '      label="Required plan"',
    '      placeholder="Choose a plan..."',
    '      [options]="plansWithDisabled"',
    '      [errorMessage]="requiredError()"',
    '      [(value)]="requiredValue"',
    '    />',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly plansWithDisabled: GogDropdownOption[] = [',
    "    { id: 'free', name: 'Free' },",
    "    { id: 'pro', name: 'Pro' },",
    "    { id: 'enterprise', name: 'Enterprise (contact sales)', disabled: true },",
    '  ];',
    "  protected readonly plan = signal<string | number | null>('free');",
    '  protected readonly requiredValue = signal<string | number | null>(null);',
    '  protected readonly requiredError = computed(() =>',
    "    this.requiredValue() === null ? 'Please pick a plan.' : '',",
    '  );',
    '}',
  ].join('\n');

  protected readonly formHtml = [
    '<gog-select',
    '  label="Billing cycle"',
    '  placeholder="Choose a cycle..."',
    '  [options]="billingCycles"',
    '  [formControl]="billingCycleControl"',
    '  errorMessage="A billing cycle is required."',
    '  errorDisplay="auto"',
    '/>',
  ].join('\n');
  protected readonly formTs = [
    "import { Component } from '@angular/core';",
    "import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';",
    "import { GogDropdownOption, SelectComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [SelectComponent, ReactiveFormsModule],',
    '  template: `',
    '    <gog-select',
    '      label="Billing cycle"',
    '      placeholder="Choose a cycle..."',
    '      [options]="billingCycles"',
    '      [formControl]="billingCycleControl"',
    '      errorMessage="A billing cycle is required."',
    '      errorDisplay="auto"',
    '    />',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly billingCycles: GogDropdownOption[] = [',
    "    { id: 'monthly', name: 'Monthly' },",
    "    { id: 'yearly', name: 'Yearly (2 months free)' },",
    '  ];',
    '  protected readonly billingCycleControl = new FormControl<string | number | null>(',
    '    null,',
    '    Validators.required,',
    '  );',
    '}',
  ].join('\n');

  protected readonly fullWidthHtml = [
    '<gog-select label="Country" [options]="countries" [(value)]="fullWidthCountry" />',
    '<gog-select label="Currency" [options]="currencies" [(value)]="currency" [fullWidth]="false" />',
  ].join('\n');
  protected readonly fullWidthTs = [
    "import { Component, signal } from '@angular/core';",
    "import { GogDropdownOption, SelectComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [SelectComponent],',
    '  template: `',
    '    <gog-select label="Country" [options]="countries" [(value)]="fullWidthCountry" />',
    '    <gog-select label="Currency" [options]="currencies" [(value)]="currency" [fullWidth]="false" />',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly fullWidthCountry = signal<string | number | null>(null);',
    "  protected readonly currency = signal<string | number | null>('usd');",
    '  protected readonly countries: GogDropdownOption[] = [/* ... */];',
    '  protected readonly currencies: GogDropdownOption[] = [/* ... */];',
    '}',
  ].join('\n');

  protected readonly chevronHtml = [
    '<ng-template #sortChevron>',
    '  <gog-icon name="sort" />',
    '</ng-template>',
    '',
    '<gog-select [options]="sortOptions" [chevronTemplate]="sortChevron" [(value)]="sortValue" />',
    '',
    '<gog-select',
    '  ariaLabel="Country (no visible label)"',
    '  placeholder="Pick a country"',
    '  [options]="countries"',
    '  [(value)]="ariaOnlyValue"',
    '/>',
  ].join('\n');
  protected readonly chevronTs = [
    "import { Component, signal } from '@angular/core';",
    "import { GogDropdownOption, IconComponent, SelectComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [SelectComponent, IconComponent],',
    '  template: `',
    '    <ng-template #sortChevron>',
    '      <gog-icon name="sort" />',
    '    </ng-template>',
    '',
    '    <gog-select [options]="sortOptions" [chevronTemplate]="sortChevron" [(value)]="sortValue" />',
    '',
    '    <gog-select',
    '      ariaLabel="Country (no visible label)"',
    '      placeholder="Pick a country"',
    '      [options]="countries"',
    '      [(value)]="ariaOnlyValue"',
    '    />',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly sortOptions: GogDropdownOption[] = [',
    "    { id: 'newest', name: 'Newest first' },",
    "    { id: 'oldest', name: 'Oldest first' },",
    '  ];',
    "  protected readonly sortValue = signal<string | number | null>('newest');",
    '  protected readonly ariaOnlyValue = signal<string | number | null>(null);',
    '}',
  ].join('\n');

  protected readonly appendToBodyHtml = [
    '<gog-select',
    '  label="Country (fixed 220px / 160px panel)"',
    '  [options]="countries"',
    '  [appendToBody]="true"',
    '  dropdownWidth="220px"',
    '  dropdownMaxHeight="160px"',
    '  [(value)]="compactPanelValue"',
    '/>',
  ].join('\n');
  protected readonly appendToBodyTs = [
    "import { Component, signal } from '@angular/core';",
    "import { GogDropdownOption, SelectComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [SelectComponent],',
    '  template: `',
    '    <gog-select',
    '      label="Country (fixed 220px / 160px panel)"',
    '      [options]="countries"',
    '      [appendToBody]="true"',
    '      dropdownWidth="220px"',
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
    '  protected readonly compactPanelValue = signal<string | number | null>(null);',
    '}',
  ].join('\n');
}
