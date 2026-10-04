import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiTableComponent, type ApiRow } from '../../shared/api-table/api-table';
import { DemoComponent } from '../../shared/demo/demo';
import { GlobalConfigNote } from '../../shared/global-config-note/global-config-note';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';
import { PROGRESSBAR_EXAMPLES } from '../../../examples/progressbar/sources.generated';
import { ProgressbarClampExample } from '../../../examples/progressbar/progressbar-clamp/example';
import { ProgressbarEdgeExample } from '../../../examples/progressbar/progressbar-edge/example';
import { ProgressbarNamingExample } from '../../../examples/progressbar/progressbar-naming/example';
import { ProgressbarOverviewExample } from '../../../examples/progressbar/progressbar-overview/example';
import { ProgressbarShowValueExample } from '../../../examples/progressbar/progressbar-show-value/example';
import { ProgressbarSizesExample } from '../../../examples/progressbar/progressbar-sizes/example';
import { ProgressbarVariantsExample } from '../../../examples/progressbar/progressbar-variants/example';

const API_INPUTS: readonly ApiRow[] = [
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
  imports: [
    ApiTableComponent,
    DemoComponent,
    GlobalConfigNote,
    MarkdownComponent,
    RouterLink,
    SinceBadgeComponent,
  ],
  templateUrl: './progressbar-doc-page.html',
  styleUrl: './progressbar-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressbarDocPage {
  protected readonly apiInputs = API_INPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'progressbar')?.tokens ?? [];

  protected readonly sources = PROGRESSBAR_EXAMPLES;
  protected readonly examples = {
    overview: ProgressbarOverviewExample,
    sizes: ProgressbarSizesExample,
    variants: ProgressbarVariantsExample,
    showValue: ProgressbarShowValueExample,
    clamp: ProgressbarClampExample,
    edge: ProgressbarEdgeExample,
    naming: ProgressbarNamingExample,
  };

  protected readonly importSnippet =
    "```typescript\nimport { ProgressbarComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [ProgressbarComponent],\n})\n```";
}
