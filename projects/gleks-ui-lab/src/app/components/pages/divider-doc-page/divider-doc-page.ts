import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiTableComponent, type ApiRow } from '../../shared/api-table/api-table';
import { DemoComponent } from '../../shared/demo/demo';
import { GlobalConfigNote } from '../../shared/global-config-note/global-config-note';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';
import { DIVIDER_EXAMPLES } from '../../../examples/divider/sources.generated';
import { DividerInsetExample } from '../../../examples/divider/divider-inset/example';
import { DividerLabelsExample } from '../../../examples/divider/divider-labels/example';
import { DividerOverviewExample } from '../../../examples/divider/divider-overview/example';
import { DividerTokensExample } from '../../../examples/divider/divider-tokens/example';
import { DividerVariantsExample } from '../../../examples/divider/divider-variants/example';
import { DividerVerticalExample } from '../../../examples/divider/divider-vertical/example';

const API_INPUTS: readonly ApiRow[] = [
  {
    name: 'orientation',
    type: "'horizontal' | 'vertical'",
    default: "'horizontal'",
    description:
      'Which way the rule runs. A vertical divider takes its length from --gog-divider-vertical-length unless its container stretches it.',
  },
  {
    name: 'variant',
    type: "'solid' | 'dashed' | 'dotted'",
    default: "'solid'",
    description: 'How the line is painted.',
  },
  {
    name: 'inset',
    type: 'boolean',
    default: 'false',
    description:
      'Indents the rule from the leading edge by --gog-divider-inset-size, so it lines up with the text of a list whose rows start with an icon or avatar instead of cutting across the whole row.',
  },
];

@Component({
  selector: 'app-divider-doc-page',
  imports: [
    ApiTableComponent,
    DemoComponent,
    GlobalConfigNote,
    MarkdownComponent,
    RouterLink,
    SinceBadgeComponent,
  ],
  templateUrl: './divider-doc-page.html',
  styleUrl: './divider-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DividerDocPage {
  protected readonly apiInputs = API_INPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'divider')?.tokens ?? [];

  protected readonly sources = DIVIDER_EXAMPLES;
  protected readonly examples = {
    overview: DividerOverviewExample,
    variants: DividerVariantsExample,
    labels: DividerLabelsExample,
    vertical: DividerVerticalExample,
    inset: DividerInsetExample,
    tokens: DividerTokensExample,
  };

  protected readonly importSnippet =
    "```typescript\nimport { DividerComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [DividerComponent],\n})\n```";
}
