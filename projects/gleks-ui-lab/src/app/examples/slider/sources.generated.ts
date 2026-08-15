// GENERATED FILE — do not edit by hand.
// Run `npm run generate:examples` after adding or editing an example in this folder.
// See scripts/generate-example-sources.mjs for why the source text is generated rather than imported.

import type { ExampleSource } from '../../components/shared/example-sources';

import { SliderControlsExample } from './slider-controls/example';
import { SliderFormExample } from './slider-form/example';
import { SliderFullWidthExample } from './slider-full-width/example';
import { SliderLabelingExample } from './slider-labeling/example';
import { SliderOneSidedExample } from './slider-one-sided/example';
import { SliderOverviewExample } from './slider-overview/example';
import { SliderRangeExample } from './slider-range/example';
import { SliderValidationExample } from './slider-validation/example';
import { SliderVerticalExample } from './slider-vertical/example';

/** The three files of each example in this folder, keyed by the example component itself. */
export const SLIDER_EXAMPLE_SOURCES: ReadonlyMap<unknown, ExampleSource> = new Map<
  unknown,
  ExampleSource
>([
  [
    SliderControlsExample,
    {
      html: '<div class="example">\n  <gog-slider label="Volume" [min]="0" [max]="100" [step]="5" [(value)]="volume" />\n  <gog-slider label="Brightness" [min]="0" [max]="100" [step]="10" [(value)]="brightness" />\n  <gog-slider label="Precision" [min]="0" [max]="1" [step]="0.01" [(value)]="precision" />\n  <gog-slider\n    label="Range only"\n    [min]="0"\n    [max]="100"\n    [step]="1"\n    [showThumb]="false"\n    [value]="35"\n  />\n  <gog-slider label="Disabled" [value]="25" [disabled]="true" [showThumb]="false" />\n  <gog-slider label="Disabled (with thumb)" [value]="60" [disabled]="true" />\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { SliderComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [SliderComponent],\n})\nexport class SliderControlsExample {\n  protected readonly volume = signal(45);\n  protected readonly brightness = signal(70);\n  protected readonly precision = signal(0.45);\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 12px;\n  max-width: 420px;\n}',
    },
  ],
  [
    SliderFormExample,
    {
      html: '<div class="example">\n  <gog-slider\n    label="Minimum threshold"\n    [min]="0"\n    [max]="100"\n    [formControl]="minimumControl"\n    errorDisplay="auto"\n    [errorMessage]="minimumErrorMessage()"\n  />\n</div>',
      ts: "import { Component, computed } from '@angular/core';\nimport { toSignal } from '@angular/core/rxjs-interop';\nimport { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';\nimport { SliderComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [SliderComponent, ReactiveFormsModule],\n})\nexport class SliderFormExample {\n  protected readonly minimumControl = new FormControl<number>(10, {\n    nonNullable: true,\n    validators: Validators.min(50),\n  });\n  private readonly minimumValue = toSignal(this.minimumControl.valueChanges, {\n    initialValue: this.minimumControl.value,\n  });\n  protected readonly minimumErrorMessage = computed(() => {\n    this.minimumValue();\n    return this.minimumControl.hasError('min') ? 'Must be at least 50.' : '';\n  });\n}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    SliderFullWidthExample,
    {
      html: '<div class="example">\n  <gog-slider label="Compact" [min]="0" [max]="100" [(value)]="compactValue" [fullWidth]="false" />\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { SliderComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [SliderComponent],\n})\nexport class SliderFullWidthExample {\n  protected readonly compactValue = signal(40);\n}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    SliderLabelingExample,
    {
      html: '<div class="example">\n  <gog-slider label="No value readout" [showValue]="false" [(value)]="hiddenValue" />\n  <gog-slider ariaLabel="Opacity (no visible label)" [(value)]="ariaOnlyValue" />\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { SliderComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [SliderComponent],\n})\nexport class SliderLabelingExample {\n  protected readonly hiddenValue = signal(60);\n  protected readonly ariaOnlyValue = signal(50);\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 12px;\n  max-width: 420px;\n}',
    },
  ],
  [
    SliderOneSidedExample,
    {
      html: '<div class="example">\n  <gog-slider label="Budget" [range]="true" [(rangeValue)]="cappedRange" [startDisabled]="true" />\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { GogSliderRange, SliderComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [SliderComponent],\n})\nexport class SliderOneSidedExample {\n  // The floor is pinned at 0; only the ceiling moves. `disabled` would freeze both.\n  protected readonly cappedRange = signal<GogSliderRange>({ start: 0, end: 60 });\n}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    SliderOverviewExample,
    {
      html: '<div class="example">\n  <gog-slider label="Volume" [min]="0" [max]="100" [step]="5" [(value)]="volume" />\n  <p class="readout">Value: {{ volume() }}</p>\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { SliderComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [SliderComponent],\n})\nexport class SliderOverviewExample {\n  protected readonly volume = signal(45);\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 12px;\n  max-width: 420px;\n}\n.readout {\n  margin: 0;\n  color: var(--gog-muted-text-color);\n  font-size: 0.9em;\n}',
    },
  ],
  [
    SliderRangeExample,
    {
      html: '<div class="example">\n  <gog-slider\n    label="Price"\n    [range]="true"\n    [(rangeValue)]="priceRange"\n    [min]="0"\n    [max]="100"\n    startAriaLabel="Lowest price"\n    endAriaLabel="Highest price"\n  />\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { GogSliderRange, SliderComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [SliderComponent],\n})\nexport class SliderRangeExample {\n  // `range` and `[(value)]` are mutually exclusive — with range on, `value` is ignored.\n  protected readonly priceRange = signal<GogSliderRange>({ start: 20, end: 70 });\n}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    SliderValidationExample,
    {
      html: '<div class="example">\n  <gog-slider\n    label="Monthly budget"\n    [min]="0"\n    [max]="100"\n    [step]="5"\n    [errorMessage]="budgetError()"\n    [(value)]="budget"\n  />\n</div>',
      ts: "import { Component, computed, signal } from '@angular/core';\nimport { SliderComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [SliderComponent],\n})\nexport class SliderValidationExample {\n  protected readonly budget = signal(80);\n  protected readonly budgetError = computed(() =>\n    this.budget() > 70 ? 'Over the recommended budget for this tier.' : '',\n  );\n}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    SliderVerticalExample,
    {
      html: '<div class="example">\n  <gog-slider label="Bass" orientation="vertical" [(value)]="bass" />\n  <gog-slider label="Mid" orientation="vertical" [(value)]="mid" />\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { SliderComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [SliderComponent],\n})\nexport class SliderVerticalExample {\n  protected readonly bass = signal(60);\n  protected readonly mid = signal(45);\n}",
      css: '.example {\n  display: flex;\n  gap: 24px;\n}',
    },
  ],
]);
