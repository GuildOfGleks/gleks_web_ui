import { ChangeDetectionStrategy, Component, OnDestroy, signal } from '@angular/core';
import {
  AccordionComponent,
  ButtonComponent,
  GogAccordionChevronDirective,
  GogAccordionHeaderDirective,
  GogAccordionContentDirective,
  GogAccordionItem,
  GogIconName,
  GogSize,
  IconComponent,
  SpinnerOverlayComponent,
  GogAccordionToggleEvent,
} from '@guildofgleks/ui';

interface AccordionDemoStat {
  label: string;
  value: string;
}

interface BasicAccordionItem extends GogAccordionItem {
  body: string;
}

interface AccordionDemoPanel extends GogAccordionItem {
  kicker: string;
  summary: string;
  notes: string[];
  stats: AccordionDemoStat[];
  loadDelay: number;
}

interface LongContentItem extends GogAccordionItem {
  paragraphs: string[];
}

interface StatusHeaderItem extends GogAccordionItem {
  icon: GogIconName;
  tone: 'success' | 'warning' | 'danger';
  subtitle: string;
  body: string;
}

interface MetricsHeaderItem extends GogAccordionItem {
  region: string;
  metrics: AccordionDemoStat[];
  body: string;
}

@Component({
  selector: 'app-accordion-page',
  imports: [
    AccordionComponent,
    ButtonComponent,
    GogAccordionChevronDirective,
    GogAccordionHeaderDirective,
    GogAccordionContentDirective,
    IconComponent,
    SpinnerOverlayComponent,
  ],
  templateUrl: './accordion-page.html',
  styleUrl: './accordion-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionPage implements OnDestroy {
  protected readonly basicItems: BasicAccordionItem[] = [
    {
      id: 'shipping',
      title: 'Shipping',
      body: 'Ships within 2 business days via standard courier.',
    },
    { id: 'returns', title: 'Returns', body: 'Free returns within 30 days of delivery.' },
    {
      id: 'warranty',
      title: 'Warranty (unavailable)',
      body: 'Not offered on this item.',
      disabled: true,
    },
  ];

  protected readonly sizeDemoItems: BasicAccordionItem[] = [
    { id: 'one', title: 'One', body: 'Sample content for the size comparison.' },
  ];
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];

  protected readonly panels: AccordionDemoPanel[] = [
    {
      id: 'signals',
      title: 'Signals',
      kicker: 'Reactive state',
      summary: 'Loaded from the server after the panel opens.',
      notes: [
        'Keep mutations explicit.',
        'Favor pure derivations.',
        'Bind directly from the template.',
      ],
      stats: [
        { label: 'Version', value: '21.2' },
        { label: 'Mode', value: 'Local' },
      ],
      loadDelay: 1100,
    },
    {
      id: 'routing',
      title: 'Routing',
      kicker: 'Lazy loading',
      summary: 'The content appears only after the simulated fetch completes.',
      notes: [
        'Keep routes small.',
        'Expose each component as its own page.',
        'Use the shell nav to jump around.',
      ],
      stats: [
        { label: 'Entry', value: 'Feature route' },
        { label: 'Strategy', value: 'Deferred' },
      ],
      loadDelay: 1500,
    },
    {
      id: 'accessibility',
      title: 'Accessibility',
      kicker: 'WCAG AA',
      summary: 'Each panel waits for its own response before rendering body data.',
      notes: [
        'Preserve focus order.',
        'Use real buttons and labels.',
        'Keep content readable by screen readers.',
      ],
      stats: [
        { label: 'Checks', value: 'AXE-ready' },
        { label: 'Motion', value: 'Reduced' },
      ],
      loadDelay: 1900,
    },
  ];

  private static readonly changelogLines = [
    'Reworked the focus ring so it stays visible against every theme surface.',
    'Fixed a race where rapid toggling could leave two panels open in single-open mode.',
    'Trimmed the bundle by inlining the chevron icon instead of loading it lazily.',
    'Improved keyboard navigation to skip disabled headers when using Home/End.',
    'Added reduced-motion support to the expand/collapse transition.',
    'Corrected a contrast issue with muted text on the dark palette.',
    'Standardized padding across the xsm through slg size tiers.',
    'Resolved a memory leak when accordions were destroyed while animating.',
  ];

  protected readonly longContentItem: LongContentItem = {
    id: 'changelog-full',
    title: 'Full changelog (grows the page)',
    paragraphs: Array.from(
      { length: 20 },
      (_, i) =>
        `v${20 - i}.0 — ${AccordionPage.changelogLines[i % AccordionPage.changelogLines.length]}`,
    ),
  };

  protected readonly scrollableItem: LongContentItem = {
    id: 'changelog-scrollable',
    title: 'Full changelog (scrolls internally)',
    paragraphs: Array.from(
      { length: 20 },
      (_, i) =>
        `v${20 - i}.0 — ${AccordionPage.changelogLines[(i + 3) % AccordionPage.changelogLines.length]}`,
    ),
  };

  protected readonly statusItems: StatusHeaderItem[] = [
    {
      id: 'api',
      title: 'API',
      icon: 'success',
      tone: 'success',
      subtitle: 'All endpoints responding normally',
      body: 'p99 latency is 118ms across all regions. No incidents in the last 30 days.',
    },
    {
      id: 'database',
      title: 'Database',
      icon: 'warning',
      tone: 'warning',
      subtitle: 'Replica lag above threshold',
      body: 'The eu-west read replica is 4.2s behind primary. Auto-scaling has been triggered.',
    },
    {
      id: 'cache',
      title: 'Cache',
      icon: 'error',
      tone: 'danger',
      subtitle: 'Cluster unreachable',
      body: 'Connection to the cache cluster timed out. Requests are falling through to the database.',
    },
  ];

  protected readonly metricsItems: MetricsHeaderItem[] = [
    {
      id: 'eu-west',
      title: 'EU West',
      region: 'Frankfurt',
      metrics: [
        { label: 'Uptime', value: '99.98%' },
        { label: 'Latency', value: '42ms' },
      ],
      body: 'Primary region for European traffic. Backed by three availability zones.',
    },
    {
      id: 'us-east',
      title: 'US East',
      region: 'Virginia',
      metrics: [
        { label: 'Uptime', value: '99.95%' },
        { label: 'Latency', value: '58ms' },
      ],
      body: 'Handles North American traffic and serves as the failover region for EU West.',
    },
  ];

  protected readonly multi = signal(false);
  protected readonly loadingState = signal<Record<string, { loading: boolean; loaded: boolean }>>(
    {},
  );
  private readonly panelMap = new Map(
    this.panels.map((panel) => [String(panel.id), panel] as const),
  );
  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();

  protected toggleMulti(): void {
    this.multi.update((current) => !current);
  }

  protected panelFor(id: GogAccordionItem['id']): AccordionDemoPanel | null {
    return this.panelMap.get(String(id)) ?? null;
  }

  protected isLoading(id: GogAccordionItem['id']): boolean {
    return this.loadingState()[String(id)]?.loading ?? false;
  }

  protected isLoaded(id: GogAccordionItem['id']): boolean {
    return this.loadingState()[String(id)]?.loaded ?? false;
  }

  protected onAccordionToggle(event: GogAccordionToggleEvent): void {
    if (!event.open) {
      return;
    }

    this.queueLoad(event.item.id);
  }

  private queueLoad(id: GogAccordionItem['id']): void {
    const key = String(id);
    const panel = this.panelMap.get(key);

    if (!panel) {
      return;
    }

    const current = this.loadingState()[key];
    if (current?.loading || current?.loaded) {
      return;
    }

    this.loadingState.update((state) => ({
      ...state,
      [key]: { loading: true, loaded: false },
    }));

    const timer = setTimeout(() => {
      this.loadingState.update((state) => ({
        ...state,
        [key]: { loading: false, loaded: true },
      }));
      this.timers.delete(key);
    }, panel.loadDelay);

    this.timers.set(key, timer);
  }

  ngOnDestroy(): void {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
  }
}
