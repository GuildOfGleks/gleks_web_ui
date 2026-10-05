import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiTableComponent, type ApiRow } from '../../shared/api-table/api-table';
import { DemoComponent } from '../../shared/demo/demo';
import { GlobalConfigNote } from '../../shared/global-config-note/global-config-note';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';
import { RADIO_GROUP_EXAMPLES } from '../../../examples/radio-group/sources.generated';
import { RadioGroupAccessorsExample } from '../../../examples/radio-group/radio-group-accessors/example';
import { RadioGroupAriaLabelExample } from '../../../examples/radio-group/radio-group-aria-label/example';
import { RadioGroupBindingExample } from '../../../examples/radio-group/radio-group-binding/example';
import { RadioGroupConfigExample } from '../../../examples/radio-group/radio-group-config/example';
import { RadioGroupFormsExample } from '../../../examples/radio-group/radio-group-forms/example';
import { RadioGroupLayoutExample } from '../../../examples/radio-group/radio-group-layout/example';
import { RadioGroupOptionsExample } from '../../../examples/radio-group/radio-group-options/example';
import { RadioGroupOverviewExample } from '../../../examples/radio-group/radio-group-overview/example';
import { RadioGroupSizesExample } from '../../../examples/radio-group/radio-group-sizes/example';
import { RadioGroupStatesExample } from '../../../examples/radio-group/radio-group-states/example';

const API_INPUTS: readonly ApiRow[] = [
  {
    name: 'options',
    type: 'readonly TOption[]',
    default: '[]',
    description:
      'The choices, rendered as native <input type="radio">s. GogRadioOption ({ id, label, disabled? }) by default; any other shape through the three accessors below.',
  },
  {
    name: 'optionLabel',
    type: 'string | ((o: TOption) => string)',
    default: "'label'",
    description:
      'How an option turns into its visible text: a property path (dot-paths included, "place.city") or a function.',
    since: '21.19.0',
  },
  {
    name: 'optionValue',
    type: 'string | ((o: TOption) => string | number)',
    default: "'id'",
    description:
      'What value holds for an option: a property path or a function. It must give a string or a number, as value does.',
    since: '21.19.0',
  },
  {
    name: 'optionDisabled',
    type: 'string | ((o: TOption) => boolean)',
    default: "'disabled'",
    description: 'Which options are disabled: a property path or a function.',
    since: '21.19.0',
  },
  {
    name: 'value',
    type: 'string | number | null',
    default: 'null',
    description:
      'What optionValue gives for the selected option — its id by default. Two-way bindable with [(value)].',
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
    description:
      'Stretches the group to fill its container. Horizontal, the options share the width in equal parts, each pressable across its whole part, and still wrap once the labels no longer fit; before 21.15.0 a full-width horizontal group stacked its options.',
  },
];

const API_OUTPUTS: readonly ApiRow[] = [
  {
    name: 'valueChange',
    type: 'string | number | null',
    description: 'Emitted when the selection changes. Comes from the value model input.',
  },
];

@Component({
  selector: 'app-radio-group-doc-page',
  imports: [
    ApiTableComponent,
    DemoComponent,
    GlobalConfigNote,
    MarkdownComponent,
    RouterLink,
    SinceBadgeComponent,
  ],
  templateUrl: './radio-group-doc-page.html',
  styleUrl: './radio-group-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioGroupDocPage {
  protected readonly apiInputs = API_INPUTS;
  protected readonly apiOutputs = API_OUTPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'radio-group')?.tokens ?? [];

  protected readonly sources = RADIO_GROUP_EXAMPLES;
  protected readonly examples = {
    accessors: RadioGroupAccessorsExample,
    overview: RadioGroupOverviewExample,
    states: RadioGroupStatesExample,
    sizes: RadioGroupSizesExample,
    layout: RadioGroupLayoutExample,
    options: RadioGroupOptionsExample,
    ariaLabel: RadioGroupAriaLabelExample,
    binding: RadioGroupBindingExample,
    forms: RadioGroupFormsExample,
    config: RadioGroupConfigExample,
  };

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
}
