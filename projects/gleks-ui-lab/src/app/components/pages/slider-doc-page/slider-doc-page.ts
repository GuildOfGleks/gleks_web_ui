import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { GogSliderRange } from '@guildofgleks/ui';
import { ExampleHostComponent } from '../../shared/example-host/example-host';
import { provideExampleSources } from '../../shared/example-sources';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';

import { SLIDER_EXAMPLE_SOURCES } from '../../../examples/slider/sources.generated';
import { SliderControlsExample } from '../../../examples/slider/slider-controls/example';
import { SliderFormExample } from '../../../examples/slider/slider-form/example';
import { SliderFullWidthExample } from '../../../examples/slider/slider-full-width/example';
import { SliderLabelingExample } from '../../../examples/slider/slider-labeling/example';
import { SliderOneSidedExample } from '../../../examples/slider/slider-one-sided/example';
import { SliderOverviewExample } from '../../../examples/slider/slider-overview/example';
import { SliderRangeExample } from '../../../examples/slider/slider-range/example';
import { SliderValidationExample } from '../../../examples/slider/slider-validation/example';
import { SliderVerticalExample } from '../../../examples/slider/slider-vertical/example';

interface ApiInputRow {
  readonly name: string;
  readonly type: string;
  readonly default: string;
  readonly description: string;
  readonly since?: string;
}

const API_INPUTS: readonly ApiInputRow[] = [
  {
    name: 'value',
    type: 'number (model)',
    default: '0',
    description:
      'Two-way bindable value via [(value)]. Also driven by Angular Forms through writeValue/registerOnChange when used with formControlName/[formControl]/ngModel. Ignored while range is true.',
  },
  {
    name: 'range',
    type: 'boolean',
    default: 'false',
    description:
      'Switches to two-thumb mode for picking a range instead of a single value. Bind [(rangeValue)] instead of [(value)] — the two are mutually exclusive.',
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
      "Accessible name for the lower thumb, prefixed with label when one is set ('Price Minimum'). A shared <label> cannot be associated with two inputs via for, so each thumb needs its own name.",
    since: '21.3.1',
  },
  {
    name: 'endAriaLabel',
    type: 'string',
    default: "'Maximum'",
    description: 'Accessible name for the upper thumb.',
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

@Component({
  selector: 'app-slider-doc-page',
  imports: [
    ExampleHostComponent,
    MarkdownComponent,
    RouterLink,
    ReactiveFormsModule,
    SinceBadgeComponent,
  ],
  providers: [provideExampleSources(SLIDER_EXAMPLE_SOURCES)],
  templateUrl: './slider-doc-page.html',
  styleUrl: './slider-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderDocPage {
  protected readonly apiInputs = API_INPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'slider')?.tokens ?? [];

  protected readonly volume = signal(45);
  protected readonly brightness = signal(70);
  protected readonly precision = signal(0.45);
  protected readonly priceRange = signal<GogSliderRange>({ start: 20, end: 70 });
  protected readonly cappedRange = signal<GogSliderRange>({ start: 0, end: 60 });

  protected readonly summary = computed(
    () =>
      `Volume is ${this.volume()}, brightness is ${this.brightness()}, and precision is ${this.precision()}.`,
  );

  protected readonly minimumControl = new FormControl<number>(10, {
    nonNullable: true,
    validators: Validators.min(50),
  });
  private readonly minimumValue = toSignal(this.minimumControl.valueChanges, {
    initialValue: this.minimumControl.value,
  });
  protected readonly importSnippet =
    "```typescript\nimport { SliderComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [SliderComponent],\n})\n```";

  /** Each example is a file under `src/app/examples/slider/` — see docs/lab-examples-refactor.md. */
  protected readonly examples = {
    controls: SliderControlsExample,
    form: SliderFormExample,
    fullWidth: SliderFullWidthExample,
    labeling: SliderLabelingExample,
    oneSided: SliderOneSidedExample,
    overview: SliderOverviewExample,
    range: SliderRangeExample,
    validation: SliderValidationExample,
    vertical: SliderVerticalExample,
  };
}
