import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiTableComponent, type ApiRow } from '../../shared/api-table/api-table';
import { DemoComponent } from '../../shared/demo/demo';
import { GlobalConfigNote } from '../../shared/global-config-note/global-config-note';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';
import { BADGE_EXAMPLES } from '../../../examples/badge/sources.generated';
import { BadgeContentExample } from '../../../examples/badge/badge-content/example';
import { BadgeDotExample } from '../../../examples/badge/badge-dot/example';
import { BadgeHostsExample } from '../../../examples/badge/badge-hosts/example';
import { BadgeMaxExample } from '../../../examples/badge/badge-max/example';
import { BadgeOverviewExample } from '../../../examples/badge/badge-overview/example';
import { BadgePositionsExample } from '../../../examples/badge/badge-positions/example';
import { BadgeZeroExample } from '../../../examples/badge/badge-zero/example';

const API_INPUTS: readonly ApiRow[] = [
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
    ApiTableComponent,
    DemoComponent,
    GlobalConfigNote,
    MarkdownComponent,
    RouterLink,
    SinceBadgeComponent,
  ],
  templateUrl: './badge-doc-page.html',
  styleUrl: './badge-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeDocPage {
  protected readonly apiInputs = API_INPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'badge')?.tokens ?? [];

  protected readonly sources = BADGE_EXAMPLES;
  protected readonly examples = {
    overview: BadgeOverviewExample,
    content: BadgeContentExample,
    zero: BadgeZeroExample,
    positions: BadgePositionsExample,
    hosts: BadgeHostsExample,
    dot: BadgeDotExample,
    max: BadgeMaxExample,
  };

  protected readonly importSnippet =
    "```typescript\nimport { GogBadgeDirective } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [GogBadgeDirective],\n})\n```";
}
