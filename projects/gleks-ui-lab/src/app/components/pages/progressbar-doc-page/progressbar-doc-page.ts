import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GogProgressbarVariant, GogSize } from '@guildofgleks/ui';
import { ExampleHostComponent } from '../../shared/example-host/example-host';
import { provideExampleSources } from '../../shared/example-sources';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';

import { PROGRESSBAR_EXAMPLE_SOURCES } from '../../../examples/progressbar/sources.generated';
import { ProgressbarModesExample } from '../../../examples/progressbar/progressbar-modes/example';
import { ProgressbarOverviewExample } from '../../../examples/progressbar/progressbar-overview/example';
import { ProgressbarShowValueExample } from '../../../examples/progressbar/progressbar-show-value/example';
import { ProgressbarSizesExample } from '../../../examples/progressbar/progressbar-sizes/example';
import { ProgressbarVariantsExample } from '../../../examples/progressbar/progressbar-variants/example';

interface ApiInputRow {
  readonly name: string;
  readonly type: string;
  readonly default: string;
  readonly description: string;
}

const API_INPUTS: readonly ApiInputRow[] = [
  {
    name: 'value',
    type: 'number',
    default: '0',
    description:
      'Percentage complete, 0–100. Clamped rather than trusted — a bar driven from loaded / total overshoots on the last chunk often enough to be worth handling here. Ignored in indeterminate mode.',
  },
  {
    name: 'buffer',
    type: 'number',
    default: '0',
    description:
      'Secondary level shown behind value in buffer mode — preloaded but not yet played. Also clamped to 0–100.',
  },
  {
    name: 'mode',
    type: "'determinate' | 'indeterminate' | 'buffer'",
    default: "'determinate'",
    description:
      'determinate reflects value; indeterminate is work of unknown length; buffer adds a second, lighter level ahead of the fill.',
  },
  {
    name: 'variant',
    type: "'accent' | 'success' | 'danger' | 'warning' | 'info'",
    default: "'accent'",
    description:
      'Fill color. Wider than the tag palette by one: progress is usually just "the app is working", which is the accent color rather than any status hue.',
  },
  {
    name: 'size',
    type: "'xsm' | 'sm' | 'md' | 'lg' | 'slg'",
    default: "'md'",
    description: 'Bar thickness.',
  },
  {
    name: 'showValue',
    type: 'boolean',
    default: 'false',
    description:
      'Renders the rounded percentage next to the bar. Off by default — most bars sit under a label that already says what is happening.',
  },
  {
    name: 'ariaLabel',
    type: 'string',
    default: "''",
    description: 'Accessible name for the bar.',
  },
];

@Component({
  selector: 'app-progressbar-doc-page',
  imports: [ExampleHostComponent, MarkdownComponent, RouterLink],
  providers: [provideExampleSources(PROGRESSBAR_EXAMPLE_SOURCES)],
  templateUrl: './progressbar-doc-page.html',
  styleUrl: './progressbar-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressbarDocPage {
  protected readonly variants: GogProgressbarVariant[] = [
    'accent',
    'success',
    'danger',
    'warning',
    'info',
  ];
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];

  protected readonly apiInputs = API_INPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'progressbar')?.tokens ?? [];

  protected readonly importSnippet =
    "```typescript\nimport { } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [ProgressbarComponent],\n})\n```";

  /** Each example is a file under `src/app/examples/progressbar/` — see docs/lab-examples-refactor.md. */
  protected readonly examples = {
    modes: ProgressbarModesExample,
    overview: ProgressbarOverviewExample,
    showValue: ProgressbarShowValueExample,
    sizes: ProgressbarSizesExample,
    variants: ProgressbarVariantsExample,
  };
}
