import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiTableComponent, type ApiRow } from '../../shared/api-table/api-table';
import { DemoComponent } from '../../shared/demo/demo';
import { GlobalConfigNote } from '../../shared/global-config-note/global-config-note';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';
import { SKELETON_EXAMPLES } from '../../../examples/skeleton/sources.generated';
import { SkeletonAnimationsExample } from '../../../examples/skeleton/skeleton-animations/example';
import { SkeletonComposedExample } from '../../../examples/skeleton/skeleton-composed/example';
import { SkeletonDimensionsExample } from '../../../examples/skeleton/skeleton-dimensions/example';
import { SkeletonLinesExample } from '../../../examples/skeleton/skeleton-lines/example';
import { SkeletonOverviewExample } from '../../../examples/skeleton/skeleton-overview/example';
import { SkeletonSizesExample } from '../../../examples/skeleton/skeleton-sizes/example';

const API_INPUTS: readonly ApiRow[] = [
  {
    name: 'shape',
    type: "'text' | 'circle' | 'rect'",
    default: "'text'",
    description: 'text for lines of copy, circle for avatars, rect for images or media blocks.',
  },
  {
    name: 'size',
    type: "'xsm' | 'sm' | 'md' | 'lg' | 'slg'",
    default: "'md'",
    description: 'Line thickness, circle diameter, and default rect height.',
  },
  {
    name: 'animation',
    type: "'pulse' | 'wave' | 'none'",
    default: "'pulse'",
    description:
      'pulse fades opacity, wave sweeps a shimmer highlight, none holds a static tone — useful under prefers-reduced-motion or when the surrounding UI is already busy.',
  },
  {
    name: 'width',
    type: 'string | null',
    default: 'null',
    description: "CSS width, e.g. '240px' or '60%'. Falls back to a shape/size default when unset.",
  },
  {
    name: 'height',
    type: 'string | null',
    default: 'null',
    description: 'CSS height override. Ignored for text, whose lines size from size instead.',
  },
  {
    name: 'lines',
    type: 'number',
    default: '1',
    description:
      'shape="text" only: number of stacked lines. Past one line, the last one renders shorter.',
  },
  {
    name: 'rounded',
    type: 'boolean',
    default: 'true',
    description:
      'Set false to square off the corners — handy for a banner image that bleeds to the edge.',
  },
  {
    name: 'ariaLabel',
    type: 'string | null',
    default: 'null',
    description:
      'Decorative (aria-hidden) by default, since a page can carry dozens of these while loading. Set on the one instance that should actually announce the loading state — it then gets role="status".',
  },
];

@Component({
  selector: 'app-skeleton-doc-page',
  imports: [ApiTableComponent, DemoComponent, GlobalConfigNote, MarkdownComponent, RouterLink],
  templateUrl: './skeleton-doc-page.html',
  styleUrl: './skeleton-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonDocPage {
  protected readonly apiInputs = API_INPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'skeleton')?.tokens ?? [];

  protected readonly sources = SKELETON_EXAMPLES;
  protected readonly examples = {
    overview: SkeletonOverviewExample,
    sizes: SkeletonSizesExample,
    animations: SkeletonAnimationsExample,
    lines: SkeletonLinesExample,
    dimensions: SkeletonDimensionsExample,
    composed: SkeletonComposedExample,
  };

  protected readonly importSnippet =
    "```typescript\nimport { SkeletonComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [SkeletonComponent],\n})\n```";
}
