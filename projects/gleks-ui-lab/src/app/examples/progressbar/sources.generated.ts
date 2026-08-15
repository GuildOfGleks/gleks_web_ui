// GENERATED FILE — do not edit by hand.
// Run `npm run generate:examples` after adding or editing an example in this folder.
// See scripts/generate-example-sources.mjs for why the source text is generated rather than imported.

import type { ExampleSource } from '../../components/shared/example-sources';

import { ProgressbarModesExample } from './progressbar-modes/example';
import { ProgressbarOverviewExample } from './progressbar-overview/example';
import { ProgressbarShowValueExample } from './progressbar-show-value/example';
import { ProgressbarSizesExample } from './progressbar-sizes/example';
import { ProgressbarVariantsExample } from './progressbar-variants/example';

/** The three files of each example in this folder, keyed by the example component itself. */
export const PROGRESSBAR_EXAMPLE_SOURCES: ReadonlyMap<unknown, ExampleSource> = new Map<
  unknown,
  ExampleSource
>([
  [
    ProgressbarModesExample,
    {
      html: '<div class="example">\n  <gog-progressbar [value]="42" ariaLabel="Upload" />\n  <gog-progressbar mode="indeterminate" ariaLabel="Loading" />\n  <gog-progressbar mode="buffer" [value]="42" [buffer]="70" ariaLabel="Playback" />\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { ProgressbarComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [ProgressbarComponent],\n})\nexport class ProgressbarModesExample {}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 12px;\n  max-width: 420px;\n}',
    },
  ],
  [
    ProgressbarOverviewExample,
    {
      html: '<div class="example">\n  <gog-progressbar [value]="42" ariaLabel="Upload progress" />\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { ProgressbarComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [ProgressbarComponent],\n})\nexport class ProgressbarOverviewExample {}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    ProgressbarShowValueExample,
    {
      html: '<div class="example">\n  <gog-progressbar [value]="uploaded()" [showValue]="true" ariaLabel="Upload progress" />\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { ProgressbarComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [ProgressbarComponent],\n})\nexport class ProgressbarShowValueExample {\n  protected readonly uploaded = signal(42);\n}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    ProgressbarSizesExample,
    {
      html: '<div class="example">\n  @for (sizeOption of sizes; track sizeOption) {\n    <gog-progressbar [size]="sizeOption" [value]="65" [ariaLabel]="sizeOption" />\n  }\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { GogSize, ProgressbarComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [ProgressbarComponent],\n})\nexport class ProgressbarSizesExample {\n  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 12px;\n  max-width: 420px;\n}',
    },
  ],
  [
    ProgressbarVariantsExample,
    {
      html: '<div class="example">\n  @for (variantOption of variants; track variantOption) {\n    <gog-progressbar [variant]="variantOption" [value]="65" [ariaLabel]="variantOption" />\n  }\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { GogProgressbarVariant, ProgressbarComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [ProgressbarComponent],\n})\nexport class ProgressbarVariantsExample {\n  protected readonly variants: GogProgressbarVariant[] = [\n    'accent',\n    'success',\n    'danger',\n    'warning',\n    'info',\n  ];\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 12px;\n  max-width: 420px;\n}',
    },
  ],
]);
