import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiTableComponent, type ApiRow } from '../../shared/api-table/api-table';
import { DemoComponent } from '../../shared/demo/demo';
import { GlobalConfigNote } from '../../shared/global-config-note/global-config-note';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';
import { CARD_EXAMPLES } from '../../../examples/card/sources.generated';
import { CardLinkExample } from '../../../examples/card/card-link/example';
import { CardMediaExample } from '../../../examples/card/card-media/example';
import { CardOverviewExample } from '../../../examples/card/card-overview/example';
import { CardSizesExample } from '../../../examples/card/card-sizes/example';
import { CardStatesExample } from '../../../examples/card/card-states/example';
import { CardThemingExample } from '../../../examples/card/card-theming/example';
import { CardVariantsExample } from '../../../examples/card/card-variants/example';

const API_INPUTS: readonly ApiRow[] = [
  {
    name: 'variant',
    type: 'GogSurfaceVariant',
    default: "'outlined'",
    description:
      "'outlined' | 'elevated' | 'filled'. Outlined is the default — a border and no shadow, which is what a grid of many wants.",
    since: '21.6.1',
  },
  {
    name: 'size',
    type: 'GogSize',
    default: "'md'",
    description: 'Drives padding and the gap between the card’s rows, on the five-tier scale.',
    since: '21.6.1',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Dims the card, sets aria-disabled, and takes the card link out of the tab order.',
    since: '21.6.1',
  },
  {
    name: 'loading',
    type: 'boolean',
    default: 'false',
    description:
      'Replaces the content with a title bar plus skeletonLines text lines and sets aria-busy. The first-paint treatment, not a refresh.',
    since: '21.6.1',
  },
  {
    name: 'skeletonLines',
    type: 'number',
    default: '2',
    description: 'How many body lines the loading placeholder draws.',
    since: '21.6.1',
  },
];

const API_SLOTS: readonly ApiRow[] = [
  {
    name: 'gogCardHeader',
    type: 'an element of yours',
    description:
      'Your own heading. The card takes its id (minting one if needed), points aria-labelledby at it, and announces as role="group". Without it the card gets neither.',
    since: '21.6.1',
  },
  {
    name: 'gogCardMedia',
    type: 'an element of yours',
    description:
      'Runs full-bleed to the card’s edges and rounds into its top corners. Rendered above the heading whatever order you write it in.',
    since: '21.6.1',
  },
  {
    name: 'gogCardFooter',
    type: 'an element of yours',
    description: 'Rendered last, below the body. Its controls keep their own clicks.',
    since: '21.6.1',
  },
  {
    name: 'gogCardLink',
    type: 'an element of yours',
    description:
      'On your own <a> or <button>: stretches that link’s hit area over the whole card. Ignored on any other element, deliberately.',
    since: '21.6.1',
  },
];

@Component({
  selector: 'app-card-doc-page',
  imports: [ApiTableComponent, DemoComponent, GlobalConfigNote, MarkdownComponent, RouterLink],
  templateUrl: './card-doc-page.html',
  styleUrl: './card-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardDocPage {
  protected readonly apiInputs = API_INPUTS;
  protected readonly apiSlots = API_SLOTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'card')?.tokens ?? [];

  protected readonly sources = CARD_EXAMPLES;
  protected readonly examples = {
    overview: CardOverviewExample,
    variants: CardVariantsExample,
    sizes: CardSizesExample,
    link: CardLinkExample,
    media: CardMediaExample,
    states: CardStatesExample,
    theming: CardThemingExample,
  };

  protected readonly importSnippet = [
    '```typescript',
    'import {',
    '  CardComponent,',
    '  GogCardFooterDirective,',
    '  GogCardHeaderDirective,',
    '  GogCardLinkDirective,',
    '  GogCardMediaDirective,',
    "} from '@guildofgleks/ui';",
    '',
    '@Component({',
    '  // ...',
    '  imports: [CardComponent, GogCardHeaderDirective],',
    '})',
    '```',
  ].join('\n');
}
