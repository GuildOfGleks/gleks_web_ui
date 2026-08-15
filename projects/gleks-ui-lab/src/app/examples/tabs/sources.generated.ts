// GENERATED FILE — do not edit by hand.
// Run `npm run generate:examples` after adding or editing an *.example.ts file in this folder.
// See scripts/generate-example-sources.mjs for why the source text is generated rather than imported.

import { TabsAlignExample } from './tabs-align.example';
import { TabsHeaderSlotExample } from './tabs-header-slot.example';
import { TabsLazyExample } from './tabs-lazy.example';
import { TabsOverviewExample } from './tabs-overview.example';

/** Source text of this folder's examples, keyed by the example component itself. */
export const TABS_EXAMPLE_SOURCES: ReadonlyMap<unknown, string> = new Map<unknown, string>([
  [
    TabsAlignExample,
    "import { Component } from '@angular/core';\nimport { GogTabsAlign, TabComponent, TabsComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [TabsComponent, TabComponent],\n  template: `\n    @for (alignment of alignments; track alignment) {\n      <gog-tabs [align]=\"alignment\">\n        <gog-tab label=\"One\">…</gog-tab>\n        <gog-tab label=\"Two\">…</gog-tab>\n      </gog-tabs>\n    }\n  `,\n})\nexport class TabsAlignExample {\n  protected readonly alignments: GogTabsAlign[] = ['start', 'center', 'end', 'stretch'];\n}",
  ],
  [
    TabsHeaderSlotExample,
    'import { Component } from \'@angular/core\';\nimport { GogTabHeaderDirective, TabComponent, TabsComponent, TagComponent } from \'@guildofgleks/ui\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [TabsComponent, TabComponent, GogTabHeaderDirective, TagComponent],\n  template: `\n    <gog-tabs ariaLabel="Inbox">\n      <ng-template gogTabHeader let-tab let-active="active">\n        <span>{{ tab.label() }}</span>\n        @if (active) {\n          <gog-tag variant="info" size="xsm">now</gog-tag>\n        }\n      </ng-template>\n\n      <gog-tab label="Unread">…</gog-tab>\n      <gog-tab label="Archived">…</gog-tab>\n    </gog-tabs>\n  `,\n})\nexport class TabsHeaderSlotExample {}',
  ],
  [
    TabsLazyExample,
    'import { Component } from \'@angular/core\';\nimport { GogTabContentDirective, TabComponent, TabsComponent } from \'@guildofgleks/ui\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [TabsComponent, TabComponent, GogTabContentDirective],\n  template: `\n    <gog-tabs ariaLabel="Reports">\n      <gog-tab label="Summary">\n        <p>Rendered with the page. Type here, switch tabs and come back — the value survives.</p>\n        <input placeholder="Type something" />\n      </gog-tab>\n\n      <gog-tab label="Expensive report">\n        <!-- Wrapped in an ng-template carrying gogTabContent, so nothing inside is created\n             until this tab is first opened. Put anything costly here: a chart, a table, a\n             component that fetches on init. -->\n        <ng-template gogTabContent>\n          <p>Created the first time this tab was opened, not with the page.</p>\n        </ng-template>\n      </gog-tab>\n    </gog-tabs>\n  `,\n})\nexport class TabsLazyExample {}',
  ],
  [
    TabsOverviewExample,
    'import { Component, signal } from \'@angular/core\';\nimport { TabComponent, TabsComponent } from \'@guildofgleks/ui\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [TabsComponent, TabComponent],\n  template: `\n    <gog-tabs ariaLabel="Account" [(activeIndex)]="activeIndex">\n      <gog-tab label="Profile">Profile content.</gog-tab>\n      <gog-tab label="Settings" iconName="info">Settings content.</gog-tab>\n      <gog-tab label="Billing" [disabled]="true">Not available.</gog-tab>\n    </gog-tabs>\n  `,\n})\nexport class TabsOverviewExample {\n  protected readonly activeIndex = signal(0);\n}',
  ],
]);
