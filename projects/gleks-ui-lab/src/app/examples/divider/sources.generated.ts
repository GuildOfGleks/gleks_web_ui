// GENERATED FILE — do not edit by hand.
// Run `npm run generate:examples` after adding or editing an example in this folder.
// See scripts/generate-example-sources.mjs for why the source text is generated rather than imported.

import type { ExampleSource } from '../../components/shared/example-sources';

import { DividerInsetExample } from './divider-inset/example';
import { DividerLabelExample } from './divider-label/example';
import { DividerOverviewExample } from './divider-overview/example';
import { DividerVariantsExample } from './divider-variants/example';
import { DividerVerticalExample } from './divider-vertical/example';

/** The three files of each example in this folder, keyed by the example component itself. */
export const DIVIDER_EXAMPLE_SOURCES: ReadonlyMap<unknown, ExampleSource> = new Map<
  unknown,
  ExampleSource
>([
  [
    DividerInsetExample,
    {
      html: '<div class="example">\n  <ul class="event-list">\n    <li><gog-icon name="success" /> Order placed</li>\n    <gog-divider [inset]="true" />\n    <li><gog-icon name="clock" /> Awaiting payment</li>\n  </ul>\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { DividerComponent, IconComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [DividerComponent, IconComponent],\n})\nexport class DividerInsetExample {}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 12px;\n  max-width: 420px;\n}\n.event-list {\n  list-style: none;\n  margin: 0;\n  padding: 0;\n  max-width: 320px;\n}\n.event-list li {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 10px 12px;\n}',
    },
  ],
  [
    DividerLabelExample,
    {
      html: '<div class="example">\n  <gog-divider>OR</gog-divider>\n\n  <gog-divider>\n    <gog-icon name="info" />\n    Shipping details\n  </gog-divider>\n\n  <gog-divider><gog-tag variant="warning">Draft</gog-tag></gog-divider>\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { DividerComponent, IconComponent, TagComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [DividerComponent, IconComponent, TagComponent],\n})\nexport class DividerLabelExample {}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 12px;\n  max-width: 420px;\n}',
    },
  ],
  [
    DividerOverviewExample,
    {
      html: '<div class="example">\n  <p>Above the rule.</p>\n  <gog-divider />\n  <p>Below it.</p>\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { DividerComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [DividerComponent],\n})\nexport class DividerOverviewExample {}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 12px;\n  max-width: 420px;\n}',
    },
  ],
  [
    DividerVariantsExample,
    {
      html: '<div class="example">\n  @for (variantOption of variants; track variantOption) {\n    <gog-divider [variant]="variantOption" />\n  }\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { DividerComponent, GogDividerVariant } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [DividerComponent],\n})\nexport class DividerVariantsExample {\n  protected readonly variants: GogDividerVariant[] = ['solid', 'dashed', 'dotted'];\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 12px;\n  max-width: 420px;\n}',
    },
  ],
  [
    DividerVerticalExample,
    {
      html: '<div class="example">\n  <div class="toolbar">\n    <button>Cut</button>\n    <gog-divider orientation="vertical" />\n    <button>Copy</button>\n  </div>\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { DividerComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [DividerComponent],\n})\nexport class DividerVerticalExample {}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 12px;\n  max-width: 420px;\n}\n.toolbar {\n  display: flex;\n  align-items: center;\n  /* A vertical divider stretches to the row when the row defines a height, */\n  /* otherwise it falls back to --gog-divider-vertical-length. */\n  height: 32px;\n}',
    },
  ],
]);
