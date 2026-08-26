import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  GogDropdownChevronDirective,
  GogDropdownOption,
  GogDropdownOptionDirective,
  GogSize,
  IconComponent,
  SelectComponent,
} from '@guildofgleks/ui';
import { CodeTabsComponent } from '../../shared/code-tabs/code-tabs';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { MarkdownComponent } from '../../shared/markdown/markdown';
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
      'How an option turns into its visible text: a property path (dot-paths included, "profile.fullName") or a function.',
  },
  {
    name: 'optionValue',
    type: 'string | ((o: TOption) => unknown) | null',
    default: "'id'",
    description:
      'How an option turns into the emitted value. Set it to null and the control emits the option OBJECT itself — the same reference you passed in.',
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
    default: 'GOG_CONFIG.control.clearable ?? false',
    description:
      'Adds a clear button in the outermost trailing position, with the chevron shifting inward when it appears. It shows only once something is selected — which is what removes the need for a fake "— not selected —" option just to make a choice undoable.',
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
      'Puts a search box in the panel, matching case-insensitively on the resolved optionLabel. The query resets when the panel closes.',
  },
  {
    name: 'filterPosition',
    type: "'top' | 'bottom'",
    default: "GOG_CONFIG.dropdown.filterPosition ?? 'top'",
    description:
      'Which end of the panel the search box sticks to. It carries a divider on the side facing the list, so it reads as chrome rather than as a row.',
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
    description:
      'Replaces the default case-insensitive substring match — for searching a field the label does not show, or for fuzzy matching.',
  },
  {
    name: 'floatLabel',
    type: "'none' | 'in' | 'on' | 'over'",
    default: "GOG_CONFIG.floatLabel.variant ?? 'none'",
    description:
      'Rests the label inside the field like a placeholder and floats it up once something is selected or the field has focus.',
  },
  {
    name: 'floatLabelShowPlaceholder',
    type: 'boolean',
    default: 'GOG_CONFIG.floatLabel.showPlaceholder ?? false',
    description: 'Reveals the placeholder once the label has floated out of the way.',
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
      'Fills its container by default. Set false to shrink to fit the selected label instead.',
  },
  {
    name: 'minWidth',
    type: 'string | null',
    default: 'null (--gog-select-min-width, 120px)',
    description:
      'Floor for an auto-width trigger, any CSS length — so a short selection cannot collapse the field to its own chrome.',
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
      "Portals the panel into document.body instead of rendering it inline — escapes an ancestor's scroll/overflow clipping. Worth setting app-wide for a layout whose dropdowns generally live inside scrollable containers.",
  },
  {
    name: 'ripple',
    type: 'boolean | undefined',
    default: 'undefined',
    description:
      'Press ripple on each option row in the panel. Unset, falls back to GOG_CONFIG.ripple.enabled, which is off by default; setting it here wins over the app-wide value in both directions.',
    since: '21.6.1',
  },
];

@Component({
  selector: 'app-select-doc-page',
  imports: [
    SelectComponent,
    GogDropdownOptionDirective,
    GogDropdownChevronDirective,
    IconComponent,
    MarkdownComponent,
    CodeTabsComponent,
    RouterLink,
    ReactiveFormsModule,
    SinceBadgeComponent,
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
    '<gog-select [options]="sortOptions" [(value)]="sortValue">',
    '  <ng-template gogDropdownChevron>',
    '    <gog-icon name="sort" />',
    '  </ng-template>',
    '</gog-select>',
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
    'import {',
    '  GogDropdownChevronDirective,',
    '  GogDropdownOption,',
    '  IconComponent,',
    '  SelectComponent,',
    "} from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [SelectComponent, GogDropdownChevronDirective, IconComponent],',
    '  template: `',
    '    <gog-select [options]="sortOptions" [(value)]="sortValue">',
    '      <ng-template gogDropdownChevron>',
    '        <gog-icon name="sort" />',
    '      </ng-template>',
    '    </gog-select>',
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

  // ---- 21.3.0: option accessors, filtering, clearable, option slot -------------------------

  protected readonly users: User[] = [
    { uuid: 'u1', profile: { fullName: 'Ada Lovelace', role: 'Engineering' }, suspended: false },
    { uuid: 'u2', profile: { fullName: 'Grace Hopper', role: 'Engineering' }, suspended: false },
    { uuid: 'u3', profile: { fullName: 'Katherine Johnson', role: 'Research' }, suspended: false },
    { uuid: 'u4', profile: { fullName: 'Radia Perlman', role: 'Networking' }, suspended: true },
  ];
  protected readonly userId = signal<string | number | null>(null);
  protected readonly userObject = signal<User | null>(null);
  protected readonly slotUserId = signal<string | number | null>(null);
  protected readonly filteredCountry = signal<string | number | null>(null);
  protected readonly clearablePlan = signal<string | number | null>('pro');

  protected readonly accessorsHtml = [
    '<!-- A real DTO goes straight in: no mapping into { id, name } first. -->',
    '<gog-select',
    '  label="Assignee"',
    '  optionLabel="profile.fullName"',
    '  optionValue="uuid"',
    '  optionDisabled="suspended"',
    '  [options]="users"',
    '  [(value)]="userId"',
    '/>',
    '',
    '<!-- [optionValue]="null" hands back the option object itself. -->',
    '<gog-select',
    '  label="Assignee (object)"',
    '  optionLabel="profile.fullName"',
    '  [optionValue]="null"',
    '  [options]="users"',
    '  [(value)]="userObject"',
    '/>',
  ].join('\n');
  protected readonly accessorsTs = [
    "import { Component, signal } from '@angular/core';",
    "import { SelectComponent } from '@guildofgleks/ui';",
    '',
    'interface User {',
    '  uuid: string;',
    '  profile: { fullName: string; role: string };',
    '  suspended: boolean;',
    '}',
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [SelectComponent],',
    '  template: `',
    '    <gog-select',
    '      label="Assignee"',
    '      optionLabel="profile.fullName"',
    '      optionValue="uuid"',
    '      optionDisabled="suspended"',
    '      [options]="users"',
    '      [(value)]="userId"',
    '    />',
    '',
    '    <gog-select',
    '      label="Assignee (object)"',
    '      optionLabel="profile.fullName"',
    '      [optionValue]="null"',
    '      [options]="users"',
    '      [(value)]="userObject"',
    '    />',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly users: User[] = [/* straight from the API */];',
    '',
    '  // An id…',
    '  protected readonly userId = signal<string | number | null>(null);',
    '  // …or the object itself, the same reference that went in.',
    '  protected readonly userObject = signal<User | null>(null);',
    '}',
  ].join('\n');

  protected readonly filterHtml = [
    '<gog-select',
    '  label="Country"',
    '  [filter]="true"',
    '  filterPlaceholder="Search countries…"',
    '  filterEmptyMessage="No country matches"',
    '  [options]="manyCountries"',
    '  [(value)]="filteredCountry"',
    '/>',
    '',
    '<!-- filterMatch replaces the default substring match on the label. -->',
    '<gog-select',
    '  label="Assignee"',
    '  optionLabel="profile.fullName"',
    '  optionValue="uuid"',
    '  [filter]="true"',
    '  [filterMatch]="matchNameOrRole"',
    '  [options]="users"',
    '  [(value)]="userId"',
    '/>',
  ].join('\n');
  protected readonly filterTs = [
    "import { Component, signal } from '@angular/core';",
    "import { SelectComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [SelectComponent],',
    '  template: `',
    '    <gog-select',
    '      label="Assignee"',
    '      optionLabel="profile.fullName"',
    '      [filter]="true"',
    '      [filterMatch]="matchNameOrRole"',
    '      [options]="users"',
    '      [(value)]="userId"',
    '    />',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  // Searches a field the label never shows.',
    '  protected readonly matchNameOrRole = (user: User, query: string): boolean => {',
    '    const needle = query.toLowerCase();',
    '    return (',
    '      user.profile.fullName.toLowerCase().includes(needle) ||',
    '      user.profile.role.toLowerCase().includes(needle)',
    '    );',
    '  };',
    '}',
  ].join('\n');

  protected readonly clearableHtml = [
    '<gog-select label="Plan" [clearable]="true" [options]="plansWithDisabled" [(value)]="plan" />',
  ].join('\n');
  protected readonly clearableTs = [
    "import { Component, signal } from '@angular/core';",
    "import { SelectComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [SelectComponent],',
    '  template: `',
    '    <gog-select label="Plan" [clearable]="true" [options]="plans" [(value)]="plan" />',
    '  `,',
    '})',
    'export class ExampleComponent {',
    "  protected readonly plan = signal<string | number | null>('pro');",
    '}',
  ].join('\n');

  protected readonly optionSlotHtml = [
    '<gog-select',
    '  label="Assignee"',
    '  optionLabel="profile.fullName"',
    '  optionValue="uuid"',
    '  [options]="users"',
    '  [(value)]="slotUserId"',
    '>',
    '  <ng-template gogDropdownOption let-user let-label="label" let-selected="selected">',
    '    <strong>{{ label }}</strong>',
    '    <small>{{ user.profile.role }}</small>',
    '  </ng-template>',
    '</gog-select>',
  ].join('\n');
  protected readonly optionSlotTs = [
    "import { Component, signal } from '@angular/core';",
    "import { GogDropdownOptionDirective, SelectComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [SelectComponent, GogDropdownOptionDirective],',
    '  template: `',
    '    <gog-select optionLabel="profile.fullName" [options]="users" [(value)]="userId">',
    '      <ng-template gogDropdownOption let-user let-label="label">',
    '        <strong>{{ label }}</strong>',
    '        <small>{{ asUser(user).profile.role }}</small>',
    '      </ng-template>',
    '    </gog-select>',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  // The slot hands the option back as `unknown`, so narrow it once here.',
    '  protected asUser(option: unknown): User {',
    '    return option as User;',
    '  }',
    '}',
  ].join('\n');

  protected readonly matchNameOrRole = (user: unknown, query: string): boolean => {
    const needle = query.toLowerCase();
    const { profile } = user as User;
    return (
      profile.fullName.toLowerCase().includes(needle) || profile.role.toLowerCase().includes(needle)
    );
  };

  protected asUser(option: unknown): User {
    return option as User;
  }

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
