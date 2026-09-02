import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { GogRadioOption, GogSize, RadioGroupComponent } from '@guildofgleks/ui';
import { CodeTabsComponent } from '../../shared/code-tabs/code-tabs';
import { GlobalConfigNote } from '../../shared/global-config-note/global-config-note';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';

interface ApiRow {
  readonly name: string;
  readonly type: string;
  readonly default: string;
  readonly description: string;
}

const API_INPUTS: readonly ApiRow[] = [
  {
    name: 'options',
    type: 'GogRadioOption[]',
    default: '[]',
    description: 'The choices: { id, label, disabled? }. Rendered as native <input type="radio">s.',
  },
  {
    name: 'value',
    type: 'string | number | null',
    default: 'null',
    description: 'The selected option’s id. Two-way bindable with [(value)].',
  },
  {
    name: 'label',
    type: 'string',
    default: "''",
    description: 'The group’s own label, rendered above the options.',
  },
  {
    name: 'ariaLabel',
    type: 'string',
    default: "''",
    description: 'Accessible name for the group, used when there is no visible label.',
  },
  {
    name: 'name',
    type: 'string',
    default: 'auto-generated',
    description:
      'The shared name attribute for the radios. Generated per instance unless you set it — it is what makes the browser enforce mutual exclusivity.',
  },
  {
    name: 'orientation',
    type: "'vertical' | 'horizontal'",
    default: "'vertical'",
    description: 'How the options are laid out.',
  },
  {
    name: 'size',
    type: "'xsm' | 'sm' | 'md' | 'lg' | 'slg'",
    default: "GOG_CONFIG.control.size ?? 'md'",
    description: 'Circle and label scale. Reuses gog-checkbox’s size steps.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description:
      'Disables the whole group. Individual options carry their own optional disabled flag.',
  },
  {
    name: 'errorMessage',
    type: 'string',
    default: "''",
    description: 'Validation message rendered under the group.',
  },
  {
    name: 'errorDisplay',
    type: "'manual' | 'auto'",
    default: "GOG_CONFIG.control.errorDisplay ?? 'manual'",
    description:
      'manual shows errorMessage whenever it is set; auto derives it from the bound form control’s state.',
  },
  {
    name: 'fullWidth',
    type: 'boolean',
    default: 'false',
    description: 'Stretches the group to fill its container.',
  },
];

const API_OUTPUTS: readonly ApiRow[] = [
  {
    name: 'valueChange',
    type: 'string | number | null',
    default: '—',
    description: 'Emitted when the selection changes. Comes from the value model input.',
  },
];

const DELIVERY_OPTIONS: GogRadioOption[] = [
  { id: 'standard', label: 'Standard — 3 to 5 days' },
  { id: 'express', label: 'Express — next day' },
  { id: 'pickup', label: 'Collect in store' },
  { id: 'drone', label: 'Drone drop (unavailable in your area)', disabled: true },
];

const PLAN_OPTIONS: GogRadioOption[] = [
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
];

@Component({
  selector: 'app-radio-group-doc-page',
  imports: [
    RadioGroupComponent,
    ReactiveFormsModule,
    GlobalConfigNote,
    MarkdownComponent,
    CodeTabsComponent,
    RouterLink,
  ],
  templateUrl: './radio-group-doc-page.html',
  styleUrl: './radio-group-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioGroupDocPage {
  protected readonly deliveryOptions = DELIVERY_OPTIONS;
  protected readonly planOptions = PLAN_OPTIONS;
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];

  protected readonly delivery = signal<string | number | null>('standard');
  protected readonly plan = signal<string | number | null>('yearly');
  protected readonly sizeValue = signal<string | number | null>('monthly');
  protected readonly shipping = new FormControl<string | null>(null, Validators.required);

  protected readonly apiInputs = API_INPUTS;
  protected readonly apiOutputs = API_OUTPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'radio-group')?.tokens ?? [];

  protected readonly importSnippet =
    "```typescript\nimport { RadioGroupComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [RadioGroupComponent],\n})\n```";

  protected readonly optionInterface = [
    '```typescript',
    'interface GogRadioOption {',
    '  id: string | number;',
    '  label: string;',
    '  disabled?: boolean;',
    '}',
    '```',
  ].join('\n');

  protected readonly overviewHtml = [
    '<gog-radio-group label="Delivery" [options]="deliveryOptions" [(value)]="delivery" />',
  ].join('\n');
  protected readonly overviewTs = [
    "import { Component, signal } from '@angular/core';",
    "import { GogRadioOption, RadioGroupComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [RadioGroupComponent],',
    '  template: `',
    '    <gog-radio-group label="Delivery" [options]="deliveryOptions" [(value)]="delivery" />',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly deliveryOptions: GogRadioOption[] = [',
    "    { id: 'standard', label: 'Standard — 3 to 5 days' },",
    "    { id: 'express', label: 'Express — next day' },",
    "    { id: 'pickup', label: 'Collect in store' },",
    "    { id: 'drone', label: 'Drone drop', disabled: true },",
    '  ];',
    "  protected readonly delivery = signal<string | number | null>('standard');",
    '}',
  ].join('\n');

  protected readonly orientationHtml = [
    '<gog-radio-group label="Billing" [options]="planOptions" [(value)]="plan" />',
    '',
    '<gog-radio-group',
    '  label="Billing"',
    '  orientation="horizontal"',
    '  [options]="planOptions"',
    '  [(value)]="plan"',
    '/>',
  ].join('\n');
  protected readonly orientationTs = [
    "import { Component, signal } from '@angular/core';",
    "import { GogRadioOption, RadioGroupComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [RadioGroupComponent],',
    '  template: `',
    '    <gog-radio-group',
    '      label="Billing"',
    '      orientation="horizontal"',
    '      [options]="planOptions"',
    '      [(value)]="plan"',
    '    />',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly planOptions: GogRadioOption[] = [',
    "    { id: 'monthly', label: 'Monthly' },",
    "    { id: 'yearly', label: 'Yearly' },",
    '  ];',
    "  protected readonly plan = signal<string | number | null>('yearly');",
    '}',
  ].join('\n');

  protected readonly sizesHtml = [
    '@for (sizeOption of sizes; track sizeOption) {',
    '  <gog-radio-group',
    '    [label]="sizeOption"',
    '    [size]="sizeOption"',
    '    orientation="horizontal"',
    '    [options]="planOptions"',
    '    [(value)]="sizeValue"',
    '  />',
    '}',
  ].join('\n');
  protected readonly sizesTs = [
    "import { Component, signal } from '@angular/core';",
    "import { GogSize, RadioGroupComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [RadioGroupComponent],',
    '  template: `',
    '    @for (sizeOption of sizes; track sizeOption) {',
    '      <gog-radio-group [size]="sizeOption" [options]="planOptions" [(value)]="sizeValue" />',
    '    }',
    '  `,',
    '})',
    'export class ExampleComponent {',
    "  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];",
    '}',
  ].join('\n');

  protected readonly formsHtml = [
    '<gog-radio-group',
    '  label="Shipping"',
    '  errorDisplay="auto"',
    '  errorMessage="Pick a shipping option"',
    '  [options]="deliveryOptions"',
    '  [formControl]="shipping"',
    '/>',
  ].join('\n');
  protected readonly formsTs = [
    "import { Component } from '@angular/core';",
    "import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';",
    "import { RadioGroupComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [RadioGroupComponent, ReactiveFormsModule],',
    '  template: `',
    '    <gog-radio-group',
    '      label="Shipping"',
    '      errorDisplay="auto"',
    '      errorMessage="Pick a shipping option"',
    '      [options]="deliveryOptions"',
    '      [formControl]="shipping"',
    '    />',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly shipping = new FormControl<string | null>(null, Validators.required);',
    '}',
  ].join('\n');
}
