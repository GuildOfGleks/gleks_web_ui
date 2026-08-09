import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonComponent, SliderComponent } from '@guildofgleks/ui';
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
    type: 'number (model)',
    default: '0',
    description:
      'Two-way bindable value via [(value)]. Also driven by Angular Forms through writeValue/registerOnChange when used with formControlName/[formControl]/ngModel.',
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
    SliderComponent,
    ButtonComponent,
    MarkdownComponent,
    CodeTabsComponent,
    RouterLink,
    ReactiveFormsModule,
  ],
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
  protected readonly hiddenValue = signal(60);
  protected readonly ariaOnlyValue = signal(50);
  protected readonly compactValue = signal(40);
  protected readonly bass = signal(60);
  protected readonly mid = signal(45);
  protected readonly treble = signal(75);

  protected readonly verticalHtml = [
    '<gog-slider label="Bass" orientation="vertical" [min]="0" [max]="100" [(value)]="bass" />',
    '<gog-slider label="Mid" orientation="vertical" [min]="0" [max]="100" [(value)]="mid" />',
    '<gog-slider label="Treble" orientation="vertical" [min]="0" [max]="100" [(value)]="treble" />',
  ].join('\n');
  protected readonly verticalTs = [
    "import { Component, signal } from '@angular/core';",
    "import { SliderComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [SliderComponent],',
    '  template: `',
    '    <gog-slider label="Bass" orientation="vertical" [(value)]="bass" />',
    '    <gog-slider label="Mid" orientation="vertical" [(value)]="mid" />',
    '  `,',
    '  styles: `',
    '    :host {',
    '      display: flex;',
    '      gap: 24px;',
    '    }',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly bass = signal(60);',
    '  protected readonly mid = signal(45);',
    '}',
  ].join('\n');

  protected readonly summary = computed(
    () =>
      `Volume is ${this.volume()}, brightness is ${this.brightness()}, and precision is ${this.precision()}.`,
  );

  protected readonly budget = signal(80);
  protected readonly budgetError = computed(() =>
    this.budget() > 70 ? 'Over the recommended budget for this tier.' : '',
  );

  protected readonly minimumControl = new FormControl<number>(10, {
    nonNullable: true,
    validators: Validators.min(50),
  });
  private readonly minimumValue = toSignal(this.minimumControl.valueChanges, {
    initialValue: this.minimumControl.value,
  });
  protected readonly minimumErrorMessage = computed(() => {
    this.minimumValue();
    return this.minimumControl.hasError('min') ? 'Must be at least 50.' : '';
  });

  protected reset(): void {
    this.volume.set(45);
    this.brightness.set(70);
    this.precision.set(0.45);
  }

  protected readonly importSnippet =
    "```typescript\nimport { SliderComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [SliderComponent],\n})\n```";

  protected readonly overviewHtml =
    '<gog-slider label="Volume" [min]="0" [max]="100" [step]="5" [(value)]="volume" />';
  protected readonly overviewTs = [
    "import { Component, signal } from '@angular/core';",
    "import { SliderComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [SliderComponent],',
    '  template: `<gog-slider label="Volume" [min]="0" [max]="100" [step]="5" [(value)]="volume" />`,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly volume = signal(45);',
    '}',
  ].join('\n');

  protected readonly controlsHtml = [
    '<gog-slider label="Volume" [min]="0" [max]="100" [step]="5" [(value)]="volume" />',
    '<gog-slider label="Brightness" [min]="0" [max]="100" [step]="10" [(value)]="brightness" />',
    '<gog-slider label="Precision" [min]="0" [max]="1" [step]="0.01" [(value)]="precision" />',
    '<gog-slider',
    '  label="Range only"',
    '  [min]="0"',
    '  [max]="100"',
    '  [step]="1"',
    '  [showThumb]="false"',
    '  [value]="35"',
    '/>',
    '<gog-slider label="Disabled" [value]="25" [disabled]="true" [showThumb]="false" />',
    '<gog-slider label="Disabled (with thumb)" [value]="60" [disabled]="true" />',
  ].join('\n');
  protected readonly controlsTs = [
    "import { Component, signal } from '@angular/core';",
    "import { SliderComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [SliderComponent],',
    '  template: `',
    '    <gog-slider label="Volume" [min]="0" [max]="100" [step]="5" [(value)]="volume" />',
    '    <gog-slider label="Brightness" [min]="0" [max]="100" [step]="10" [(value)]="brightness" />',
    '    <gog-slider label="Precision" [min]="0" [max]="1" [step]="0.01" [(value)]="precision" />',
    '    <gog-slider',
    '      label="Range only"',
    '      [min]="0"',
    '      [max]="100"',
    '      [step]="1"',
    '      [showThumb]="false"',
    '      [value]="35"',
    '    />',
    '    <gog-slider label="Disabled" [value]="25" [disabled]="true" [showThumb]="false" />',
    '    <gog-slider label="Disabled (with thumb)" [value]="60" [disabled]="true" />',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly volume = signal(45);',
    '  protected readonly brightness = signal(70);',
    '  protected readonly precision = signal(0.45);',
    '}',
  ].join('\n');

  protected readonly labelingHtml = [
    '<gog-slider label="No value readout" [showValue]="false" [(value)]="hiddenValue" />',
    '<gog-slider ariaLabel="Opacity (no visible label)" [(value)]="ariaOnlyValue" />',
  ].join('\n');
  protected readonly labelingTs = [
    "import { Component, signal } from '@angular/core';",
    "import { SliderComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [SliderComponent],',
    '  template: `',
    '    <gog-slider label="No value readout" [showValue]="false" [(value)]="hiddenValue" />',
    '    <gog-slider ariaLabel="Opacity (no visible label)" [(value)]="ariaOnlyValue" />',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly hiddenValue = signal(60);',
    '  protected readonly ariaOnlyValue = signal(50);',
    '}',
  ].join('\n');

  protected readonly fullWidthHtml =
    '<gog-slider label="Compact" [min]="0" [max]="100" [(value)]="compactValue" [fullWidth]="false" />';
  protected readonly fullWidthTs = [
    "import { Component, signal } from '@angular/core';",
    "import { SliderComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [SliderComponent],',
    '  template: `<gog-slider label="Compact" [min]="0" [max]="100" [(value)]="compactValue" [fullWidth]="false" />`,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly compactValue = signal(40);',
    '}',
  ].join('\n');

  protected readonly validationHtml = [
    '<gog-slider',
    '  label="Monthly budget"',
    '  [min]="0"',
    '  [max]="100"',
    '  [step]="5"',
    '  [errorMessage]="budgetError()"',
    '  [(value)]="budget"',
    '/>',
  ].join('\n');
  protected readonly validationTs = [
    "import { Component, computed, signal } from '@angular/core';",
    "import { SliderComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [SliderComponent],',
    '  template: `',
    '    <gog-slider',
    '      label="Monthly budget"',
    '      [min]="0"',
    '      [max]="100"',
    '      [step]="5"',
    '      [errorMessage]="budgetError()"',
    '      [(value)]="budget"',
    '    />',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly budget = signal(80);',
    '  protected readonly budgetError = computed(() =>',
    "    this.budget() > 70 ? 'Over the recommended budget for this tier.' : '',",
    '  );',
    '}',
  ].join('\n');

  protected readonly formHtml = [
    '<gog-slider',
    '  label="Minimum threshold"',
    '  [min]="0"',
    '  [max]="100"',
    '  [formControl]="minimumControl"',
    '  errorDisplay="auto"',
    '  [errorMessage]="minimumErrorMessage()"',
    '/>',
  ].join('\n');
  protected readonly formTs = [
    "import { Component, computed } from '@angular/core';",
    "import { toSignal } from '@angular/core/rxjs-interop';",
    "import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';",
    "import { SliderComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [SliderComponent, ReactiveFormsModule],',
    '  template: `',
    '    <gog-slider',
    '      label="Minimum threshold"',
    '      [min]="0"',
    '      [max]="100"',
    '      [formControl]="minimumControl"',
    '      errorDisplay="auto"',
    '      [errorMessage]="minimumErrorMessage()"',
    '    />',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly minimumControl = new FormControl<number>(10, {',
    '    nonNullable: true,',
    '    validators: Validators.min(50),',
    '  });',
    '  private readonly minimumValue = toSignal(this.minimumControl.valueChanges, {',
    '    initialValue: this.minimumControl.value,',
    '  });',
    '  protected readonly minimumErrorMessage = computed(() => {',
    '    this.minimumValue();',
    "    return this.minimumControl.hasError('min') ? 'Must be at least 50.' : '';",
    '  });',
    '}',
  ].join('\n');
}
