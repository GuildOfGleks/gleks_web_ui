import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  AccordionComponent,
  ButtonComponent,
  GogAccordionChevronDirective,
  GogAccordionContentDirective,
  GogAccordionHeaderDirective,
  GogAccordionItem,
  GogAccordionToggleEvent,
  GogIconName,
  GogSize,
  IconComponent,
} from '@guildofgleks/ui';
import { CodeTabsComponent } from '../../shared/code-tabs/code-tabs';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';

interface BasicItem extends GogAccordionItem {
  readonly body: string;
}

interface StatusItem extends GogAccordionItem {
  readonly icon: GogIconName;
  readonly subtitle: string;
  readonly body: string;
}

interface ApiRow {
  readonly name: string;
  readonly type: string;
  readonly default: string;
  readonly description: string;
}

const API_INPUTS: readonly ApiRow[] = [
  {
    name: 'items',
    type: 'GogAccordionItem[]',
    default: '[]',
    description: 'The sections to render. Each item needs an id and title, and may set disabled.',
  },
  {
    name: 'size',
    type: "'xsm' | 'sm' | 'md' | 'lg' | 'slg'",
    default: "'lg'",
    description: 'Header/body padding, font size, and chevron size.',
  },
  {
    name: 'expandFirst',
    type: 'boolean',
    default: 'false',
    description:
      'Opens the first item once items becomes non-empty. Fires only that one time — closing everything by hand does not reopen it, even if items is later replaced.',
  },
  {
    name: 'multi',
    type: 'boolean',
    default: 'false',
    description: 'Allows more than one item open at once. Off by default: opening an item closes the rest.',
  },
  {
    name: 'loading',
    type: 'boolean',
    default: 'false',
    description:
      'Renders a shimmering skeleton row per item instead of real headers — for when the item list itself hasn\'t arrived yet.',
  },
  {
    name: 'showChevron',
    type: 'boolean',
    default: 'true',
    description: 'Toggles the trailing chevron indicator.',
  },
  {
    name: 'headingLevel',
    type: '2 | 3 | 4 | 5 | 6 | undefined',
    default: 'undefined',
    description:
      'Wraps each header in role="heading" at this aria-level, so screen readers can navigate sections by heading. Leave unset when the accordion is not part of the document outline.',
  },
  {
    name: 'openIds',
    type: 'ReadonlySet<string | number>',
    default: 'new Set()',
    description: 'Two-way bindable set of open item ids — drive the accordion externally with [(openIds)].',
  },
];

interface SlotRow {
  readonly name: string;
  readonly context: string;
  readonly description: string;
}

const CONTENT_SLOTS: readonly SlotRow[] = [
  {
    name: 'gogAccordionHeader',
    context: 'let-item; let-open="open"',
    description: 'Replaces the header content (everything left of the chevron). Falls back to item.title.',
  },
  {
    name: 'gogAccordionChevron',
    context: 'let-item; let-open="open"',
    description: 'Replaces the trailing chevron icon. Ignored when showChevron is false.',
  },
  {
    name: 'gogAccordionContent',
    context: 'let-item',
    description: 'The panel body, rendered only for the currently mounted items.',
  },
];

@Component({
  selector: 'app-accordion-doc-page',
  imports: [
    AccordionComponent,
    ButtonComponent,
    GogAccordionChevronDirective,
    GogAccordionContentDirective,
    GogAccordionHeaderDirective,
    IconComponent,
    MarkdownComponent,
    CodeTabsComponent,
    RouterLink,
  ],
  templateUrl: './accordion-doc-page.html',
  styleUrl: './accordion-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionDocPage {
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];

  protected readonly basicItems: BasicItem[] = [
    { id: 'shipping', title: 'Shipping', body: 'Ships within 2 business days via standard courier.' },
    { id: 'returns', title: 'Returns', body: 'Free returns within 30 days of delivery.' },
    {
      id: 'warranty',
      title: 'Warranty (unavailable)',
      body: 'Not offered on this item.',
      disabled: true,
    },
  ];

  protected readonly sizeDemoItems: BasicItem[] = [
    { id: 'one', title: 'Sample section', body: 'Sample content for the size comparison.' },
  ];

  protected readonly multiItems: BasicItem[] = [
    { id: 'billing', title: 'Billing', body: 'Update your card or billing address.' },
    { id: 'notifications', title: 'Notifications', body: 'Choose which emails you receive.' },
    { id: 'security', title: 'Security', body: 'Manage two-factor authentication and active sessions.' },
  ];

  protected readonly statusItems: StatusItem[] = [
    {
      id: 'api',
      title: 'API',
      icon: 'success',
      subtitle: 'All endpoints responding normally',
      body: 'p99 latency is 118ms across all regions.',
    },
    {
      id: 'database',
      title: 'Database',
      icon: 'warning',
      subtitle: 'Replica lag above threshold',
      body: 'The eu-west read replica is 4.2s behind primary.',
    },
    {
      id: 'cache',
      title: 'Cache',
      icon: 'error',
      subtitle: 'Cluster unreachable',
      body: 'Connection to the cache cluster timed out.',
    },
  ];

  protected readonly apiInputs = API_INPUTS;
  protected readonly contentSlots = CONTENT_SLOTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'accordion')?.tokens ?? [];

  protected readonly lastToggled = signal('No item toggled yet.');
  protected readonly multi = signal(false);
  protected readonly isAccordionLoading = signal(false);
  protected readonly openIds = signal<ReadonlySet<string | number>>(new Set());

  protected readonly importSnippet =
    "```typescript\nimport { AccordionComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [AccordionComponent],\n})\n```";

  protected readonly overviewHtml = [
    '<gog-accordion [items]="items" [expandFirst]="true" (gogToggle)="onToggle($event)">',
    '  <ng-template gogAccordionContent let-item>',
    '    <p>{{ item.body }}</p>',
    '  </ng-template>',
    '</gog-accordion>',
  ].join('\n');
  protected readonly overviewTs = [
    "import { Component } from '@angular/core';",
    'import {',
    '  AccordionComponent,',
    '  GogAccordionContentDirective,',
    '  GogAccordionItem,',
    '  GogAccordionToggleEvent,',
    "} from '@guildofgleks/ui';",
    '',
    'interface BasicItem extends GogAccordionItem {',
    '  body: string;',
    '}',
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [AccordionComponent, GogAccordionContentDirective],',
    '  template: `',
    '    <gog-accordion [items]="items" [expandFirst]="true" (gogToggle)="onToggle($event)">',
    '      <ng-template gogAccordionContent let-item>',
    '        <p>{{ item.body }}</p>',
    '      </ng-template>',
    '    </gog-accordion>',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly items: BasicItem[] = [',
    "    { id: 'shipping', title: 'Shipping', body: 'Ships within 2 business days via standard courier.' },",
    "    { id: 'returns', title: 'Returns', body: 'Free returns within 30 days of delivery.' },",
    '  ];',
    '',
    '  protected onToggle(event: GogAccordionToggleEvent): void {',
    '    console.log(event.item.title, event.open);',
    '  }',
    '}',
  ].join('\n');

  protected readonly sizesHtml = [
    '<gog-accordion [items]="sizeDemoItems" [size]="sizeOption" [expandFirst]="true">',
    '  <ng-template gogAccordionContent let-item>',
    '    <p>{{ item.body }}</p>',
    '  </ng-template>',
    '</gog-accordion>',
  ].join('\n');
  protected readonly sizesTs = [
    "import { Component } from '@angular/core';",
    'import {',
    '  AccordionComponent,',
    '  GogAccordionContentDirective,',
    '  GogAccordionItem,',
    '  GogSize,',
    "} from '@guildofgleks/ui';",
    '',
    'interface BasicItem extends GogAccordionItem {',
    '  body: string;',
    '}',
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [AccordionComponent, GogAccordionContentDirective],',
    '  template: `',
    '    <gog-accordion [items]="sizeDemoItems" [size]="sizeOption" [expandFirst]="true">',
    '      <ng-template gogAccordionContent let-item>',
    '        <p>{{ item.body }}</p>',
    '      </ng-template>',
    '    </gog-accordion>',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly sizeDemoItems: BasicItem[] = [',
    "    { id: 'one', title: 'Sample section', body: 'Sample content for the size comparison.' },",
    '  ];',
    "  protected readonly sizeOption: GogSize = 'md';",
    '}',
  ].join('\n');

  protected readonly multiHtml = [
    '<gog-button (gogClick)="toggleMulti()">',
    "  Multi-open: {{ multi() ? 'on' : 'off' }}",
    '</gog-button>',
    '',
    '<gog-accordion [items]="multiItems" [multi]="multi()">',
    '  <ng-template gogAccordionContent let-item>',
    '    <p>{{ item.body }}</p>',
    '  </ng-template>',
    '</gog-accordion>',
  ].join('\n');
  protected readonly multiTs = [
    "import { Component, signal } from '@angular/core';",
    'import {',
    '  AccordionComponent,',
    '  ButtonComponent,',
    '  GogAccordionContentDirective,',
    '  GogAccordionItem,',
    "} from '@guildofgleks/ui';",
    '',
    'interface BasicItem extends GogAccordionItem {',
    '  body: string;',
    '}',
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [AccordionComponent, ButtonComponent, GogAccordionContentDirective],',
    '  template: `',
    '    <gog-button (gogClick)="toggleMulti()">',
    "      Multi-open: {{ multi() ? 'on' : 'off' }}",
    '    </gog-button>',
    '',
    '    <gog-accordion [items]="multiItems" [multi]="multi()">',
    '      <ng-template gogAccordionContent let-item>',
    '        <p>{{ item.body }}</p>',
    '      </ng-template>',
    '    </gog-accordion>',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly multi = signal(false);',
    '  protected readonly multiItems: BasicItem[] = [',
    "    { id: 'billing', title: 'Billing', body: 'Update your card or billing address.' },",
    "    { id: 'notifications', title: 'Notifications', body: 'Choose which emails you receive.' },",
    '  ];',
    '',
    '  protected toggleMulti(): void {',
    '    this.multi.update((current) => !current);',
    '  }',
    '}',
  ].join('\n');

  protected readonly disabledHtml = [
    '<gog-accordion [items]="items">',
    '  <!-- items[2].disabled === true -->',
    '  <ng-template gogAccordionContent let-item>',
    '    <p>{{ item.body }}</p>',
    '  </ng-template>',
    '</gog-accordion>',
  ].join('\n');
  protected readonly disabledTs = [
    "import { Component } from '@angular/core';",
    "import { AccordionComponent, GogAccordionContentDirective, GogAccordionItem } from '@guildofgleks/ui';",
    '',
    'interface BasicItem extends GogAccordionItem {',
    '  body: string;',
    '}',
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [AccordionComponent, GogAccordionContentDirective],',
    '  template: `',
    '    <gog-accordion [items]="items">',
    '      <ng-template gogAccordionContent let-item>',
    '        <p>{{ item.body }}</p>',
    '      </ng-template>',
    '    </gog-accordion>',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly items: BasicItem[] = [',
    "    { id: 'shipping', title: 'Shipping', body: 'Ships within 2 business days via standard courier.' },",
    "    { id: 'returns', title: 'Returns', body: 'Free returns within 30 days of delivery.' },",
    '    {',
    "      id: 'warranty',",
    "      title: 'Warranty (unavailable)',",
    "      body: 'Not offered on this item.',",
    '      disabled: true,',
    '    },',
    '  ];',
    '}',
  ].join('\n');

  protected readonly customHeaderHtml = [
    '<gog-accordion [items]="statusItems">',
    '  <ng-template gogAccordionHeader let-item let-open="open">',
    '    <gog-icon [name]="item.icon" />',
    '    <span>{{ item.title }}</span>',
    "    <span>{{ open ? 'Expanded' : item.subtitle }}</span>",
    '  </ng-template>',
    '',
    '  <ng-template gogAccordionChevron let-open="open">',
    "    <gog-icon [name]=\"open ? 'chevron-up' : 'chevron-down'\" />",
    '  </ng-template>',
    '',
    '  <ng-template gogAccordionContent let-item>',
    '    <p>{{ item.body }}</p>',
    '  </ng-template>',
    '</gog-accordion>',
  ].join('\n');
  protected readonly customHeaderTs = [
    "import { Component } from '@angular/core';",
    'import {',
    '  AccordionComponent,',
    '  GogAccordionChevronDirective,',
    '  GogAccordionContentDirective,',
    '  GogAccordionHeaderDirective,',
    '  GogAccordionItem,',
    '  GogIconName,',
    '  IconComponent,',
    "} from '@guildofgleks/ui';",
    '',
    'interface StatusItem extends GogAccordionItem {',
    '  icon: GogIconName;',
    '  subtitle: string;',
    '  body: string;',
    '}',
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [',
    '    AccordionComponent,',
    '    GogAccordionHeaderDirective,',
    '    GogAccordionChevronDirective,',
    '    GogAccordionContentDirective,',
    '    IconComponent,',
    '  ],',
    '  template: `',
    '    <gog-accordion [items]="statusItems">',
    '      <ng-template gogAccordionHeader let-item let-open="open">',
    '        <gog-icon [name]="item.icon" />',
    '        <span>{{ item.title }}</span>',
    "        <span>{{ open ? 'Expanded' : item.subtitle }}</span>",
    '      </ng-template>',
    '',
    '      <ng-template gogAccordionChevron let-open="open">',
    "        <gog-icon [name]=\"open ? 'chevron-up' : 'chevron-down'\" />",
    '      </ng-template>',
    '',
    '      <ng-template gogAccordionContent let-item>',
    '        <p>{{ item.body }}</p>',
    '      </ng-template>',
    '    </gog-accordion>',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly statusItems: StatusItem[] = [',
    '    {',
    "      id: 'api',",
    "      title: 'API',",
    "      icon: 'success',",
    "      subtitle: 'All endpoints responding normally',",
    "      body: 'p99 latency is 118ms across all regions.',",
    '    },',
    '    {',
    "      id: 'database',",
    "      title: 'Database',",
    "      icon: 'warning',",
    "      subtitle: 'Replica lag above threshold',",
    "      body: 'The eu-west read replica is 4.2s behind primary.',",
    '    },',
    '  ];',
    '}',
  ].join('\n');

  protected readonly headingLevelHtml = [
    '<gog-accordion [items]="items" [headingLevel]="3">',
    '  <ng-template gogAccordionContent let-item>',
    '    <p>{{ item.body }}</p>',
    '  </ng-template>',
    '</gog-accordion>',
  ].join('\n');
  protected readonly headingLevelTs = [
    "import { Component } from '@angular/core';",
    "import { AccordionComponent, GogAccordionContentDirective, GogAccordionItem } from '@guildofgleks/ui';",
    '',
    'interface BasicItem extends GogAccordionItem {',
    '  body: string;',
    '}',
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [AccordionComponent, GogAccordionContentDirective],',
    '  template: `',
    '    <gog-accordion [items]="items" [headingLevel]="3">',
    '      <ng-template gogAccordionContent let-item>',
    '        <p>{{ item.body }}</p>',
    '      </ng-template>',
    '    </gog-accordion>',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly items: BasicItem[] = [',
    "    { id: 'shipping', title: 'Shipping', body: 'Ships within 2 business days via standard courier.' },",
    "    { id: 'returns', title: 'Returns', body: 'Free returns within 30 days of delivery.' },",
    '  ];',
    '}',
  ].join('\n');

  protected readonly loadingHtml = [
    '<gog-button (gogClick)="toggleLoading()">Toggle loading</gog-button>',
    '',
    '<gog-accordion [items]="items" [loading]="isAccordionLoading()" />',
  ].join('\n');
  protected readonly loadingTs = [
    "import { Component, signal } from '@angular/core';",
    "import { AccordionComponent, ButtonComponent, GogAccordionItem } from '@guildofgleks/ui';",
    '',
    'interface BasicItem extends GogAccordionItem {',
    '  body: string;',
    '}',
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [AccordionComponent, ButtonComponent],',
    '  template: `',
    '    <gog-button (gogClick)="toggleLoading()">Toggle loading</gog-button>',
    '',
    '    <gog-accordion [items]="items" [loading]="isAccordionLoading()" />',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly isAccordionLoading = signal(false);',
    '  protected readonly items: BasicItem[] = [',
    "    { id: 'shipping', title: 'Shipping', body: 'Ships within 2 business days via standard courier.' },",
    "    { id: 'returns', title: 'Returns', body: 'Free returns within 30 days of delivery.' },",
    '  ];',
    '',
    '  protected toggleLoading(): void {',
    '    this.isAccordionLoading.update((current) => !current);',
    '  }',
    '}',
  ].join('\n');

  protected readonly controlledHtml = [
    '<gog-button (gogClick)="expandAll()">Expand all</gog-button>',
    '<gog-button (gogClick)="collapseAll()">Collapse all</gog-button>',
    '',
    '<gog-accordion [items]="multiItems" [multi]="true" [(openIds)]="openIds">',
    '  <ng-template gogAccordionContent let-item>',
    '    <p>{{ item.body }}</p>',
    '  </ng-template>',
    '</gog-accordion>',
  ].join('\n');
  protected readonly controlledTs = [
    "import { Component, signal } from '@angular/core';",
    'import {',
    '  AccordionComponent,',
    '  ButtonComponent,',
    '  GogAccordionContentDirective,',
    '  GogAccordionItem,',
    "} from '@guildofgleks/ui';",
    '',
    'interface BasicItem extends GogAccordionItem {',
    '  body: string;',
    '}',
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [AccordionComponent, ButtonComponent, GogAccordionContentDirective],',
    '  template: `',
    '    <gog-button (gogClick)="expandAll()">Expand all</gog-button>',
    '    <gog-button (gogClick)="collapseAll()">Collapse all</gog-button>',
    '',
    '    <gog-accordion [items]="multiItems" [multi]="true" [(openIds)]="openIds">',
    '      <ng-template gogAccordionContent let-item>',
    '        <p>{{ item.body }}</p>',
    '      </ng-template>',
    '    </gog-accordion>',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly multiItems: BasicItem[] = [',
    "    { id: 'billing', title: 'Billing', body: 'Update your card or billing address.' },",
    "    { id: 'notifications', title: 'Notifications', body: 'Choose which emails you receive.' },",
    '  ];',
    '  protected readonly openIds = signal<ReadonlySet<string | number>>(new Set());',
    '',
    '  protected expandAll(): void {',
    '    this.openIds.set(new Set(this.multiItems.map((item) => item.id)));',
    '  }',
    '',
    '  protected collapseAll(): void {',
    '    this.openIds.set(new Set());',
    '  }',
    '}',
  ].join('\n');

  protected onToggle(event: GogAccordionToggleEvent): void {
    this.lastToggled.set(`"${event.item.title}" ${event.open ? 'opened' : 'closed'}`);
  }

  protected toggleMulti(): void {
    this.multi.update((current) => !current);
  }

  protected toggleLoading(): void {
    this.isAccordionLoading.update((current) => !current);
  }

  protected expandAll(): void {
    this.openIds.set(new Set(this.multiItems.map((item) => item.id)));
  }

  protected collapseAll(): void {
    this.openIds.set(new Set());
  }
}
