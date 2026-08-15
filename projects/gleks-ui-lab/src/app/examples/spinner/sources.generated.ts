// GENERATED FILE — do not edit by hand.
// Run `npm run generate:examples` after adding or editing an *.example.ts file in this folder.
// See scripts/generate-example-sources.mjs for why the source text is generated rather than imported.

import { SpinnerColorExample } from './spinner-color.example';
import { SpinnerCustomVariantExample } from './spinner-custom-variant.example';
import { SpinnerFullscreenExample } from './spinner-fullscreen.example';
import { SpinnerOverlayExample } from './spinner-overlay.example';
import { SpinnerOverviewExample } from './spinner-overview.example';
import { SpinnerSizesExample } from './spinner-sizes.example';
import { SpinnerSpeedExample } from './spinner-speed.example';
import { SpinnerVariantsExample } from './spinner-variants.example';

/** Source text of this folder's examples, keyed by the example component itself. */
export const SPINNER_EXAMPLE_SOURCES: ReadonlyMap<unknown, string> = new Map<unknown, string>([
  [
    SpinnerColorExample,
    'import { Component } from \'@angular/core\';\nimport { SpinnerComponent } from \'@guildofgleks/ui\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [SpinnerComponent],\n  template: `\n    <gog-spinner\n      ariaLabel="Loading, danger color"\n      style="--gog-spinner-color: var(--gog-danger-color)"\n    />\n    <gog-spinner\n      ariaLabel="Loading, success color"\n      style="--gog-spinner-color: var(--gog-success-color)"\n    />\n  `,\n  styles: `\n    :host {\n      display: flex;\n      flex-wrap: wrap;\n      align-items: center;\n      gap: 12px;\n    }\n  `,\n})\nexport class SpinnerColorExample {}',
  ],
  [
    SpinnerCustomVariantExample,
    'import { Component } from \'@angular/core\';\nimport { SpinnerComponent } from \'@guildofgleks/ui\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [SpinnerComponent],\n  template: `\n    <gog-spinner variant="custom" size="lg" ariaLabel="Loading, custom variant">\n      <div class="dots-loader"><span></span><span></span><span></span></div>\n    </gog-spinner>\n  `,\n  styles: `\n    :host {\n      display: flex;\n      flex-wrap: wrap;\n      align-items: center;\n      gap: 12px;\n    }\n    .dots-loader {\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      gap: 8px;\n      width: 100%;\n      height: 100%;\n    }\n    .dots-loader span {\n      width: 22%;\n      aspect-ratio: 1;\n      border-radius: 50%;\n      background: var(--gog-spinner-color, var(--gog-accent-color));\n      animation: dots-bounce 0.9s ease-in-out infinite;\n    }\n    .dots-loader span:nth-child(2) {\n      animation-delay: 0.15s;\n    }\n    .dots-loader span:nth-child(3) {\n      animation-delay: 0.3s;\n    }\n    @keyframes dots-bounce {\n      0%,\n      80%,\n      100% {\n        transform: scale(0.6);\n        opacity: 0.5;\n      }\n      40% {\n        transform: scale(1);\n        opacity: 1;\n      }\n    }\n  `,\n})\nexport class SpinnerCustomVariantExample {}',
  ],
  [
    SpinnerFullscreenExample,
    'import { Component, signal } from \'@angular/core\';\nimport { SpinnerComponent } from \'@guildofgleks/ui\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [SpinnerComponent],\n  template: `\n    @if (loading()) {\n      <gog-spinner [overlay]="true" size="lg" ariaLabel="Loading page" />\n    }\n  `,\n})\nexport class SpinnerFullscreenExample {\n  protected readonly loading = signal(true);\n}',
  ],
  [
    SpinnerOverlayExample,
    'import { Component, signal } from \'@angular/core\';\nimport { SpinnerOverlayComponent } from \'@guildofgleks/ui\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [SpinnerOverlayComponent],\n  template: `\n    <gog-spinner-overlay [loading]="loading()" size="lg" variant="ring" ariaLabel="Loading content">\n      <div class="panel"><!-- any content --></div>\n    </gog-spinner-overlay>\n  `,\n  styles: `\n    :host {\n      display: flex;\n      flex-wrap: wrap;\n      align-items: center;\n      gap: 12px;\n    }\n    .panel {\n      display: grid;\n      gap: 12px;\n      min-height: 160px;\n      align-content: center;\n      padding: 20px;\n      border: 1px solid var(--gog-border-color);\n      border-radius: var(--gog-radius);\n      background: color-mix(in srgb, var(--gog-surface-color) 88%, transparent);\n    }\n  `,\n})\nexport class SpinnerOverlayExample {\n  protected readonly loading = signal(true);\n}',
  ],
  [
    SpinnerOverviewExample,
    "import { Component } from '@angular/core';\nimport { SpinnerComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [SpinnerComponent],\n  template: `<gog-spinner ariaLabel=\"Loading\" />`,\n})\nexport class SpinnerOverviewExample {}",
  ],
  [
    SpinnerSizesExample,
    "import { Component } from '@angular/core';\nimport { GogSize, SpinnerComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [SpinnerComponent],\n  template: `\n    @for (sizeOption of sizes; track sizeOption) {\n      <gog-spinner [size]=\"sizeOption\" [ariaLabel]=\"'Loading ' + sizeOption\" />\n    }\n  `,\n  styles: `\n    :host {\n      display: flex;\n      flex-wrap: wrap;\n      align-items: center;\n      gap: 12px;\n    }\n  `,\n})\nexport class SpinnerSizesExample {\n  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];\n}",
  ],
  [
    SpinnerSpeedExample,
    'import { Component } from \'@angular/core\';\nimport { SpinnerComponent } from \'@guildofgleks/ui\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [SpinnerComponent],\n  template: `\n    <gog-spinner size="lg" style="--gog-spinner-spin-duration: 2.4s" ariaLabel="Loading, slow" />\n    <gog-spinner size="lg" style="--gog-spinner-spin-duration: 0.5s" ariaLabel="Loading, fast" />\n  `,\n  styles: `\n    :host {\n      display: flex;\n      flex-wrap: wrap;\n      align-items: center;\n      gap: 12px;\n    }\n  `,\n})\nexport class SpinnerSpeedExample {}',
  ],
  [
    SpinnerVariantsExample,
    "import { Component } from '@angular/core';\nimport { GogSpinnerVariant, SpinnerComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [SpinnerComponent],\n  template: `\n    @for (variantOption of variants; track variantOption) {\n      <gog-spinner\n        [variant]=\"variantOption\"\n        size=\"lg\"\n        [ariaLabel]=\"'Loading, ' + variantOption + ' variant'\"\n      />\n    }\n  `,\n  styles: `\n    :host {\n      display: flex;\n      flex-wrap: wrap;\n      align-items: center;\n      gap: 12px;\n    }\n  `,\n})\nexport class SpinnerVariantsExample {\n  protected readonly variants: GogSpinnerVariant[] = ['runic', 'ring'];\n}",
  ],
]);
