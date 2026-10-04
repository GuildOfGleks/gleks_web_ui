import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiTableComponent, type ApiRow } from '../../shared/api-table/api-table';
import { DemoComponent } from '../../shared/demo/demo';
import { GlobalConfigNote } from '../../shared/global-config-note/global-config-note';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';
import { TABS_EXAMPLES } from '../../../examples/tabs/sources.generated';
import { TabsAlignExample } from '../../../examples/tabs/tabs-align/example';
import { TabsDisabledIndexExample } from '../../../examples/tabs/tabs-disabled-index/example';
import { TabsHeaderExample } from '../../../examples/tabs/tabs-header/example';
import { TabsIconsExample } from '../../../examples/tabs/tabs-icons/example';
import { TabsLazyExample } from '../../../examples/tabs/tabs-lazy/example';
import { TabsOverflowExample } from '../../../examples/tabs/tabs-overflow/example';
import { TabsOverviewExample } from '../../../examples/tabs/tabs-overview/example';
import { TabsSizesExample } from '../../../examples/tabs/tabs-sizes/example';
import { TabsVerticalExample } from '../../../examples/tabs/tabs-vertical/example';

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
  {
    name: 'ripple',
    type: 'boolean | undefined',
    default: 'undefined',
    description:
      'Press ripple on each tab header. Unset, falls back to GOG_CONFIG.ripple.enabled, which is off by default; setting it here wins over the app-wide value in both directions.',
    since: '21.6.1',
  },
];

const TABS_OUTPUTS: readonly ApiRow[] = [
  {
    name: 'gogTabChange',
    type: 'number',
    description: 'Emitted with the new index when the active tab changes.',
  },
  {
    name: 'activeIndexChange',
    type: 'number',
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

const API_SLOTS: readonly ApiRow[] = [
  {
    name: 'gogTabHeader',
    type: '$implicit (the gog-tab), active, disabled, index',
    description: "On an <ng-template> inside gog-tabs. Replaces every header button's content.",
  },
  {
    name: 'gogTabContent',
    type: 'none',
    description:
      "On an <ng-template> inside a gog-tab. Makes that tab's content lazy — built on first activation, kept alive after.",
  },
];

@Component({
  selector: 'app-tabs-doc-page',
  imports: [ApiTableComponent, DemoComponent, GlobalConfigNote, MarkdownComponent, RouterLink],
  templateUrl: './tabs-doc-page.html',
  styleUrl: './tabs-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsDocPage {
  protected readonly tabsInputs = TABS_INPUTS;
  protected readonly tabsOutputs = TABS_OUTPUTS;
  protected readonly tabInputs = TAB_INPUTS;
  protected readonly apiSlots = API_SLOTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'tabs')?.tokens ?? [];

  protected readonly sources = TABS_EXAMPLES;
  protected readonly examples = {
    overview: TabsOverviewExample,
    sizes: TabsSizesExample,
    align: TabsAlignExample,
    icons: TabsIconsExample,
    header: TabsHeaderExample,
    vertical: TabsVerticalExample,
    overflow: TabsOverflowExample,
    disabledIndex: TabsDisabledIndexExample,
    lazy: TabsLazyExample,
  };

  protected readonly importSnippet =
    "```typescript\nimport { TabComponent, TabsComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [TabsComponent, TabComponent],\n})\n```";
}
