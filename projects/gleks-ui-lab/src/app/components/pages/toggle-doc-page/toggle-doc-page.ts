import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiTableComponent, type ApiRow } from '../../shared/api-table/api-table';
import { DemoComponent } from '../../shared/demo/demo';
import { GlobalConfigNote } from '../../shared/global-config-note/global-config-note';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';
import { TOGGLE_EXAMPLES } from '../../../examples/toggle/sources.generated';
import { ToggleAriaLabelExample } from '../../../examples/toggle/toggle-aria-label/example';
import { ToggleBindingExample } from '../../../examples/toggle/toggle-binding/example';
import { ToggleConfigExample } from '../../../examples/toggle/toggle-config/example';
import { ToggleFormsExample } from '../../../examples/toggle/toggle-forms/example';
import { ToggleLabelPositionExample } from '../../../examples/toggle/toggle-label-position/example';
import { ToggleOverviewExample } from '../../../examples/toggle/toggle-overview/example';
import { ToggleSettingsExample } from '../../../examples/toggle/toggle-settings/example';
import { ToggleStatesExample } from '../../../examples/toggle/toggle-states/example';
import { ToggleTrackLabelsExample } from '../../../examples/toggle/toggle-track-labels/example';

const API_INPUTS: readonly ApiRow[] = [
  {
    name: 'checked',
    type: 'boolean',
    default: 'false',
    description:
      'The on/off state. Two-way bindable with [(checked)]. Drive this or a form directive, never both.',
  },
  {
    name: 'label',
    type: 'string',
    default: "''",
    description: 'Visible text label rendered next to the switch, inside the same <label>.',
  },
  {
    name: 'labelPosition',
    type: "'start' | 'end'",
    default: "'end'",
    description: 'Which side of the switch the label sits on.',
  },
  {
    name: 'onLabel / offLabel',
    type: 'string',
    default: "''",
    description:
      'Short text rendered inside the track — the one thing a checkbox cannot do. Both stay in the DOM so the track width cannot jump as it flips; it sizes to the wider of the two.',
  },
  {
    name: 'ariaLabel',
    type: 'string',
    default: "''",
    description: 'Accessible name, used when there is no visible label.',
  },
  {
    name: 'size',
    type: "'xsm' | 'sm' | 'md' | 'lg' | 'slg'",
    default: "GOG_CONFIG.control.size ?? 'md'",
    description:
      'Track, thumb and label scale. The track and thumb have their own scale; the label size is shared with gog-checkbox.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Blocks interaction. A form control’s own disabled state is honoured too.',
  },
  {
    name: 'fullWidth',
    type: 'boolean',
    default: 'false',
    description:
      'Stretches the row to fill its container, pushing the switch and the label apart — the usual settings-list layout.',
  },
];

const API_OUTPUTS: readonly ApiRow[] = [
  {
    name: 'checkedChange',
    type: 'boolean',
    description: 'Emitted when the user flips the switch. Comes from the checked model input.',
  },
];

@Component({
  selector: 'app-toggle-doc-page',
  imports: [ApiTableComponent, DemoComponent, GlobalConfigNote, MarkdownComponent, RouterLink],
  templateUrl: './toggle-doc-page.html',
  styleUrl: './toggle-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleDocPage {
  protected readonly apiInputs = API_INPUTS;
  protected readonly apiOutputs = API_OUTPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'toggle')?.tokens ?? [];

  protected readonly sources = TOGGLE_EXAMPLES;
  protected readonly examples = {
    overview: ToggleOverviewExample,
    states: ToggleStatesExample,
    trackLabels: ToggleTrackLabelsExample,
    labelPosition: ToggleLabelPositionExample,
    settings: ToggleSettingsExample,
    ariaLabel: ToggleAriaLabelExample,
    binding: ToggleBindingExample,
    forms: ToggleFormsExample,
    config: ToggleConfigExample,
  };

  protected readonly importSnippet =
    "```typescript\nimport { ToggleComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [ToggleComponent],\n})\n```";
}
