import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiTableComponent, type ApiRow } from '../../shared/api-table/api-table';
import { DemoComponent } from '../../shared/demo/demo';
import { GlobalConfigNote } from '../../shared/global-config-note/global-config-note';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';
import { EMPTY_STATE_EXAMPLES } from '../../../examples/empty-state/sources.generated';
import { EmptyStateOverviewExample } from '../../../examples/empty-state/empty-state-overview/example';
import { EmptyStateSizesExample } from '../../../examples/empty-state/empty-state-sizes/example';
import { EmptyStateMediaExample } from '../../../examples/empty-state/empty-state-media/example';
import { EmptyStateSearchExample } from '../../../examples/empty-state/empty-state-search/example';
import { EmptyStateLastItemExample } from '../../../examples/empty-state/empty-state-last-item/example';

const EMPTY_STATE_INPUTS: readonly ApiRow[] = [
  {
    name: 'heading',
    type: 'string',
    default: "''",
    description: 'The title.',
  },
  {
    name: 'headingLevel',
    type: 'GogEmptyStateHeadingLevel | null',
    default: 'null',
    description: '2 to 6 makes the title a real heading at that level; unset, it is styled text.',
  },
  {
    name: 'iconName',
    type: 'GogIconName | null',
    default: 'null',
    description: 'Drawn above the title, decorative. A projected gogEmptyStateMedia replaces it.',
  },
  {
    name: 'live',
    type: "'polite' | 'off'",
    default: "'polite'",
    description: "'off' for an empty state the page loads with.",
  },
  {
    name: 'size',
    type: 'GogSize',
    default: "'md'",
    description: "'xsm' | 'sm' | 'md' | 'lg' | 'slg'.",
  },
];

const EMPTY_STATE_SLOTS: readonly ApiRow[] = [
  {
    name: '(default)',
    type: 'content',
    description: 'The description, under the title. Announced with it.',
  },
  {
    name: '[gogEmptyStateMedia]',
    type: 'an <svg> or <img>',
    description: 'An illustration in place of the icon; aria-hidden.',
  },
  {
    name: '[gogEmptyStateActions]',
    type: 'a <div> of buttons',
    description: 'The actions row under the description. Never announced.',
  },
];

@Component({
  selector: 'app-empty-state-doc-page',
  imports: [
    ApiTableComponent,
    DemoComponent,
    GlobalConfigNote,
    MarkdownComponent,
    RouterLink,
    SinceBadgeComponent,
  ],
  templateUrl: './empty-state-doc-page.html',
  styleUrl: './empty-state-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateDocPage {
  protected readonly emptyStateInputs = EMPTY_STATE_INPUTS;
  protected readonly emptyStateSlots = EMPTY_STATE_SLOTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'empty-state')?.tokens ?? [];

  protected readonly sources = EMPTY_STATE_EXAMPLES;
  protected readonly examples = {
    overview: EmptyStateOverviewExample,
    sizes: EmptyStateSizesExample,
    media: EmptyStateMediaExample,
    search: EmptyStateSearchExample,
    lastItem: EmptyStateLastItemExample,
  };

  protected readonly importSnippet = [
    '```typescript',
    "import {\n  EmptyStateComponent,\n  GogEmptyStateActionsDirective,\n  GogEmptyStateMediaDirective,\n} from '@guildofgleks/ui';",
    '',
    '@Component({',
    '  // ...',
    '  imports: [EmptyStateComponent, GogEmptyStateActionsDirective, GogEmptyStateMediaDirective],',
    '})',
    '```',
  ].join('\n');
}
