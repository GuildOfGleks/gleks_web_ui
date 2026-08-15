// GENERATED FILE — do not edit by hand.
// Run `npm run generate:examples` after adding or editing an *.example.ts file in this folder.
// See scripts/generate-example-sources.mjs for why the source text is generated rather than imported.

import { ScrollAxisExample } from './scroll-axis.example';
import { ScrollConfigExample } from './scroll-config.example';
import { ScrollMethodsExample } from './scroll-methods.example';
import { ScrollOverviewExample } from './scroll-overview.example';
import { ScrollReachExample } from './scroll-reach.example';
import { ScrollSizeAutoHideExample } from './scroll-size-auto-hide.example';

/** Source text of this folder's examples, keyed by the example component itself. */
export const SCROLL_EXAMPLE_SOURCES: ReadonlyMap<unknown, string> = new Map<unknown, string>([
  [
    ScrollAxisExample,
    'import { Component } from \'@angular/core\';\nimport { ScrollComponent } from \'@guildofgleks/ui\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [ScrollComponent],\n  template: `\n    <gog-scroll axis="both" style="height: 160px; width: 320px">\n      <div style="width: 600px;">…</div>\n    </gog-scroll>\n  `,\n})\nexport class ScrollAxisExample {}',
  ],
  [
    ScrollConfigExample,
    "import { Component } from '@angular/core';\nimport { ScrollComponent, provideGogConfig } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [ScrollComponent],\n  // In an app this goes in `appConfig.providers` and applies everywhere. Provided on the\n  // component here so the defaults are scoped to this example — that scoping is itself the\n  // point: a lazy feature can set its own without touching the rest of the app.\n  providers: [\n    provideGogConfig({\n      scroll: { size: 'thin', hideDelay: 1200, overscrollBehavior: 'contain' },\n    }),\n  ],\n  template: `\n    <gog-scroll class=\"box\" ariaLabel=\"Rows\">\n      @for (row of rows; track row) {\n        <p>{{ row }}</p>\n      }\n    </gog-scroll>\n  `,\n  styles: `\n    .box {\n      display: block;\n      height: 160px;\n      border: 1px solid var(--gog-border-color);\n      border-radius: var(--gog-radius);\n      padding: 0 12px;\n    }\n  `,\n})\nexport class ScrollConfigExample {\n  protected readonly rows = Array.from({ length: 30 }, (_, index) => `Row ${index + 1}`);\n}",
  ],
  [
    ScrollMethodsExample,
    'import { Component, viewChild } from \'@angular/core\';\nimport { ButtonComponent, ScrollComponent } from \'@guildofgleks/ui\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [ButtonComponent, ScrollComponent],\n  template: `\n    <div class="controls">\n      <gog-button size="sm" (gogClick)="scroller().scrollToTop()">To top</gog-button>\n      <gog-button size="sm" (gogClick)="scroller().scrollToBottom()">To bottom</gog-button>\n    </div>\n\n    <gog-scroll class="box" ariaLabel="Rows">\n      @for (row of rows; track row) {\n        <p>{{ row }}</p>\n      }\n    </gog-scroll>\n  `,\n  styles: `\n    .controls {\n      display: flex;\n      gap: 8px;\n      margin-bottom: 12px;\n    }\n    .box {\n      display: block;\n      height: 160px;\n      border: 1px solid var(--gog-border-color);\n      border-radius: var(--gog-radius);\n      padding: 0 12px;\n    }\n  `,\n})\nexport class ScrollMethodsExample {\n  // Located by type rather than by name: one `gog-scroll` in the template, so there is nothing\n  // to disambiguate, and the reference is typed without a generic.\n  protected readonly scroller = viewChild.required(ScrollComponent);\n\n  protected readonly rows = Array.from({ length: 30 }, (_, index) => `Row ${index + 1}`);\n}',
  ],
  [
    ScrollOverviewExample,
    "import { Component } from '@angular/core';\nimport { ScrollComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [ScrollComponent],\n  template: `\n    <gog-scroll style=\"height: 200px\" ariaLabel=\"Example list\">\n      @for (item of items; track item) {\n        <p>{{ item }}</p>\n      }\n    </gog-scroll>\n  `,\n})\nexport class ScrollOverviewExample {\n  protected readonly items = Array.from({ length: 30 }, (_, i) => `Row ${i + 1}`);\n}",
  ],
  [
    ScrollReachExample,
    "import { Component, signal } from '@angular/core';\nimport { GogScrollMetrics, ScrollComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [ScrollComponent],\n  template: `\n    <gog-scroll\n      style=\"height: 160px\"\n      [reachThreshold]=\"8\"\n      (gogReachStart)=\"reachState.set('At the top')\"\n      (gogReachEnd)=\"reachState.set('At the bottom')\"\n      (gogScroll)=\"onScroll($event)\"\n    >\n      …\n    </gog-scroll>\n  `,\n})\nexport class ScrollReachExample {\n  protected readonly reachState = signal('Scroll to see it fire.');\n\n  protected onScroll(metrics: GogScrollMetrics): void {\n    console.log(metrics.scrollTop, metrics.scrollHeight);\n  }\n}",
  ],
  [
    ScrollSizeAutoHideExample,
    "import { Component, signal } from '@angular/core';\nimport { ScrollComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [ScrollComponent],\n  template: `<gog-scroll [size]=\"size()\" [autoHide]=\"autoHide()\" style=\"height: 160px\"\n    >…</gog-scroll\n  >`,\n})\nexport class ScrollSizeAutoHideExample {\n  protected readonly size = signal<'normal' | 'thin'>('normal');\n  protected readonly autoHide = signal(true);\n}",
  ],
]);
