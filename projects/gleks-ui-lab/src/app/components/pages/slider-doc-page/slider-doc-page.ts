import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiTableComponent, type ApiRow } from '../../shared/api-table/api-table';
import { DemoComponent } from '../../shared/demo/demo';
import { GlobalConfigNote } from '../../shared/global-config-note/global-config-note';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';
import { SLIDER_EXAMPLES } from '../../../examples/slider/sources.generated';
import { SliderAriaLabelExample } from '../../../examples/slider/slider-aria-label/example';
import { SliderClampExample } from '../../../examples/slider/slider-clamp/example';
import { SliderConfigExample } from '../../../examples/slider/slider-config/example';
import { SliderFormatExample } from '../../../examples/slider/slider-format/example';
import { SliderFormsExample } from '../../../examples/slider/slider-forms/example';
import { SliderOverviewExample } from '../../../examples/slider/slider-overview/example';
import { SliderPinnedExample } from '../../../examples/slider/slider-pinned/example';
import { SliderRangeExample } from '../../../examples/slider/slider-range/example';
import { SliderStatesExample } from '../../../examples/slider/slider-states/example';
import { SliderStepsExample } from '../../../examples/slider/slider-steps/example';
import { SliderThumbsMeetExample } from '../../../examples/slider/slider-thumbs-meet/example';
import { SliderVerticalExample } from '../../../examples/slider/slider-vertical/example';
import { SliderWidthExample } from '../../../examples/slider/slider-width/example';

const API_INPUTS: readonly ApiRow[] = [
  {
    name: 'value',
    type: 'number (model)',
    default: '0',
    description:
      'Two-way bindable value via [(value)]. Also driven by Angular Forms through writeValue/registerOnChange when used with formControlName/[formControl]/ngModel. This model is ignored while range is true; a form control is not, and carries the { start, end } pair instead.',
  },
  {
    name: 'range',
    type: 'boolean',
    default: 'false',
    description:
      'Switches to two-thumb mode for picking a range instead of a single value. Bind [(rangeValue)] instead of [(value)] — the two models are mutually exclusive. A form control carries whichever the mode is: a number, or a { start, end } pair.',
    since: '21.3.1',
  },
  {
    name: 'rangeValue',
    type: 'GogSliderRange (model)',
    default: '{ start: 0, end: 100 }',
    description: 'Two-way bindable { start, end } pair. Used only when range is true.',
    since: '21.3.1',
  },
  {
    name: 'startDisabled',
    type: 'boolean',
    default: 'false',
    description:
      'Disables only the lower thumb in range mode — pinning a floor while the ceiling stays movable. ORed with disabled, never overriding it, and it does not dim the whole control the way disabled does.',
    since: '21.3.1',
  },
  {
    name: 'endDisabled',
    type: 'boolean',
    default: 'false',
    description: 'Disables only the upper thumb in range mode. Mirrors startDisabled.',
    since: '21.3.1',
  },
  {
    name: 'startAriaLabel',
    type: 'string',
    default: "'Minimum'",
    description:
      "Accessible name for the lower thumb, prefixed with label when one is set ('Price Minimum'), or with ariaLabel when there is no label (since 21.15.0). A shared <label> cannot be associated with two inputs via for, so each thumb needs its own name.",
    since: '21.3.1',
  },
  {
    name: 'endAriaLabel',
    type: 'string',
    default: "'Maximum'",
    description: 'Accessible name for the upper thumb, prefixed the same way as startAriaLabel.',
    since: '21.3.1',
  },
  { name: 'label', type: 'string', default: "''", description: 'Field label.' },
  { name: 'min', type: 'number', default: '0', description: 'Minimum value.' },
  { name: 'max', type: 'number', default: '100', description: 'Maximum value.' },
  {
    name: 'step',
    type: 'number',
    default: '1',
    description: 'Increment step, e.g. 0.01 for fine-grained values.',
  },
  {
    name: 'showValue',
    type: 'boolean',
    default: 'true',
    description: 'Shows the current numeric value next to the label.',
  },
  {
    name: 'showThumb',
    type: 'boolean',
    default: 'true',
    description: 'Set false to render a bare filled track — a range indicator with no drag handle.',
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
    name: 'ariaLabel',
    type: 'string',
    default: "''",
    description: 'Accessible name for the field when there is no visible label.',
  },
  {
    name: 'valueFormat',
    type: '((value: number) => string) | null',
    default: 'null',
    description:
      "Writes the readout, the min and max labels and each thumb's aria-valuetext — so a unit reaches a screen reader as well as the screen. Unset, the number is printed as is and no aria-valuetext is added.",
    since: '21.19.0',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Disables dragging and keyboard input.',
  },
  {
    name: 'fullWidth',
    type: 'boolean',
    default: 'true',
    description:
      'Fills its container by default. A track has no content of its own to shrink-wrap to, so [fullWidth]="false" instead sizes it to --gog-slider-auto-width (240px by default) — a fixed, themeable fallback rather than a content-derived one. Ignored when vertical, since a vertical slider’s width is its thickness, not its length.',
  },
  {
    name: 'orientation',
    type: "'horizontal' | 'vertical'",
    default: "'horizontal'",
    description:
      'Which way the track runs. Picked per instance — it is a layout decision rather than a house style, so there is no global default for it. A vertical slider takes its length from --gog-slider-vertical-length (160px).',
  },
];

const API_OUTPUTS: readonly ApiRow[] = [
  {
    name: 'valueChange',
    type: 'number',
    description:
      'Emitted on every step of a drag or key press, not once at the end. Comes from the value model input.',
  },
  {
    name: 'rangeValueChange',
    type: 'GogSliderRange',
    description: 'The same, for the { start, end } pair in range mode.',
    since: '21.3.1',
  },
];

@Component({
  selector: 'app-slider-doc-page',
  imports: [
    ApiTableComponent,
    DemoComponent,
    GlobalConfigNote,
    MarkdownComponent,
    RouterLink,
    SinceBadgeComponent,
  ],
  templateUrl: './slider-doc-page.html',
  styleUrl: './slider-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderDocPage {
  protected readonly apiInputs = API_INPUTS;
  protected readonly apiOutputs = API_OUTPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'slider')?.tokens ?? [];

  protected readonly sources = SLIDER_EXAMPLES;
  protected readonly examples = {
    overview: SliderOverviewExample,
    states: SliderStatesExample,
    steps: SliderStepsExample,
    vertical: SliderVerticalExample,
    width: SliderWidthExample,
    ariaLabel: SliderAriaLabelExample,
    range: SliderRangeExample,
    format: SliderFormatExample,
    thumbsMeet: SliderThumbsMeetExample,
    pinned: SliderPinnedExample,
    clamp: SliderClampExample,
    forms: SliderFormsExample,
    config: SliderConfigExample,
  };

  protected readonly importSnippet =
    "```typescript\nimport { SliderComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [SliderComponent],\n})\n```";
}
