import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ExampleHostComponent } from '../../shared/example-host/example-host';
import { provideExampleSources } from '../../shared/example-sources';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';

import { SCROLL_EXAMPLE_SOURCES } from '../../../examples/scroll/sources.generated';
import { ScrollAxisExample } from '../../../examples/scroll/scroll-axis/example';
import { ScrollConfigExample } from '../../../examples/scroll/scroll-config/example';
import { ScrollMethodsExample } from '../../../examples/scroll/scroll-methods/example';
import { ScrollOverviewExample } from '../../../examples/scroll/scroll-overview/example';
import { ScrollReachExample } from '../../../examples/scroll/scroll-reach/example';
import { ScrollSizeAutoHideExample } from '../../../examples/scroll/scroll-size-auto-hide/example';

interface ApiRow {
  readonly name: string;
  readonly type: string;
  readonly default: string;
  readonly description: string;
  readonly since?: string;
}

const API_INPUTS: readonly ApiRow[] = [
  {
    name: 'axis',
    type: "'vertical' | 'horizontal' | 'both'",
    default: "'vertical'",
    description:
      'Which axes get an overlay thumb. Native scrolling on the other axis is unaffected.',
  },
  {
    name: 'size',
    type: "'normal' | 'thin' | undefined",
    default: 'undefined',
    description: "Unset, falls back to GOG_CONFIG.scroll.size, then to 'normal'.",
  },
  {
    name: 'autoHide',
    type: 'boolean | undefined',
    default: 'undefined',
    description:
      'Fades the thumb out after hideDelay ms of inactivity; false keeps it always visible. Unset, falls back to GOG_CONFIG.scroll.autoHide, then to true.',
  },
  {
    name: 'hideDelay',
    type: 'number | undefined',
    default: 'undefined',
    description: 'Unset, falls back to GOG_CONFIG.scroll.hideDelay, then to 800.',
  },
  {
    name: 'reachThreshold',
    type: 'number',
    default: '0',
    description:
      'Pixel distance from an edge that still counts as "reached" for gogReachStart/gogReachEnd.',
  },
  {
    name: 'focusable',
    type: 'boolean',
    default: 'true',
    description:
      'Renders the viewport as its own tab stop (tabindex="0", role="region"). Turn off when nesting inside a component that already owns focus/keyboard handling.',
  },
  {
    name: 'ariaLabel',
    type: 'string',
    default: "''",
    description:
      'Accessible name for the viewport when focusable is true and there is no visible label.',
  },
  {
    name: 'showTrack',
    type: 'boolean | undefined',
    default: 'undefined',
    description:
      'Whether the overlay thumb and track render at all. Scrolling itself is unaffected either way — this is purely the visual affordance. Unset, falls back to GOG_CONFIG.scroll.showTrack, then to true.',
    since: '21.3.1',
  },
  {
    name: 'overscrollBehavior',
    type: "'auto' | 'contain' | 'none' | undefined",
    default: 'undefined',
    description:
      "What happens when a scroll gesture reaches this instance's edge. Unset, falls back to GOG_CONFIG.scroll.overscrollBehavior, then to 'auto' — chains to the next scrollable ancestor.",
  },
];

const API_OUTPUTS: readonly { name: string; payload: string; description: string }[] = [
  {
    name: 'gogScroll',
    payload: 'GogScrollMetrics',
    description:
      'Emits scrollTop/scrollLeft/scrollHeight/scrollWidth/clientHeight/clientWidth on every scroll/resize.',
  },
  {
    name: 'gogReachStart',
    payload: "'vertical' | 'horizontal'",
    description: 'Fires once when that axis crosses back within reachThreshold of its start edge.',
  },
  {
    name: 'gogReachEnd',
    payload: "'vertical' | 'horizontal'",
    description: 'Fires once when that axis crosses within reachThreshold of its end edge.',
  },
];

const API_METHODS: readonly { name: string; description: string }[] = [
  {
    name: 'scrollTo(options: ScrollToOptions)',
    description: "Forwards to the viewport's native Element.scrollTo.",
  },
  { name: "scrollToTop(behavior = 'smooth')", description: 'Scrolls to the top.' },
  { name: "scrollToBottom(behavior = 'smooth')", description: 'Scrolls to the bottom.' },
  { name: "scrollToLeft(behavior = 'smooth')", description: 'Scrolls to the left edge.' },
  { name: "scrollToRight(behavior = 'smooth')", description: 'Scrolls to the right edge.' },
];

@Component({
  selector: 'app-scroll-doc-page',
  imports: [ExampleHostComponent, MarkdownComponent, RouterLink, SinceBadgeComponent],
  providers: [provideExampleSources(SCROLL_EXAMPLE_SOURCES)],
  templateUrl: './scroll-doc-page.html',
  styleUrl: './scroll-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollDocPage {
  protected readonly apiInputs = API_INPUTS;
  protected readonly apiOutputs = API_OUTPUTS;
  protected readonly apiMethods = API_METHODS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'scroll')?.tokens ?? [];

  protected readonly importSnippet =
    "```typescript\nimport { ScrollComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [ScrollComponent],\n})\n```";

  /** Each example is a file under `src/app/examples/scroll/` — see docs/lab-examples-refactor.md. */
  protected readonly examples = {
    axis: ScrollAxisExample,
    methods: ScrollMethodsExample,
    config: ScrollConfigExample,
    overview: ScrollOverviewExample,
    reach: ScrollReachExample,
    sizeAutoHide: ScrollSizeAutoHideExample,
  };
}
