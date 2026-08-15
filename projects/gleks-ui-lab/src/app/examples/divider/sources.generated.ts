// GENERATED FILE — do not edit by hand.
// Run `npm run generate:examples` after adding or editing an *.example.ts file in this folder.
// See scripts/generate-example-sources.mjs for why the source text is generated rather than imported.

import { DividerInsetExample } from './divider-inset.example';
import { DividerLabelExample } from './divider-label.example';
import { DividerOverviewExample } from './divider-overview.example';
import { DividerVariantsExample } from './divider-variants.example';
import { DividerVerticalExample } from './divider-vertical.example';

/** Source text of this folder's examples, keyed by the example component itself. */
export const DIVIDER_EXAMPLE_SOURCES: ReadonlyMap<unknown, string> = new Map<unknown, string>([
  [
    DividerInsetExample,
    'import { Component } from \'@angular/core\';\nimport { DividerComponent, IconComponent } from \'@guildofgleks/ui\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [DividerComponent, IconComponent],\n  template: `\n    <ul class="event-list">\n      <li><gog-icon name="success" /> Order placed</li>\n      <gog-divider [inset]="true" />\n      <li><gog-icon name="clock" /> Awaiting payment</li>\n    </ul>\n  `,\n})\nexport class DividerInsetExample {}',
  ],
  [
    DividerLabelExample,
    "import { Component } from '@angular/core';\nimport { DividerComponent, IconComponent, TagComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [DividerComponent, IconComponent, TagComponent],\n  template: `\n    <gog-divider>OR</gog-divider>\n\n    <gog-divider>\n      <gog-icon name=\"info\" />\n      Shipping details\n    </gog-divider>\n\n    <gog-divider><gog-tag variant=\"warning\">Draft</gog-tag></gog-divider>\n  `,\n})\nexport class DividerLabelExample {}",
  ],
  [
    DividerOverviewExample,
    "import { Component } from '@angular/core';\nimport { DividerComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [DividerComponent],\n  template: `\n    <p>Above the rule.</p>\n    <gog-divider />\n    <p>Below it.</p>\n  `,\n})\nexport class DividerOverviewExample {}",
  ],
  [
    DividerVariantsExample,
    "import { Component } from '@angular/core';\nimport { DividerComponent, GogDividerVariant } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [DividerComponent],\n  template: `\n    @for (variantOption of variants; track variantOption) {\n      <gog-divider [variant]=\"variantOption\" />\n    }\n  `,\n})\nexport class DividerVariantsExample {\n  protected readonly variants: GogDividerVariant[] = ['solid', 'dashed', 'dotted'];\n}",
  ],
  [
    DividerVerticalExample,
    "import { Component } from '@angular/core';\nimport { DividerComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [DividerComponent],\n  template: `\n    <div class=\"toolbar\">\n      <button>Cut</button>\n      <gog-divider orientation=\"vertical\" />\n      <button>Copy</button>\n    </div>\n  `,\n  styles: `\n    .toolbar {\n      display: flex;\n      align-items: center;\n      /* A vertical divider stretches to the row when the row defines a height, */\n      /* otherwise it falls back to --gog-divider-vertical-length. */\n      height: 32px;\n    }\n  `,\n})\nexport class DividerVerticalExample {}",
  ],
]);
