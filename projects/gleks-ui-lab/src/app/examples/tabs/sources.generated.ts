// GENERATED FILE — do not edit by hand.
// Run `npm run generate:examples` after adding or editing an example in this folder.
// See scripts/generate-example-sources.mjs for why the source text is generated rather than imported.

import type { ExampleSource } from '../../components/shared/example-sources';

import { TabsAlignExample } from './tabs-align/example';
import { TabsHeaderSlotExample } from './tabs-header-slot/example';
import { TabsLazyExample } from './tabs-lazy/example';
import { TabsOverviewExample } from './tabs-overview/example';

/** The three files of each example in this folder, keyed by the example component itself. */
export const TABS_EXAMPLE_SOURCES: ReadonlyMap<unknown, ExampleSource> = new Map<
  unknown,
  ExampleSource
>([
  [
    TabsAlignExample,
    {
      html: '<div class="example">\n  @for (alignment of alignments; track alignment) {\n    <p class="label">align: {{ alignment }}</p>\n    <gog-tabs [align]="alignment">\n      <gog-tab label="One">Panel one — the alignment above is {{ alignment }}.</gog-tab>\n      <gog-tab label="Two">Panel two.</gog-tab>\n    </gog-tabs>\n  }\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { GogTabsAlign, TabComponent, TabsComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [TabsComponent, TabComponent],\n})\nexport class TabsAlignExample {\n  protected readonly alignments: GogTabsAlign[] = ['start', 'center', 'end', 'stretch'];\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  gap: 20px;\n}\n.label {\n  margin: 0 0 4px;\n  color: var(--gog-muted-text-color);\n  font-size: var(--gog-text-sm);\n}',
    },
  ],
  [
    TabsHeaderSlotExample,
    {
      html: '<div class="example">\n  <gog-tabs ariaLabel="Inbox">\n    <ng-template gogTabHeader let-tab let-active="active">\n      <span>{{ tab.label() }}</span>\n      @if (active) {\n        <gog-tag variant="info" size="xsm">now</gog-tag>\n      }\n    </ng-template>\n\n    <gog-tab label="Unread">Two unread messages.</gog-tab>\n    <gog-tab label="Archived">Nothing archived yet.</gog-tab>\n  </gog-tabs>\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { GogTabHeaderDirective, TabComponent, TabsComponent, TagComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [TabsComponent, TabComponent, GogTabHeaderDirective, TagComponent],\n})\nexport class TabsHeaderSlotExample {}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 16px;\n}',
    },
  ],
  [
    TabsLazyExample,
    {
      html: '<div class="example">\n  <gog-tabs ariaLabel="Reports">\n    <gog-tab label="Summary">\n      <p>Rendered with the page. Type here, switch tabs and come back — the value survives.</p>\n      <input placeholder="Type something" />\n    </gog-tab>\n\n    <gog-tab label="Expensive report">\n      <!-- Wrapped in an ng-template carrying gogTabContent, so nothing inside is created\n           until this tab is first opened. Put anything costly here: a chart, a table, a\n           component that fetches on init. -->\n      <ng-template gogTabContent>\n        <p>Created the first time this tab was opened, not with the page.</p>\n      </ng-template>\n    </gog-tab>\n  </gog-tabs>\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { GogTabContentDirective, TabComponent, TabsComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [TabsComponent, TabComponent, GogTabContentDirective],\n})\nexport class TabsLazyExample {}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 16px;\n}',
    },
  ],
  [
    TabsOverviewExample,
    {
      html: '<div class="example">\n  <gog-tabs ariaLabel="Account" [(activeIndex)]="activeIndex">\n    <gog-tab label="Profile">Profile content.</gog-tab>\n    <gog-tab label="Settings" iconName="info">Settings content.</gog-tab>\n    <gog-tab label="Billing" [disabled]="true">Not available.</gog-tab>\n  </gog-tabs>\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { TabComponent, TabsComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [TabsComponent, TabComponent],\n})\nexport class TabsOverviewExample {\n  protected readonly activeIndex = signal(0);\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 16px;\n}',
    },
  ],
]);
