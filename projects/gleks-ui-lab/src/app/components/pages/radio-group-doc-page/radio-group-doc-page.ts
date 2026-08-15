import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { GogSize } from '@guildofgleks/ui';
import { ExampleHostComponent } from '../../shared/example-host/example-host';
import { provideExampleSources } from '../../shared/example-sources';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';

import { RADIO_GROUP_EXAMPLE_SOURCES } from '../../../examples/radio-group/sources.generated';
import { RadioGroupFormsExample } from '../../../examples/radio-group/radio-group-forms.example';
import { RadioGroupOrientationExample } from '../../../examples/radio-group/radio-group-orientation.example';
import { RadioGroupOverviewExample } from '../../../examples/radio-group/radio-group-overview.example';
import { RadioGroupSizesExample } from '../../../examples/radio-group/radio-group-sizes.example';

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

@Component({
  selector: 'app-radio-group-doc-page',
  imports: [ExampleHostComponent, ReactiveFormsModule, MarkdownComponent, RouterLink],
  providers: [provideExampleSources(RADIO_GROUP_EXAMPLE_SOURCES)],
  templateUrl: './radio-group-doc-page.html',
  styleUrl: './radio-group-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioGroupDocPage {
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];

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

  /** Each example is a file under `src/app/examples/radio-group/` — see docs/lab-examples-refactor.md. */
  protected readonly examples = {
    forms: RadioGroupFormsExample,
    orientation: RadioGroupOrientationExample,
    overview: RadioGroupOverviewExample,
    sizes: RadioGroupSizesExample,
  };
}
