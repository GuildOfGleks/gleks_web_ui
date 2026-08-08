import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  GogTabContentDirective,
  GogTabHeaderDirective,
  GogTabsAlign,
  TabComponent,
  TabsComponent,
  TagComponent,
} from '@guildofgleks/ui';
import { CodeTabsComponent } from '../../shared/code-tabs/code-tabs';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';

interface ApiRow {
  readonly name: string;
  readonly type: string;
  readonly default: string;
  readonly description: string;
}

const TABS_INPUTS: readonly ApiRow[] = [
  {
    name: 'activeIndex',
    type: 'number',
    default: '0',
    description: 'Index of the visible tab. Two-way bindable with [(activeIndex)].',
  },
  {
    name: 'align',
    type: "'start' | 'center' | 'end' | 'stretch'",
    default: "'start'",
    description:
      'How the headers distribute along the tablist. stretch makes them share the width.',
  },
  {
    name: 'orientation',
    type: "'horizontal' | 'vertical'",
    default: "'horizontal'",
    description: 'Which way the tablist runs.',
  },
  {
    name: 'size',
    type: "'xsm' | 'sm' | 'md' | 'lg' | 'slg'",
    default: "'md'",
    description: 'Header typography and padding.',
  },
  {
    name: 'fullWidth',
    type: 'boolean',
    default: 'false',
    description: 'Stretches the whole component to fill its container.',
  },
  {
    name: 'ariaLabel',
    type: 'string',
    default: "''",
    description: 'Accessible name for the tablist.',
  },
];

const TABS_OUTPUTS: readonly ApiRow[] = [
  {
    name: 'gogTabChange',
    type: 'number',
    default: '—',
    description: 'Emitted with the new index when the active tab changes.',
  },
  {
    name: 'activeIndexChange',
    type: 'number',
    default: '—',
    description: 'The activeIndex model’s change event, for [(activeIndex)].',
  },
];

const TAB_INPUTS: readonly ApiRow[] = [
  {
    name: 'label',
    type: 'string',
    default: "''",
    description:
      'Header text. A tab declares its own header, so it is defined in exactly one place.',
  },
  {
    name: 'iconName',
    type: 'GogIconName | null',
    default: 'null',
    description: 'Optional leading icon in the header.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Makes the tab unreachable by click and skipped by arrow navigation.',
  },
];

@Component({
  selector: 'app-tabs-doc-page',
  imports: [
    TabsComponent,
    TabComponent,
    GogTabContentDirective,
    GogTabHeaderDirective,
    TagComponent,
    MarkdownComponent,
    CodeTabsComponent,
    RouterLink,
  ],
  templateUrl: './tabs-doc-page.html',
  styleUrl: './tabs-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsDocPage {
  protected readonly alignments: GogTabsAlign[] = ['start', 'center', 'end', 'stretch'];

  protected readonly activeIndex = signal(0);
  protected readonly alignIndex = signal(0);

  protected readonly apiInputs = TABS_INPUTS;
  protected readonly apiOutputs = TABS_OUTPUTS;
  protected readonly tabInputs = TAB_INPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'tabs')?.tokens ?? [];

  protected readonly importSnippet =
    "```typescript\nimport { TabComponent, TabsComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [TabsComponent, TabComponent],\n})\n```";

  protected readonly overviewHtml = [
    '<gog-tabs ariaLabel="Account" [(activeIndex)]="activeIndex">',
    '  <gog-tab label="Profile">Profile content.</gog-tab>',
    '  <gog-tab label="Settings" iconName="info">Settings content.</gog-tab>',
    '  <gog-tab label="Billing" [disabled]="true">Not available.</gog-tab>',
    '</gog-tabs>',
  ].join('\n');
  protected readonly overviewTs = [
    "import { Component, signal } from '@angular/core';",
    "import { TabComponent, TabsComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [TabsComponent, TabComponent],',
    '  template: `',
    '    <gog-tabs ariaLabel="Account" [(activeIndex)]="activeIndex">',
    '      <gog-tab label="Profile">Profile content.</gog-tab>',
    '      <gog-tab label="Settings" iconName="info">Settings content.</gog-tab>',
    '      <gog-tab label="Billing" [disabled]="true">Not available.</gog-tab>',
    '    </gog-tabs>',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly activeIndex = signal(0);',
    '}',
  ].join('\n');

  protected readonly lazyHtml = [
    '<gog-tabs ariaLabel="Reports">',
    '  <!-- Eager: rendered up front, merely hidden while inactive. Scroll position and',
    '       half-typed input survive a switch. -->',
    '  <gog-tab label="Summary">',
    '    <input placeholder="Type here, switch away, come back" />',
    '  </gog-tab>',
    '',
    '  <!-- Lazy: built on first activation, kept alive after. -->',
    '  <gog-tab label="Expensive report">',
    '    <ng-template gogTabContent>',
    '      <app-expensive-report />',
    '    </ng-template>',
    '  </gog-tab>',
    '</gog-tabs>',
  ].join('\n');
  protected readonly lazyTs = [
    "import { Component } from '@angular/core';",
    "import { GogTabContentDirective, TabComponent, TabsComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [TabsComponent, TabComponent, GogTabContentDirective],',
    '  template: `',
    '    <gog-tabs ariaLabel="Reports">',
    '      <gog-tab label="Summary">',
    '        <input placeholder="Type here, switch away, come back" />',
    '      </gog-tab>',
    '      <gog-tab label="Expensive report">',
    '        <ng-template gogTabContent>',
    '          <app-expensive-report />',
    '        </ng-template>',
    '      </gog-tab>',
    '    </gog-tabs>',
    '  `,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');

  protected readonly alignHtml = [
    '<gog-tabs align="start">…</gog-tabs>',
    '<gog-tabs align="center">…</gog-tabs>',
    '<gog-tabs align="end">…</gog-tabs>',
    '<gog-tabs align="stretch">…</gog-tabs>',
  ].join('\n');
  protected readonly alignTs = [
    "import { Component } from '@angular/core';",
    "import { GogTabsAlign, TabComponent, TabsComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [TabsComponent, TabComponent],',
    '  template: `',
    '    @for (alignment of alignments; track alignment) {',
    '      <gog-tabs [align]="alignment">',
    '        <gog-tab label="One">…</gog-tab>',
    '        <gog-tab label="Two">…</gog-tab>',
    '      </gog-tabs>',
    '    }',
    '  `,',
    '})',
    'export class ExampleComponent {',
    "  protected readonly alignments: GogTabsAlign[] = ['start', 'center', 'end', 'stretch'];",
    '}',
  ].join('\n');

  protected readonly headerSlotHtml = [
    '<gog-tabs ariaLabel="Inbox">',
    '  <ng-template gogTabHeader let-tab let-active="active">',
    '    <span>{{ tab.label() }}</span>',
    '    @if (active) {',
    '      <gog-tag variant="info" size="xsm">now</gog-tag>',
    '    }',
    '  </ng-template>',
    '',
    '  <gog-tab label="Unread">…</gog-tab>',
    '  <gog-tab label="Archived">…</gog-tab>',
    '</gog-tabs>',
  ].join('\n');
  protected readonly headerSlotTs = [
    "import { Component } from '@angular/core';",
    'import {',
    '  GogTabHeaderDirective,',
    '  TabComponent,',
    '  TabsComponent,',
    '  TagComponent,',
    "} from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [TabsComponent, TabComponent, GogTabHeaderDirective, TagComponent],',
    '  template: `',
    '    <gog-tabs ariaLabel="Inbox">',
    '      <ng-template gogTabHeader let-tab let-active="active">',
    '        <span>{{ tab.label() }}</span>',
    '        @if (active) {',
    '          <gog-tag variant="info" size="xsm">now</gog-tag>',
    '        }',
    '      </ng-template>',
    '',
    '      <gog-tab label="Unread">…</gog-tab>',
    '      <gog-tab label="Archived">…</gog-tab>',
    '    </gog-tabs>',
    '  `,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');
}
