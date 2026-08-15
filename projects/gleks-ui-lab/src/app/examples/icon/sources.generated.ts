// GENERATED FILE — do not edit by hand.
// Run `npm run generate:examples` after adding or editing an example in this folder.
// See scripts/generate-example-sources.mjs for why the source text is generated rather than imported.

import type { ExampleSource } from '../../components/shared/example-sources';

import { IconCustomTemplateExample } from './icon-custom-template/example';
import { IconGalleryExample } from './icon-gallery/example';
import { IconMeaningfulExample } from './icon-meaningful/example';
import { IconOverrideExample } from './icon-override/example';
import { IconOverviewExample } from './icon-overview/example';
import { IconRegisterExample } from './icon-register/example';
import { IconSizingExample } from './icon-sizing/example';

/** The three files of each example in this folder, keyed by the example component itself. */
export const ICON_EXAMPLE_SOURCES: ReadonlyMap<unknown, ExampleSource> = new Map<
  unknown,
  ExampleSource
>([
  [
    IconCustomTemplateExample,
    {
      html: '<div class="example">\n  <gog-icon [template]="customDot" />\n\n  <ng-template #customDot>\n    <span\n      style="width: 1em; height: 1em; border-radius: 50%; background: currentColor; display: block"\n    ></span>\n  </ng-template>\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { IconComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [IconComponent],\n})\nexport class IconCustomTemplateExample {}",
      css: '.example {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 12px;\n}',
    },
  ],
  [
    IconGalleryExample,
    {
      html: '<div class="example">\n  @for (iconName of iconNames; track iconName) {\n    <gog-icon [name]="iconName" />\n  }\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { GogBuiltinIconName, ICON_DEFS, IconComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [IconComponent],\n})\nexport class IconGalleryExample {\n  // Read off the library, never hand-copied: this list grew from 19 to 41 in one release,\n  // and a literal array would have gone stale without anything failing.\n  protected readonly iconNames = Object.keys(ICON_DEFS) as GogBuiltinIconName[];\n}",
      css: '.example {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 12px;\n}',
    },
  ],
  [
    IconMeaningfulExample,
    {
      html: '<div class="example">\n  <gog-icon name="warning" [ariaHidden]="false" title="Warning" />\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { IconComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [IconComponent],\n})\nexport class IconMeaningfulExample {}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    IconOverrideExample,
    {
      html: '<div class="example">\n  <gog-icon name="check" />\n  <gog-checkbox label="Checkbox drawn with the same icon" [checked]="true" />\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { CheckboxComponent, IconComponent, provideGogIcons } from '@guildofgleks/ui';\n\n// A double-stroke tick, replacing the library's own.\nconst CHECK =\n  '<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"3\">' +\n  '<path d=\"M4 13l5 5L20 6\" /></svg>';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [IconComponent, CheckboxComponent],\n  // A registered name wins over the built-in of the same name, so every checkmark the library\n  // draws — checkbox, multiselect, toast — becomes yours with no call site touched.\n  providers: [provideGogIcons({ check: CHECK })],\n})\nexport class IconOverrideExample {}",
      css: '.example {\n  display: flex;\n  align-items: center;\n  gap: 16px;\n}',
    },
  ],
  [
    IconOverviewExample,
    {
      html: '<div class="example">\n  <gog-icon name="check" />\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { IconComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [IconComponent],\n})\nexport class IconOverviewExample {}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    IconRegisterExample,
    {
      html: '<div class="example">\n  <gog-icon name="cart" />\n  <gog-icon name="rocket" />\n</div>',
      ts: 'import { Component } from \'@angular/core\';\nimport { IconComponent, provideGogIcons } from \'@guildofgleks/ui\';\n\nconst CART =\n  \'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">\' +\n  \'<circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" />\' +\n  \'<path d="M2 3h3l2.5 12h11L21 7H6" /></svg>\';\n\nconst ROCKET =\n  \'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">\' +\n  \'<path d="M5 15l-2 6 6-2M14 4c4 2 6 6 6 10l-6 6-4-4 4-12z" /><circle cx="15" cy="9" r="1.5" /></svg>\';\n\n@Component({\n  selector: \'app-example\',\n  templateUrl: \'./example.html\',\n  styleUrl: \'./example.css\',\n  imports: [IconComponent],\n  // In an app this goes in `appConfig.providers` and applies everywhere. Providing it on a\n  // component scopes the set to that subtree — a lazy feature can register only what it uses,\n  // and nested providers layer onto the parent\'s set rather than replacing it.\n  providers: [provideGogIcons({ cart: CART, rocket: ROCKET })],\n})\nexport class IconRegisterExample {}',
      css: '.example {\n  display: flex;\n  align-items: center;\n  gap: 16px;\n  --gog-icon-size: 28px;\n}',
    },
  ],
  [
    IconSizingExample,
    {
      html: '<div class="example">\n  <gog-icon name="success" style="--gog-icon-size: 16px" />\n  <gog-icon name="success" style="--gog-icon-size: 24px" />\n  <gog-icon name="success" style="--gog-icon-size: 40px" />\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { IconComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [IconComponent],\n})\nexport class IconSizingExample {}",
      css: '.example {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 12px;\n}',
    },
  ],
]);
