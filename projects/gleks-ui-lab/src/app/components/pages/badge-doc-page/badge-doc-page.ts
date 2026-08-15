import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ButtonComponent,
  GogBadgeDirective,
  GogBadgePosition,
  GogTagVariant,
} from '@guildofgleks/ui';
import { ExampleHostComponent } from '../../shared/example-host/example-host';
import { provideExampleSources } from '../../shared/example-sources';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';

import { BADGE_EXAMPLE_SOURCES } from '../../../examples/badge/sources.generated';
import { BadgeDotExample } from '../../../examples/badge/badge-dot.example';
import { BadgeOverviewExample } from '../../../examples/badge/badge-overview.example';
import { BadgePositionsExample } from '../../../examples/badge/badge-positions.example';
import { BadgeVariantsExample } from '../../../examples/badge/badge-variants.example';
import { BadgeZeroExample } from '../../../examples/badge/badge-zero.example';

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
    ExampleHostComponent,
    GogBadgeDirective,
    ButtonComponent,
    MarkdownComponent,
    RouterLink,
  ],
  providers: [provideExampleSources(BADGE_EXAMPLE_SOURCES)],
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

  protected readonly apiInputs = API_INPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'badge')?.tokens ?? [];

  protected readonly importSnippet =
    "```typescript\nimport { GogBadgeDirective } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [GogBadgeDirective],\n})\n```";

  /** Each example is a file under `src/app/examples/badge/` — see docs/lab-examples-refactor.md. */
  protected readonly examples = {
    dot: BadgeDotExample,
    overview: BadgeOverviewExample,
    positions: BadgePositionsExample,
    variants: BadgeVariantsExample,
    zero: BadgeZeroExample,
  };
}
