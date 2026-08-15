// GENERATED FILE — do not edit by hand.
// Run `npm run generate:examples` after adding or editing an *.example.ts file in this folder.
// See scripts/generate-example-sources.mjs for why the source text is generated rather than imported.

import { ProgressbarModesExample } from './progressbar-modes.example';
import { ProgressbarOverviewExample } from './progressbar-overview.example';
import { ProgressbarShowValueExample } from './progressbar-show-value.example';
import { ProgressbarSizesExample } from './progressbar-sizes.example';
import { ProgressbarVariantsExample } from './progressbar-variants.example';

/** Source text of this folder's examples, keyed by the example component itself. */
export const PROGRESSBAR_EXAMPLE_SOURCES: ReadonlyMap<unknown, string> = new Map<unknown, string>([
  [
    ProgressbarModesExample,
    'import { Component } from \'@angular/core\';\nimport { ProgressbarComponent } from \'@guildofgleks/ui\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [ProgressbarComponent],\n  template: `\n    <gog-progressbar [value]="42" ariaLabel="Upload" />\n    <gog-progressbar mode="indeterminate" ariaLabel="Loading" />\n    <gog-progressbar mode="buffer" [value]="42" [buffer]="70" ariaLabel="Playback" />\n  `,\n})\nexport class ProgressbarModesExample {}',
  ],
  [
    ProgressbarOverviewExample,
    "import { Component } from '@angular/core';\nimport { ProgressbarComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [ProgressbarComponent],\n  template: `<gog-progressbar [value]=\"42\" ariaLabel=\"Upload progress\" />`,\n})\nexport class ProgressbarOverviewExample {}",
  ],
  [
    ProgressbarShowValueExample,
    'import { Component, signal } from \'@angular/core\';\nimport { ProgressbarComponent } from \'@guildofgleks/ui\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [ProgressbarComponent],\n  template: `\n    <gog-progressbar [value]="uploaded()" [showValue]="true" ariaLabel="Upload progress" />\n  `,\n})\nexport class ProgressbarShowValueExample {\n  protected readonly uploaded = signal(42);\n}',
  ],
  [
    ProgressbarSizesExample,
    "import { Component } from '@angular/core';\nimport { GogSize, ProgressbarComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [ProgressbarComponent],\n  template: `\n    @for (sizeOption of sizes; track sizeOption) {\n      <gog-progressbar [size]=\"sizeOption\" [value]=\"65\" [ariaLabel]=\"sizeOption\" />\n    }\n  `,\n})\nexport class ProgressbarSizesExample {\n  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];\n}",
  ],
  [
    ProgressbarVariantsExample,
    "import { Component } from '@angular/core';\nimport { GogProgressbarVariant, ProgressbarComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [ProgressbarComponent],\n  template: `\n    @for (variantOption of variants; track variantOption) {\n      <gog-progressbar [variant]=\"variantOption\" [value]=\"65\" [ariaLabel]=\"variantOption\" />\n    }\n  `,\n})\nexport class ProgressbarVariantsExample {\n  protected readonly variants: GogProgressbarVariant[] = [\n    'accent',\n    'success',\n    'danger',\n    'warning',\n    'info',\n  ];\n}",
  ],
]);
