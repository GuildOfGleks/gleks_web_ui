import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  GogTabContentDirective,
  GogTabHeaderDirective,
  GogTabsAlign,
  TabComponent,
  TabsComponent,
} from '@guildofgleks/ui';
import { ExampleHostComponent } from '../../shared/example-host/example-host';
import { provideExampleSources } from '../../shared/example-sources';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';

import { TABS_EXAMPLE_SOURCES } from '../../../examples/tabs/sources.generated';
import { TabsAlignExample } from '../../../examples/tabs/tabs-align.example';
import { TabsHeaderSlotExample } from '../../../examples/tabs/tabs-header-slot.example';
import { TabsLazyExample } from '../../../examples/tabs/tabs-lazy.example';
import { TabsOverviewExample } from '../../../examples/tabs/tabs-overview.example';

interface ApiRow {
  readonly name: string;
  readonly type: string;
  readonly default: string;
  readonly description: string;
  readonly since?: string;
}

const TABS_INPUTS: readonly ApiRow[] = [
  {
    name: 'scrollActiveIntoView',
    type: 'boolean',
    default: 'true',
    description:
      'With an overflowing header row, selecting a tab scrolls it into view — instantly on first render, smoothly afterwards (and instantly under prefers-reduced-motion).',
    since: '21.3.1',
  },
  {
    name: 'showScrollTrack',
    type: 'boolean | undefined',
    default: 'undefined',
    description:
      'Whether the header row shows a scrollbar track. Unset it follows scrollActiveIntoView: hidden while that is on (the scrolling is driven for you), shown once it is off, where the track is the only hint that there is more to reach.',
    since: '21.3.1',
  },
  {
    name: 'activeIndex',
    type: 'number',
    default: '0',
    description: 'Index of the visible tab. Two-way bindable with [(activeIndex)].',
  },
  {
    name: 'align',
    type: "'start' | 'center' | 'end' | 'stretch'",
    default: "'start'",
    description:
      'How the headers distribute along the tablist. stretch makes them share the width.',
  },
  {
    name: 'orientation',
    type: "'horizontal' | 'vertical'",
    default: "'horizontal'",
    description: 'Which way the tablist runs.',
  },
  {
    name: 'size',
    type: "'xsm' | 'sm' | 'md' | 'lg' | 'slg'",
    default: "'md'",
    description: 'Header typography and padding.',
  },
  {
    name: 'fullWidth',
    type: 'boolean',
    default: 'false',
    description: 'Stretches the whole component to fill its container.',
  },
  {
    name: 'ariaLabel',
    type: 'string',
    default: "''",
    description: 'Accessible name for the tablist.',
  },
];

const TABS_OUTPUTS: readonly ApiRow[] = [
  {
    name: 'gogTabChange',
    type: 'number',
    default: '—',
    description: 'Emitted with the new index when the active tab changes.',
  },
  {
    name: 'activeIndexChange',
    type: 'number',
    default: '—',
    description: 'The activeIndex model’s change event, for [(activeIndex)].',
  },
];

const TAB_INPUTS: readonly ApiRow[] = [
  {
    name: 'label',
    type: 'string',
    default: "''",
    description:
      'Header text. A tab declares its own header, so it is defined in exactly one place.',
  },
  {
    name: 'iconName',
    type: 'GogIconName | null',
    default: 'null',
    description: 'Optional leading icon in the header.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Makes the tab unreachable by click and skipped by arrow navigation.',
  },
];

@Component({
  selector: 'app-tabs-doc-page',
  imports: [
    ExampleHostComponent,
    TabsComponent,
    TabComponent,
    MarkdownComponent,
    RouterLink,
    SinceBadgeComponent,
  ],
  providers: [provideExampleSources(TABS_EXAMPLE_SOURCES)],
  templateUrl: './tabs-doc-page.html',
  styleUrl: './tabs-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsDocPage {
  protected readonly alignments: GogTabsAlign[] = ['start', 'center', 'end', 'stretch'];

  protected readonly activeIndex = signal(0);
  protected readonly alignIndex = signal(0);

  protected readonly apiInputs = TABS_INPUTS;
  protected readonly apiOutputs = TABS_OUTPUTS;
  protected readonly tabInputs = TAB_INPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'tabs')?.tokens ?? [];

  protected readonly importSnippet =
    "```typescript\nimport { TabComponent, TabsComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [TabsComponent, TabComponent],\n})\n```";

  /** Each example is a file under `src/app/examples/tabs/` — see docs/lab-examples-refactor.md. */
  protected readonly examples = {
    align: TabsAlignExample,
    headerSlot: TabsHeaderSlotExample,
    lazy: TabsLazyExample,
    overview: TabsOverviewExample,
  };
}
