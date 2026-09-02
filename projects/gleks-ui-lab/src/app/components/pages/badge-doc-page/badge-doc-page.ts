import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ButtonComponent,
  GogBadgeDirective,
  GogBadgePosition,
  GogTagVariant,
  IconComponent,
} from '@guildofgleks/ui';
import { CodeTabsComponent } from '../../shared/code-tabs/code-tabs';
import { GlobalConfigNote } from '../../shared/global-config-note/global-config-note';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';

interface ApiInputRow {
  readonly name: string;
  readonly type: string;
  readonly default: string;
  readonly description: string;
}

const API_INPUTS: readonly ApiInputRow[] = [
  {
    name: 'gogBadge',
    type: 'string | number | null',
    default: 'null',
    description:
      'The badge content. Numbers above badgeMax render as "N+". Non-numeric content ("NEW", "beta") passes through untouched.',
  },
  {
    name: 'badgePosition',
    type: "'top-end' | 'top-start' | 'bottom-end' | 'bottom-start'",
    default: "'top-end'",
    description:
      'Which corner of the host the badge sits on. Named by block/inline edge rather than left/right, so it follows the writing direction in an RTL layout.',
  },
  {
    name: 'badgeVariant',
    type: "'success' | 'danger' | 'warning' | 'info'",
    default: "'danger'",
    description: 'Semantic color — the same four names gog-tag takes.',
  },
  {
    name: 'badgeDot',
    type: 'boolean',
    default: 'false',
    description:
      'Renders a bare dot with no text: "something changed here", with no count to give. A dot shows even when there is no value.',
  },
  {
    name: 'badgeMax',
    type: 'number',
    default: '99',
    description: 'Counts above this render as "N+" rather than growing without limit.',
  },
  {
    name: 'badgeHidden',
    type: 'boolean',
    default: 'false',
    description: 'Keeps the badge out of the DOM without removing the directive.',
  },
  {
    name: 'badgeAriaLabel',
    type: 'string',
    default: "''",
    description:
      'What assistive tech hears instead of the bare number. Set it and the visible badge becomes aria-hidden while this wording is announced in its place.',
  },
];

@Component({
  selector: 'app-badge-doc-page',
  imports: [
    GogBadgeDirective,
    ButtonComponent,
    IconComponent,
    GlobalConfigNote,
    MarkdownComponent,
    CodeTabsComponent,
    RouterLink,
  ],
  templateUrl: './badge-doc-page.html',
  styleUrl: './badge-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeDocPage {
  protected readonly positions: GogBadgePosition[] = [
    'top-end',
    'top-start',
    'bottom-end',
    'bottom-start',
  ];
  protected readonly variants: GogTagVariant[] = ['success', 'danger', 'warning', 'info'];

  protected readonly unread = signal(3);

  protected addOne(): void {
    this.unread.update((count) => count + 1);
  }

  protected removeOne(): void {
    this.unread.update((count) => Math.max(0, count - 1));
  }

  protected readonly apiInputs = API_INPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'badge')?.tokens ?? [];

  protected readonly importSnippet =
    "```typescript\nimport { GogBadgeDirective } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [GogBadgeDirective],\n})\n```";

  protected readonly overviewHtml =
    '<gog-button gogBadge="12" badgeAriaLabel="12 unread messages">Inbox</gog-button>';
  protected readonly overviewTs = [
    "import { Component } from '@angular/core';",
    "import { ButtonComponent, GogBadgeDirective } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ButtonComponent, GogBadgeDirective],',
    '  template: `',
    '    <gog-button gogBadge="12" badgeAriaLabel="12 unread messages">Inbox</gog-button>',
    '  `,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');

  protected readonly variantsHtml = [
    '<gog-button gogBadge="7" badgeVariant="success">Passed</gog-button>',
    '<gog-button gogBadge="7" badgeVariant="danger">Failed</gog-button>',
    '<gog-button gogBadge="7" badgeVariant="warning">Flaky</gog-button>',
    '<gog-button gogBadge="7" badgeVariant="info">Skipped</gog-button>',
  ].join('\n');
  protected readonly variantsTs = [
    "import { Component } from '@angular/core';",
    "import { ButtonComponent, GogBadgeDirective, GogTagVariant } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ButtonComponent, GogBadgeDirective],',
    '  template: `',
    '    @for (variantOption of variants; track variantOption) {',
    '      <gog-button gogBadge="7" [badgeVariant]="variantOption">{{ variantOption }}</gog-button>',
    '    }',
    '  `,',
    '})',
    'export class ExampleComponent {',
    "  protected readonly variants: GogTagVariant[] = ['success', 'danger', 'warning', 'info'];",
    '}',
  ].join('\n');

  protected readonly positionsHtml = [
    '<gog-button gogBadge="4" badgePosition="top-end">top-end</gog-button>',
    '<gog-button gogBadge="4" badgePosition="top-start">top-start</gog-button>',
    '<gog-button gogBadge="4" badgePosition="bottom-end">bottom-end</gog-button>',
    '<gog-button gogBadge="4" badgePosition="bottom-start">bottom-start</gog-button>',
  ].join('\n');
  protected readonly positionsTs = [
    "import { Component } from '@angular/core';",
    "import { ButtonComponent, GogBadgeDirective, GogBadgePosition } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ButtonComponent, GogBadgeDirective],',
    '  template: `',
    '    @for (position of positions; track position) {',
    '      <gog-button gogBadge="4" [badgePosition]="position">{{ position }}</gog-button>',
    '    }',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly positions: GogBadgePosition[] = [',
    "    'top-end',",
    "    'top-start',",
    "    'bottom-end',",
    "    'bottom-start',",
    '  ];',
    '}',
  ].join('\n');

  protected readonly dotHtml = [
    '<!-- A dot says "something changed here" with no count to give. -->',
    '<gog-icon name="info" gogBadge badgeDot badgeAriaLabel="Unread updates" />',
    '',
    '<gog-button gogBadge badgeDot badgeVariant="success">Synced</gog-button>',
  ].join('\n');
  protected readonly dotTs = [
    "import { Component } from '@angular/core';",
    "import { ButtonComponent, GogBadgeDirective, IconComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ButtonComponent, IconComponent, GogBadgeDirective],',
    '  template: `',
    '    <gog-icon name="info" gogBadge badgeDot badgeAriaLabel="Unread updates" />',
    '    <gog-button gogBadge badgeDot badgeVariant="success">Synced</gog-button>',
    '  `,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');

  protected readonly zeroHtml = [
    '<!-- 0 renders nothing at all — a badge reading "0" is not reachable. -->',
    '<gog-button [gogBadge]="0">Zero</gog-button>',
    '<gog-button [gogBadge]="5">Five</gog-button>',
    '',
    '<!-- 128 with the default badgeMax of 99. -->',
    '<gog-button [gogBadge]="128">Capped</gog-button>',
    '',
    '<!-- badgeHidden takes it out of the DOM without removing the directive. -->',
    '<gog-button [gogBadge]="5" [badgeHidden]="true">Hidden</gog-button>',
  ].join('\n');
  protected readonly zeroTs = [
    "import { Component, signal } from '@angular/core';",
    "import { ButtonComponent, GogBadgeDirective } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ButtonComponent, GogBadgeDirective],',
    '  template: `',
    '    <gog-button [gogBadge]="count">Inbox</gog-button>',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  // Nothing renders while this is 0 — no @if needed at the call site.',
    '  protected readonly count = signal(0);',
    '}',
  ].join('\n');
}
