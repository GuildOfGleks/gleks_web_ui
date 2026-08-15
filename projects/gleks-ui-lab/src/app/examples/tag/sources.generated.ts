// GENERATED FILE — do not edit by hand.
// Run `npm run generate:examples` after adding or editing an example in this folder.
// See scripts/generate-example-sources.mjs for why the source text is generated rather than imported.

import type { ExampleSource } from '../../components/shared/example-sources';

import { TagCustomIconExample } from './tag-custom-icon/example';
import { TagFullWidthExample } from './tag-full-width/example';
import { TagOverviewExample } from './tag-overview/example';
import { TagShapesExample } from './tag-shapes/example';
import { TagSizesExample } from './tag-sizes/example';
import { TagVariantsExample } from './tag-variants/example';

/** The three files of each example in this folder, keyed by the example component itself. */
export const TAG_EXAMPLE_SOURCES: ReadonlyMap<unknown, ExampleSource> = new Map<
  unknown,
  ExampleSource
>([
  [
    TagCustomIconExample,
    {
      html: '<div class="example">\n  <gog-tag variant="success">\n    <ng-template gogTagIcon>\n      <gog-icon name="checkbox-checked" />\n    </ng-template>\n    Featured\n  </gog-tag>\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { GogTagIconDirective, IconComponent, TagComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [TagComponent, IconComponent, GogTagIconDirective],\n})\nexport class TagCustomIconExample {}",
      css: '.example {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 12px;\n}',
    },
  ],
  [
    TagFullWidthExample,
    {
      html: '<div class="example">\n  <gog-tag variant="info" [fullWidth]="true">Full width</gog-tag>\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { TagComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [TagComponent],\n})\nexport class TagFullWidthExample {}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    TagOverviewExample,
    {
      html: '<div class="example">\n  <gog-tag variant="success" iconName="check">In stock</gog-tag>\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { TagComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [TagComponent],\n})\nexport class TagOverviewExample {}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    TagShapesExample,
    {
      html: '<div class="example">\n  <gog-tag shape="rounded" variant="success" iconName="check">Available</gog-tag>\n  <gog-tag shape="pill" variant="success" iconName="check">Available</gog-tag>\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { TagComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [TagComponent],\n})\nexport class TagShapesExample {}",
      css: '.example {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 12px;\n}',
    },
  ],
  [
    TagSizesExample,
    {
      html: '<div class="example">\n  @for (sizeOption of sizes; track sizeOption) {\n    <gog-tag [size]="sizeOption" variant="success">Available</gog-tag>\n  }\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { GogSize, TagComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [TagComponent],\n})\nexport class TagSizesExample {\n  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];\n}",
      css: '.example {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 12px;\n}',
    },
  ],
  [
    TagVariantsExample,
    {
      html: '<div class="example">\n  @for (variantOption of variants; track variantOption) {\n    <gog-tag [variant]="variantOption" [iconName]="variantIcons[variantOption]"> Example </gog-tag>\n  }\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { GogTagVariant, TagComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [TagComponent],\n})\nexport class TagVariantsExample {\n  protected readonly variants: GogTagVariant[] = ['success', 'danger', 'warning', 'info'];\n  protected readonly variantIcons: Record<GogTagVariant, string> = {\n    success: 'check',\n    danger: 'error',\n    warning: 'warning',\n    info: 'info',\n  };\n}",
      css: '.example {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 12px;\n}',
    },
  ],
]);
