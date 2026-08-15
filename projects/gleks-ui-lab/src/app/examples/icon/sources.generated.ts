// GENERATED FILE — do not edit by hand.
// Run `npm run generate:examples` after adding or editing an *.example.ts file in this folder.
// See scripts/generate-example-sources.mjs for why the source text is generated rather than imported.

import { IconCustomTemplateExample } from './icon-custom-template.example';
import { IconGalleryExample } from './icon-gallery.example';
import { IconMeaningfulExample } from './icon-meaningful.example';
import { IconOverrideExample } from './icon-override.example';
import { IconOverviewExample } from './icon-overview.example';
import { IconRegisterExample } from './icon-register.example';
import { IconSizingExample } from './icon-sizing.example';

/** Source text of this folder's examples, keyed by the example component itself. */
export const ICON_EXAMPLE_SOURCES: ReadonlyMap<unknown, string> = new Map<unknown, string>([
  [
    IconCustomTemplateExample,
    "import { Component } from '@angular/core';\nimport { IconComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [IconComponent],\n  template: `\n    <gog-icon [template]=\"customDot\" />\n\n    <ng-template #customDot>\n      <span\n        style=\"width: 1em; height: 1em; border-radius: 50%; background: currentColor; display: block;\"\n      ></span>\n    </ng-template>\n  `,\n})\nexport class IconCustomTemplateExample {}",
  ],
  [
    IconGalleryExample,
    "import { Component } from '@angular/core';\nimport { GogBuiltinIconName, ICON_DEFS, IconComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [IconComponent],\n  template: `\n    @for (iconName of iconNames; track iconName) {\n      <gog-icon [name]=\"iconName\" />\n    }\n  `,\n})\nexport class IconGalleryExample {\n  // Read off the library, never hand-copied: this list grew from 19 to 41 in one release,\n  // and a literal array would have gone stale without anything failing.\n  protected readonly iconNames = Object.keys(ICON_DEFS) as GogBuiltinIconName[];\n}",
  ],
  [
    IconMeaningfulExample,
    'import { Component } from \'@angular/core\';\nimport { IconComponent } from \'@guildofgleks/ui\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [IconComponent],\n  template: `<gog-icon name="warning" [ariaHidden]="false" title="Warning" />`,\n})\nexport class IconMeaningfulExample {}',
  ],
  [
    IconOverrideExample,
    'import { Component } from \'@angular/core\';\nimport { CheckboxComponent, IconComponent, provideGogIcons } from \'@guildofgleks/ui\';\n\n// A double-stroke tick, replacing the library\'s own.\nconst CHECK =\n  \'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">\' +\n  \'<path d="M4 13l5 5L20 6" /></svg>\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [IconComponent, CheckboxComponent],\n  // A registered name wins over the built-in of the same name, so every checkmark the library\n  // draws — checkbox, multiselect, toast — becomes yours with no call site touched.\n  providers: [provideGogIcons({ check: CHECK })],\n  template: `\n    <gog-icon name="check" />\n    <gog-checkbox label="Checkbox drawn with the same icon" [checked]="true" />\n  `,\n  styles: `\n    :host {\n      display: flex;\n      align-items: center;\n      gap: 16px;\n    }\n  `,\n})\nexport class IconOverrideExample {}',
  ],
  [
    IconOverviewExample,
    "import { Component } from '@angular/core';\nimport { IconComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [IconComponent],\n  template: `<gog-icon name=\"check\" />`,\n})\nexport class IconOverviewExample {}",
  ],
  [
    IconRegisterExample,
    'import { Component } from \'@angular/core\';\nimport { IconComponent, provideGogIcons } from \'@guildofgleks/ui\';\n\nconst CART =\n  \'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">\' +\n  \'<circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" />\' +\n  \'<path d="M2 3h3l2.5 12h11L21 7H6" /></svg>\';\n\nconst ROCKET =\n  \'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">\' +\n  \'<path d="M5 15l-2 6 6-2M14 4c4 2 6 6 6 10l-6 6-4-4 4-12z" /><circle cx="15" cy="9" r="1.5" /></svg>\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [IconComponent],\n  // In an app this goes in `appConfig.providers` and applies everywhere. Providing it on a\n  // component scopes the set to that subtree — a lazy feature can register only what it uses,\n  // and nested providers layer onto the parent\'s set rather than replacing it.\n  providers: [provideGogIcons({ cart: CART, rocket: ROCKET })],\n  template: `\n    <gog-icon name="cart" />\n    <gog-icon name="rocket" />\n  `,\n  styles: `\n    :host {\n      display: flex;\n      align-items: center;\n      gap: 16px;\n      --gog-icon-size: 28px;\n    }\n  `,\n})\nexport class IconRegisterExample {}',
  ],
  [
    IconSizingExample,
    'import { Component } from \'@angular/core\';\nimport { IconComponent } from \'@guildofgleks/ui\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [IconComponent],\n  template: `\n    <gog-icon name="success" style="--gog-icon-size: 16px" />\n    <gog-icon name="success" style="--gog-icon-size: 24px" />\n    <gog-icon name="success" style="--gog-icon-size: 40px" />\n  `,\n})\nexport class IconSizingExample {}',
  ],
]);
