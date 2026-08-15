import { ChangeDetectionStrategy, Component, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GogSize, GogSkeletonAnimation } from '@guildofgleks/ui';
import { ExampleHostComponent } from '../../shared/example-host/example-host';
import { provideExampleSources } from '../../shared/example-sources';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';

import { SKELETON_EXAMPLE_SOURCES } from '../../../examples/skeleton/sources.generated';
import { SkeletonAnimationsExample } from '../../../examples/skeleton/skeleton-animations.example';
import { SkeletonChatExample } from '../../../examples/skeleton/skeleton-chat.example';
import { SkeletonDimensionsExample } from '../../../examples/skeleton/skeleton-dimensions.example';
import { SkeletonLinesExample } from '../../../examples/skeleton/skeleton-lines.example';
import { SkeletonOverviewExample } from '../../../examples/skeleton/skeleton-overview.example';
import { SkeletonProductsExample } from '../../../examples/skeleton/skeleton-products.example';
import { SkeletonProfileExample } from '../../../examples/skeleton/skeleton-profile.example';
import { SkeletonShapesExample } from '../../../examples/skeleton/skeleton-shapes.example';
import { SkeletonSizesExample } from '../../../examples/skeleton/skeleton-sizes.example';

interface ApiInputRow {
  readonly name: string;
  readonly type: string;
  readonly default: string;
  readonly description: string;
}

const API_INPUTS: readonly ApiInputRow[] = [
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

interface Product {
  readonly name: string;
  readonly price: string;
  readonly color: string;
}

const PRODUCTS: readonly Product[] = [
  { name: 'Aurora Desk Lamp', price: '$68', color: '#d4b483' },
  { name: 'Trailblazer Jacket', price: '$142', color: '#7f9c96' },
  { name: 'Nimbus Wireless Buds', price: '$89', color: '#8f8bd6' },
  { name: 'Fieldnotes Journal', price: '$24', color: '#c97b63' },
];

interface ChatMessage {
  readonly fromMe: boolean;
  readonly width: string;
  readonly text: string;
}

const CHAT_MESSAGES: readonly ChatMessage[] = [
  { fromMe: false, width: '55%', text: 'Hey! Did you see the new release notes?' },
  { fromMe: true, width: '38%', text: 'Just opened them now.' },
  { fromMe: false, width: '68%', text: 'The multiselect keyboard nav fix is finally in 🎉' },
  { fromMe: false, width: '32%', text: 'About time.' },
  { fromMe: true, width: '50%', text: "I'll update the doc pages this week." },
];

@Component({
  selector: 'app-skeleton-doc-page',
  imports: [ExampleHostComponent, MarkdownComponent, RouterLink],
  providers: [provideExampleSources(SKELETON_EXAMPLE_SOURCES)],
  templateUrl: './skeleton-doc-page.html',
  styleUrl: './skeleton-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonDocPage implements OnDestroy {
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
  protected readonly animations: GogSkeletonAnimation[] = ['pulse', 'wave', 'none'];

  protected readonly apiInputs = API_INPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'skeleton')?.tokens ?? [];

  protected readonly products = PRODUCTS;
  protected readonly chatMessages = CHAT_MESSAGES;

  protected readonly profileLoading = signal(false);
  protected readonly productsLoading = signal(true);
  protected readonly chatLoading = signal(true);
  private profileTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly importSnippet =
    "```typescript\nimport { } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [SkeletonComponent],\n})\n```";

  protected reloadProfile(): void {
    if (this.profileTimer) {
      clearTimeout(this.profileTimer);
    }

    this.profileLoading.set(true);
    this.profileTimer = setTimeout(() => {
      this.profileLoading.set(false);
      this.profileTimer = null;
    }, 1800);
  }

  protected toggleProductsLoading(): void {
    this.productsLoading.update((loading) => !loading);
  }

  protected toggleChatLoading(): void {
    this.chatLoading.update((loading) => !loading);
  }

  ngOnDestroy(): void {
    if (this.profileTimer) {
      clearTimeout(this.profileTimer);
    }
  }
  /** Each example is a file under `src/app/examples/skeleton/` — see docs/lab-examples-refactor.md. */
  protected readonly examples = {
    animations: SkeletonAnimationsExample,
    chat: SkeletonChatExample,
    dimensions: SkeletonDimensionsExample,
    lines: SkeletonLinesExample,
    overview: SkeletonOverviewExample,
    products: SkeletonProductsExample,
    profile: SkeletonProfileExample,
    shapes: SkeletonShapesExample,
    sizes: SkeletonSizesExample,
  };
}
