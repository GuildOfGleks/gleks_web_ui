import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiTableComponent, type ApiRow } from '../../shared/api-table/api-table';
import { DemoComponent } from '../../shared/demo/demo';
import { GlobalConfigNote } from '../../shared/global-config-note/global-config-note';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';
import { RATING_EXAMPLES } from '../../../examples/rating/sources.generated';
import { RatingOverviewExample } from '../../../examples/rating/rating-overview/example';
import { RatingSizesExample } from '../../../examples/rating/rating-sizes/example';
import { RatingReadonlyExample } from '../../../examples/rating/rating-readonly/example';
import { RatingClearableExample } from '../../../examples/rating/rating-clearable/example';
import { RatingStatesExample } from '../../../examples/rating/rating-states/example';
import { RatingFormsExample } from '../../../examples/rating/rating-forms/example';

const RATING_INPUTS: readonly ApiRow[] = [
  {
    name: 'value',
    type: 'number | null (model)',
    default: 'null',
    description: 'The score, two-way; null is not rated. Also what an attached form control holds.',
  },
  {
    name: 'max',
    type: 'number',
    default: '5',
    description: 'How many stars.',
  },
  {
    name: 'readonly',
    type: 'boolean',
    default: 'false',
    description: 'A picture of the score rather than a control; the value may be fractional.',
  },
  {
    name: 'clearable',
    type: 'boolean',
    default: 'false',
    description: 'A press on the chosen star, or Space on it, clears the rating.',
  },
  {
    name: 'label',
    type: 'string',
    default: "''",
    description: 'The group’s name, shown above the stars.',
  },
  {
    name: 'ariaLabel',
    type: 'string',
    default: "''",
    description: 'Names the group when there is no label.',
  },
  {
    name: 'errorMessage',
    type: 'string',
    default: "''",
    description: '',
  },
  {
    name: 'errorDisplay',
    type: 'GogErrorDisplay | undefined',
    default: "'manual'",
    description: 'Unset, GOG_CONFIG.control.errorDisplay.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: '',
  },
  {
    name: 'size',
    type: 'GogSize | undefined',
    default: "'md'",
    description: 'Unset, GOG_CONFIG.control.size.',
  },
];

@Component({
  selector: 'app-rating-doc-page',
  imports: [
    ApiTableComponent,
    DemoComponent,
    GlobalConfigNote,
    MarkdownComponent,
    RouterLink,
    SinceBadgeComponent,
  ],
  templateUrl: './rating-doc-page.html',
  styleUrl: './rating-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingDocPage {
  protected readonly ratingInputs = RATING_INPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'rating')?.tokens ?? [];

  protected readonly sources = RATING_EXAMPLES;
  protected readonly examples = {
    overview: RatingOverviewExample,
    sizes: RatingSizesExample,
    readonly: RatingReadonlyExample,
    clearable: RatingClearableExample,
    states: RatingStatesExample,
    forms: RatingFormsExample,
  };

  protected readonly importSnippet = [
    '```typescript',
    "import { RatingComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    '  // ...',
    '  imports: [RatingComponent],',
    '})',
    '```',
  ].join('\n');
}
