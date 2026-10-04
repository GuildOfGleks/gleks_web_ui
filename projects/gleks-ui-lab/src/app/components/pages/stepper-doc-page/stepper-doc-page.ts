import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiTableComponent, type ApiRow } from '../../shared/api-table/api-table';
import { DemoComponent } from '../../shared/demo/demo';
import { GlobalConfigNote } from '../../shared/global-config-note/global-config-note';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';
import { STEPPER_EXAMPLES } from '../../../examples/stepper/sources.generated';
import { StepperOverviewExample } from '../../../examples/stepper/stepper-overview/example';
import { StepperStatesExample } from '../../../examples/stepper/stepper-states/example';
import { StepperVerticalExample } from '../../../examples/stepper/stepper-vertical/example';
import { StepperSizesExample } from '../../../examples/stepper/stepper-sizes/example';
import { StepperFlowExample } from '../../../examples/stepper/stepper-flow/example';
import { StepperRtlExample } from '../../../examples/stepper/stepper-rtl/example';
import { StepperNarrowExample } from '../../../examples/stepper/stepper-narrow/example';

const STEPPER_INPUTS: readonly ApiRow[] = [
  {
    name: 'steps',
    type: 'readonly GogStep[]',
    default: '[]',
    description: 'The steps, as data: label, description, state, optional, disabled.',
  },
  {
    name: 'activeIndex',
    type: 'number (model)',
    default: '0',
    description: 'Two-way; a press on a reachable step sets it.',
  },
  {
    name: 'linear',
    type: 'boolean',
    default: 'true',
    description: 'Forward only as far as the steps before are complete or optional.',
  },
  {
    name: 'orientation',
    type: 'GogOrientation',
    default: "'horizontal'",
    description: "'vertical' stacks the steps; it is also the answer for a narrow container.",
  },
  {
    name: 'size',
    type: 'GogSize',
    default: "'md'",
    description: "'xsm' | 'sm' | 'md' | 'lg' | 'slg'.",
  },
  {
    name: 'ariaLabel',
    type: 'string | undefined',
    default: 'undefined',
    description: 'Names the list. Unset, GOG_CONFIG.labels.stepper, then "Progress".',
  },
];

const STEP_FIELDS: readonly ApiRow[] = [
  {
    name: 'label',
    type: 'string',
    default: '—',
    description: 'The step’s name.',
  },
  {
    name: 'description',
    type: 'string',
    default: 'undefined',
    description: 'A line under the label.',
  },
  {
    name: 'state',
    type: "'complete' | 'error'",
    default: 'undefined (not started)',
    description: 'What the indicator draws, and the hidden words a screen reader hears.',
  },
  {
    name: 'optional',
    type: 'boolean',
    default: 'false',
    description: 'Shows "Optional" under the label; a linear stepper does not wait for it.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Never reachable from the stepper, whatever linear says.',
  },
];

@Component({
  selector: 'app-stepper-doc-page',
  imports: [
    ApiTableComponent,
    DemoComponent,
    GlobalConfigNote,
    MarkdownComponent,
    RouterLink,
    SinceBadgeComponent,
  ],
  templateUrl: './stepper-doc-page.html',
  styleUrl: './stepper-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepperDocPage {
  protected readonly stepperInputs = STEPPER_INPUTS;
  protected readonly stepFields = STEP_FIELDS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'stepper')?.tokens ?? [];

  protected readonly sources = STEPPER_EXAMPLES;
  protected readonly examples = {
    overview: StepperOverviewExample,
    states: StepperStatesExample,
    vertical: StepperVerticalExample,
    sizes: StepperSizesExample,
    flow: StepperFlowExample,
    rtl: StepperRtlExample,
    narrow: StepperNarrowExample,
  };

  protected readonly importSnippet = [
    '```typescript',
    "import { StepperComponent, type GogStep } from '@guildofgleks/ui';",
    '',
    '@Component({',
    '  // ...',
    '  imports: [StepperComponent],',
    '})',
    '```',
  ].join('\n');
}
