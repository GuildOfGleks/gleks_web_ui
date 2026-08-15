import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GogDividerVariant } from '@guildofgleks/ui';
import { ExampleHostComponent } from '../../shared/example-host/example-host';
import { provideExampleSources } from '../../shared/example-sources';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';

import { DIVIDER_EXAMPLE_SOURCES } from '../../../examples/divider/sources.generated';
import { DividerInsetExample } from '../../../examples/divider/divider-inset/example';
import { DividerLabelExample } from '../../../examples/divider/divider-label/example';
import { DividerOverviewExample } from '../../../examples/divider/divider-overview/example';
import { DividerVariantsExample } from '../../../examples/divider/divider-variants/example';
import { DividerVerticalExample } from '../../../examples/divider/divider-vertical/example';

interface ApiInputRow {
  readonly name: string;
  readonly type: string;
  readonly default: string;
  readonly description: string;
}

const API_INPUTS: readonly ApiInputRow[] = [
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
  imports: [ExampleHostComponent, MarkdownComponent, RouterLink],
  providers: [provideExampleSources(DIVIDER_EXAMPLE_SOURCES)],
  templateUrl: './divider-doc-page.html',
  styleUrl: './divider-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DividerDocPage {
  protected readonly variants: GogDividerVariant[] = ['solid', 'dashed', 'dotted'];

  protected readonly apiInputs = API_INPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'divider')?.tokens ?? [];

  protected readonly importSnippet =
    "```typescript\nimport { DividerComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [DividerComponent],\n})\n```";

  /** Each example is a file under `src/app/examples/divider/` — see docs/lab-examples-refactor.md. */
  protected readonly examples = {
    inset: DividerInsetExample,
    label: DividerLabelExample,
    overview: DividerOverviewExample,
    variants: DividerVariantsExample,
    vertical: DividerVerticalExample,
  };
}
