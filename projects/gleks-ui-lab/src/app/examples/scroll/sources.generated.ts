// GENERATED FILE — do not edit by hand.
// Run `npm run generate:examples` after adding or editing an example in this folder.
// See scripts/generate-example-sources.mjs for why the source text is generated rather than imported.

import type { ExampleSource } from '../../components/shared/example-sources';

import { ScrollAxisExample } from './scroll-axis/example';
import { ScrollConfigExample } from './scroll-config/example';
import { ScrollMethodsExample } from './scroll-methods/example';
import { ScrollOverviewExample } from './scroll-overview/example';
import { ScrollReachExample } from './scroll-reach/example';
import { ScrollSizeAutoHideExample } from './scroll-size-auto-hide/example';

/** The three files of each example in this folder, keyed by the example component itself. */
export const SCROLL_EXAMPLE_SOURCES: ReadonlyMap<unknown, ExampleSource> = new Map<
  unknown,
  ExampleSource
>([
  [
    ScrollAxisExample,
    {
      html: '<div class="example">\n  <gog-scroll axis="both" class="box" ariaLabel="Grid">\n    <!-- Wider and taller than the box, so both bars have something to do. -->\n    <div class="grid">\n      @for (cell of cells; track cell) {\n        <span class="cell">{{ cell }}</span>\n      }\n    </div>\n  </gog-scroll>\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { ScrollComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [ScrollComponent],\n})\nexport class ScrollAxisExample {\n  protected readonly cells = Array.from({ length: 40 }, (_, index) => `Cell ${index + 1}`);\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 16px;\n}\n.box {\n  height: 160px;\n  width: 320px;\n  border: 1px solid var(--gog-border-color);\n  border-radius: var(--gog-radius);\n}\n.grid {\n  display: grid;\n  grid-template-columns: repeat(8, 90px);\n  gap: 8px;\n  padding: 8px;\n}\n.cell {\n  padding: 12px 8px;\n  border-radius: var(--gog-radius);\n  background: var(--gog-hover-color);\n  font-size: var(--gog-text-sm);\n  text-align: center;\n}',
    },
  ],
  [
    ScrollConfigExample,
    {
      html: '<div class="example">\n  <gog-scroll class="box" ariaLabel="Rows">\n    @for (row of rows; track row) {\n      <p>{{ row }}</p>\n    }\n  </gog-scroll>\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { ScrollComponent, provideGogConfig } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [ScrollComponent],\n  // In an app this goes in `appConfig.providers` and applies everywhere. Provided on the\n  // component here so the defaults are scoped to this example — that scoping is itself the\n  // point: a lazy feature can set its own without touching the rest of the app.\n  providers: [\n    provideGogConfig({\n      scroll: { size: 'thin', hideDelay: 1200, overscrollBehavior: 'contain' },\n    }),\n  ],\n})\nexport class ScrollConfigExample {\n  protected readonly rows = Array.from({ length: 30 }, (_, index) => `Row ${index + 1}`);\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 16px;\n}\ngog-scroll p {\n  margin: 0;\n  padding: 8px 0;\n  border-bottom: 1px solid var(--gog-border-color);\n}\n.box {\n  height: 160px;\n  border: 1px solid var(--gog-border-color);\n  border-radius: var(--gog-radius);\n  padding: 0 12px;\n}',
    },
  ],
  [
    ScrollMethodsExample,
    {
      html: '<div class="example">\n  <div class="controls">\n    <gog-button size="sm" (gogClick)="scroller().scrollToTop()">To top</gog-button>\n    <gog-button size="sm" (gogClick)="scroller().scrollToBottom()">To bottom</gog-button>\n  </div>\n\n  <gog-scroll class="box" ariaLabel="Rows">\n    @for (row of rows; track row) {\n      <p>{{ row }}</p>\n    }\n  </gog-scroll>\n</div>',
      ts: "import { Component, viewChild } from '@angular/core';\nimport { ButtonComponent, ScrollComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [ButtonComponent, ScrollComponent],\n})\nexport class ScrollMethodsExample {\n  // Located by type rather than by name: one `gog-scroll` in the template, so there is nothing\n  // to disambiguate, and the reference is typed without a generic.\n  protected readonly scroller = viewChild.required(ScrollComponent);\n\n  protected readonly rows = Array.from({ length: 30 }, (_, index) => `Row ${index + 1}`);\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 16px;\n}\ngog-scroll p {\n  margin: 0;\n  padding: 8px 0;\n  border-bottom: 1px solid var(--gog-border-color);\n}\n.controls {\n  display: flex;\n  gap: 8px;\n}\n.box {\n  height: 160px;\n  border: 1px solid var(--gog-border-color);\n  border-radius: var(--gog-radius);\n  padding: 0 12px;\n}',
    },
  ],
  [
    ScrollOverviewExample,
    {
      html: '<div class="example">\n  <gog-scroll class="box" ariaLabel="Example list">\n    @for (item of items; track item) {\n      <p>{{ item }}</p>\n    }\n  </gog-scroll>\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { ScrollComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [ScrollComponent],\n})\nexport class ScrollOverviewExample {\n  protected readonly items = Array.from({ length: 30 }, (_, i) => `Row ${i + 1}`);\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 16px;\n}\ngog-scroll p {\n  margin: 0;\n  padding: 8px 0;\n  border-bottom: 1px solid var(--gog-border-color);\n}\n.box {\n  height: 200px;\n  border: 1px solid var(--gog-border-color);\n  border-radius: var(--gog-radius);\n  padding: 0 12px;\n}',
    },
  ],
  [
    ScrollReachExample,
    {
      html: '<div class="example">\n  <gog-scroll\n    class="box"\n    ariaLabel="Rows"\n    [reachThreshold]="8"\n    (gogReachStart)="reachState.set(\'At the top\')"\n    (gogReachEnd)="reachState.set(\'At the bottom — this is where you would load more\')"\n    (gogScroll)="onScroll($event)"\n  >\n    @for (row of rows; track row) {\n      <p>{{ row }}</p>\n    }\n  </gog-scroll>\n\n  <div class="readout">\n    <span>{{ reachState() }}</span>\n    <span>scrollTop: {{ scrollTop() }}</span>\n  </div>\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { GogScrollMetrics, ScrollComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [ScrollComponent],\n})\nexport class ScrollReachExample {\n  protected readonly reachState = signal('Scroll to see it fire.');\n  protected readonly scrollTop = signal(0);\n  protected readonly rows = Array.from({ length: 30 }, (_, index) => `Row ${index + 1}`);\n\n  // Fires on every scroll and resize with the viewport's geometry — the same numbers a\n  // \"load more when near the end\" check would use.\n  protected onScroll(metrics: GogScrollMetrics): void {\n    this.scrollTop.set(Math.round(metrics.scrollTop));\n  }\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 16px;\n}\ngog-scroll p {\n  margin: 0;\n  padding: 8px 0;\n  border-bottom: 1px solid var(--gog-border-color);\n}\n.readout {\n  display: flex;\n  flex-wrap: wrap;\n  justify-content: space-between;\n  gap: 8px;\n  color: var(--gog-muted-text-color);\n  font-size: 0.9em;\n}\n.box {\n  height: 160px;\n  border: 1px solid var(--gog-border-color);\n  border-radius: var(--gog-radius);\n  padding: 0 12px;\n}',
    },
  ],
  [
    ScrollSizeAutoHideExample,
    {
      html: '<div class="example">\n  <div class="controls">\n    <gog-button\n      size="sm"\n      variant="outline"\n      (gogClick)="size.set(size() === \'thin\' ? \'normal\' : \'thin\')"\n    >\n      size: {{ size() }}\n    </gog-button>\n    <gog-button size="sm" variant="outline" (gogClick)="autoHide.set(!autoHide())">\n      autoHide: {{ autoHide() }}\n    </gog-button>\n  </div>\n\n  <gog-scroll [size]="size()" [autoHide]="autoHide()" class="box" ariaLabel="Rows">\n    @for (row of rows; track row) {\n      <p>{{ row }}</p>\n    }\n  </gog-scroll>\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { ButtonComponent, ScrollComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [ButtonComponent, ScrollComponent],\n})\nexport class ScrollSizeAutoHideExample {\n  protected readonly size = signal<'normal' | 'thin'>('normal');\n  // With autoHide off the thumb is always visible; on, it fades after `hideDelay`.\n  protected readonly autoHide = signal(true);\n\n  protected readonly rows = Array.from({ length: 30 }, (_, index) => `Row ${index + 1}`);\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 16px;\n}\ngog-scroll p {\n  margin: 0;\n  padding: 8px 0;\n  border-bottom: 1px solid var(--gog-border-color);\n}\n.controls {\n  display: flex;\n  gap: 8px;\n}\n.box {\n  height: 160px;\n  border: 1px solid var(--gog-border-color);\n  border-radius: var(--gog-radius);\n  padding: 0 12px;\n}',
    },
  ],
]);
