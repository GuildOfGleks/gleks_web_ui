// GENERATED FILE — do not edit by hand.
// Run `npm run generate:examples` after adding or editing an *.example.ts file in this folder.
// See scripts/generate-example-sources.mjs for why the source text is generated rather than imported.

import { TagCustomIconExample } from './tag-custom-icon.example';
import { TagFullWidthExample } from './tag-full-width.example';
import { TagOverviewExample } from './tag-overview.example';
import { TagShapesExample } from './tag-shapes.example';
import { TagSizesExample } from './tag-sizes.example';
import { TagVariantsExample } from './tag-variants.example';

/** Source text of this folder's examples, keyed by the example component itself. */
export const TAG_EXAMPLE_SOURCES: ReadonlyMap<unknown, string> = new Map<unknown, string>([
  [
    TagCustomIconExample,
    "import { Component } from '@angular/core';\nimport { GogTagIconDirective, IconComponent, TagComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [TagComponent, IconComponent, GogTagIconDirective],\n  template: `\n    <gog-tag variant=\"success\">\n      <ng-template gogTagIcon>\n        <gog-icon name=\"checkbox-checked\" />\n      </ng-template>\n      Featured\n    </gog-tag>\n  `,\n  styles: `\n    :host {\n      display: flex;\n      flex-wrap: wrap;\n      align-items: center;\n      gap: 12px;\n    }\n  `,\n})\nexport class TagCustomIconExample {}",
  ],
  [
    TagFullWidthExample,
    "import { Component } from '@angular/core';\nimport { TagComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [TagComponent],\n  template: `<gog-tag variant=\"info\" [fullWidth]=\"true\">Full width</gog-tag>`,\n})\nexport class TagFullWidthExample {}",
  ],
  [
    TagOverviewExample,
    "import { Component } from '@angular/core';\nimport { TagComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [TagComponent],\n  template: `<gog-tag variant=\"success\" iconName=\"check\">In stock</gog-tag>`,\n})\nexport class TagOverviewExample {}",
  ],
  [
    TagShapesExample,
    'import { Component } from \'@angular/core\';\nimport { TagComponent } from \'@guildofgleks/ui\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [TagComponent],\n  template: `\n    <gog-tag shape="rounded" variant="success" iconName="check">Available</gog-tag>\n    <gog-tag shape="pill" variant="success" iconName="check">Available</gog-tag>\n  `,\n  styles: `\n    :host {\n      display: flex;\n      flex-wrap: wrap;\n      align-items: center;\n      gap: 12px;\n    }\n  `,\n})\nexport class TagShapesExample {}',
  ],
  [
    TagSizesExample,
    "import { Component } from '@angular/core';\nimport { GogSize, TagComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [TagComponent],\n  template: `\n    @for (sizeOption of sizes; track sizeOption) {\n      <gog-tag [size]=\"sizeOption\" variant=\"success\">Available</gog-tag>\n    }\n  `,\n  styles: `\n    :host {\n      display: flex;\n      flex-wrap: wrap;\n      align-items: center;\n      gap: 12px;\n    }\n  `,\n})\nexport class TagSizesExample {\n  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];\n}",
  ],
  [
    TagVariantsExample,
    "import { Component } from '@angular/core';\nimport { GogTagVariant, TagComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [TagComponent],\n  template: `\n    @for (variantOption of variants; track variantOption) {\n      <gog-tag [variant]=\"variantOption\" [iconName]=\"variantIcons[variantOption]\">\n        Example\n      </gog-tag>\n    }\n  `,\n  styles: `\n    :host {\n      display: flex;\n      flex-wrap: wrap;\n      align-items: center;\n      gap: 12px;\n    }\n  `,\n})\nexport class TagVariantsExample {\n  protected readonly variants: GogTagVariant[] = ['success', 'danger', 'warning', 'info'];\n  protected readonly variantIcons: Record<GogTagVariant, string> = {\n    success: 'check',\n    danger: 'error',\n    warning: 'warning',\n    info: 'info',\n  };\n}",
  ],
]);
