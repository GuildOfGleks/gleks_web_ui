import { ChangeDetectionStrategy, Component, OnDestroy, signal } from '@angular/core';
import {
  AccordionComponent,
  ButtonComponent,
  GogAccordionChevronDirective,
  GogAccordionHeaderDirective,
  GogAccordionContentDirective,
  GogAccordionItem,
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

@Component({
  selector: 'app-accordion-page',
  imports: [
    AccordionComponent,
    ButtonComponent,
    GogAccordionChevronDirective,
    GogAccordionHeaderDirective,
    GogAccordionContentDirective,
    SpinnerOverlayComponent,
  ],
  templateUrl: './accordion-page.html',
  styleUrl: './accordion-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionPage implements OnDestroy {
  protected readonly basicItems: BasicAccordionItem[] = [
    { id: 'shipping', title: 'Shipping', body: 'Ships within 2 business days via standard courier.' },
    { id: 'returns', title: 'Returns', body: 'Free returns within 30 days of delivery.' },
    { id: 'warranty', title: 'Warranty (unavailable)', body: 'Not offered on this item.', disabled: true },
  ];

  protected readonly panels: AccordionDemoPanel[] = [
    {
      id: 'signals',
      title: 'Signals',
      kicker: 'Reactive state',
      summary: 'Loaded from the server after the panel opens.',
      notes: ['Keep mutations explicit.', 'Favor pure derivations.', 'Bind directly from the template.'],
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
      notes: ['Keep routes small.', 'Expose each component as its own page.', 'Use the shell nav to jump around.'],
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
      notes: ['Preserve focus order.', 'Use real buttons and labels.', 'Keep content readable by screen readers.'],
      stats: [
        { label: 'Checks', value: 'AXE-ready' },
        { label: 'Motion', value: 'Reduced' },
      ],
      loadDelay: 1900,
    },
  ];

  protected readonly multi = signal(false);
  protected readonly loadingState = signal<Record<string, { loading: boolean; loaded: boolean }>>({});
  private readonly panelMap = new Map(this.panels.map((panel) => [String(panel.id), panel] as const));
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
