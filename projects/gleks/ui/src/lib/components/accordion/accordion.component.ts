import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  model,
  output,
  signal,
  TemplateRef,
  untracked,
  DestroyRef,
  PLATFORM_ID,
} from '@angular/core';
import { NgTemplateOutlet, isPlatformBrowser } from '@angular/common';
import { GogSize } from '@guildofgleks/ui/shared';
import { handleRovingFocusKeydown } from '@guildofgleks/ui/shared';
import { GogRippleDirective } from '../ripple/ripple.directive';
import { IconComponent } from '../icon/icon.component';
import { SkeletonComponent } from '../skeleton/skeleton.component';
import { GOG_CONFIG } from '@guildofgleks/ui/shared';
import { resolveRipple } from '@guildofgleks/ui/shared';

/** Cycled by `skeletonWidth()` — see there for why these are fixed rather than random. */
const SKELETON_WIDTHS = ['62%', '45%', '71%', '53%'] as const;

export interface GogAccordionItem {
  id: string | number;
  title: string;
  /** When true, the item's header is non-interactive and skipped by keyboard navigation. */
  disabled?: boolean;

  [key: string]: unknown;
}

export interface GogAccordionHeaderContext {
  $implicit: GogAccordionItem;
  open: boolean;
}

export interface GogAccordionToggleEvent {
  item: GogAccordionItem;
  open: boolean;
}

export interface GogAccordionChevronContext {
  $implicit: GogAccordionItem;
  open: boolean;
}

@Directive({
  selector: '[gogAccordionContent]',
})
export class GogAccordionContentDirective {
  readonly templateRef = inject<TemplateRef<{ $implicit: GogAccordionItem }>>(TemplateRef);
}

@Directive({
  selector: '[gogAccordionHeader]',
})
export class GogAccordionHeaderDirective {
  readonly templateRef = inject<TemplateRef<GogAccordionHeaderContext>>(TemplateRef);
}

@Directive({
  selector: '[gogAccordionChevron]',
})
export class GogAccordionChevronDirective {
  readonly templateRef = inject<TemplateRef<GogAccordionChevronContext>>(TemplateRef);
}

@Component({
  selector: 'gog-accordion',
  imports: [GogRippleDirective, NgTemplateOutlet, IconComponent, SkeletonComponent],
  templateUrl: './accordion.component.html',
  styleUrl: './accordion.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'gog-accordion-host',
    /*
     * The skeleton rows are `aria-hidden`, and the real headers are not rendered while loading —
     * so without this the whole component is simply *empty* to a screen reader, which reads as
     * "there is nothing here" rather than "this is coming". `gog-button` and `gog-spinner-overlay`
     * already do this; see the loading-state rule in `api-design.instructions.md`.
     */
    '[attr.aria-busy]': 'loading() ? "true" : null',
  },
})
export class AccordionComponent {
  private static nextUid = 0;
  readonly items = input<readonly GogAccordionItem[]>([]);

  /**
   * The single size modifier, replacing one `[class.gog-accordion--<size>]` binding per size.
   * Empty for `'lg'`: that is this component's default size, and its tokens are what every
   * `--gog-accordion-*` chain bottoms out at, so it has no modifier rule of its own.
   */
  protected readonly sizeClass = computed(() =>
    this.size() === 'lg' ? '' : `gog-accordion--${this.size()}`,
  );
  readonly size = input<GogSize>('lg');
  /**
   * Press ripple. Unset, falls back to `GOG_CONFIG.ripple.enabled`, then to `false` — so
   * `[ripple]="false"` opts one instance out of an app that turned it on everywhere.
   */
  readonly ripple = input<boolean | undefined>(undefined);
  /** Declared after the input it reads: field initialisers run in source order. */
  protected readonly rippleEnabled = resolveRipple(this.ripple, inject(GOG_CONFIG));

  readonly expandFirst = input(false);
  readonly multi = input(false);
  readonly loading = input(false);
  /**
   * How many skeleton rows to render while `loading` is true and `items` is still
   * empty — the common case of "the list itself hasn't arrived yet," where there's
   * no item count to derive a row count from. Ignored once `items` has entries:
   * then one skeleton row is rendered per item instead, so the placeholder matches
   * the eventual shape.
   */
  readonly skeletonCount = input(3);
  readonly showChevron = input(true);
  /**
   * When set, wraps each header button in `role="heading"` with this `aria-level`,
   * so screen-reader users navigating by headings can find accordion sections.
   * Left unset by default since not every accordion instance represents document structure
   * (e.g. one nested inside a card).
   */
  readonly headingLevel = input<2 | 3 | 4 | 5 | 6 | undefined>(undefined);
  /**
   * Two-way bindable set of currently open item ids. Exposed as a model so consumers
   * can drive the accordion externally (e.g. `[(openIds)]="mySet"`) instead of only
   * reacting to the `gogToggle` output.
   */
  readonly openIds = model<ReadonlySet<string | number>>(new Set());
  readonly gogToggle = output<GogAccordionToggleEvent>();
  readonly headerTpl = contentChild(GogAccordionHeaderDirective);
  readonly chevronTpl = contentChild(GogAccordionChevronDirective);
  readonly contentTpl = contentChild(GogAccordionContentDirective);
  /**
   * Unique per-instance id prefix. Prevents duplicate DOM ids (and therefore broken
   * aria-controls/aria-labelledby wiring) when several accordions render on the same
   * page and their items happen to share `id` values (e.g. ids coming straight from a DB).
   */
  protected readonly uid = `gog-acc-${AccordionComponent.nextUid++}`;
  private readonly host = inject(ElementRef<HTMLElement>);
  /**
   * Tracks whether the expandFirst auto-open has already run, independently of
   * `openIds` itself. Reading `openIds().size` directly inside the effect would
   * re-subscribe the effect to every future toggle (since `openIds()` gets read
   * on every run once `expandFirst` is true), causing pointless re-evaluation
   * on each click and re-opening the first item if `items` is later replaced
   * with a new array reference after the user closed everything by hand.
   */
  private readonly autoExpanded = signal(false);
  protected readonly skeletonRows = computed(() => {
    const count = this.items().length || this.skeletonCount();
    return Array.from({ length: count }, (_, index) => index);
  });

  /**
   * Placeholder title widths, cycled by row index.
   *
   * Every bar used to be 55%, which reads as a repeating progress artifact rather than as text
   * that has not arrived — real titles are not all the same length. Cycled rather than random:
   * a random width would differ between the server-rendered pass and hydration, and would make
   * every snapshot of this component unstable.
   */
  protected skeletonWidth(index: number): string {
    return SKELETON_WIDTHS[index % SKELETON_WIDTHS.length];
  }

  constructor() {
    this.trackSettling();
    effect(() => {
      const items = this.items();

      if (!this.expandFirst() || items.length === 0 || untracked(this.autoExpanded)) {
        return;
      }

      this.openIds.set(new Set([items[0].id]));
      this.autoExpanded.set(true);
    });
  }

  /**
   * Open items that have finished opening. The body clips while its height animates; kept once
   * open, the clip cut off a dropdown or menu opened inside it, and the body's `transform` put that
   * dropdown under the items below. A settled body drops both. Closing unsettles at once, so the
   * collapse animates clipped as before.
   */
  protected readonly settledIds = signal<ReadonlySet<string | number>>(new Set());
  private readonly settleTimers = new Map<string | number, ReturnType<typeof setTimeout>>();

  private trackSettling(): void {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    inject(DestroyRef).onDestroy(() => this.settleTimers.forEach((timer) => clearTimeout(timer)));
    effect(() => {
      const open = this.openIds();
      untracked(() => {
        for (const [id, timer] of this.settleTimers) {
          if (open.has(id)) continue;
          clearTimeout(timer);
          this.settleTimers.delete(id);
        }
        const settled = [...this.settledIds()].filter((id) => open.has(id));
        if (settled.length !== this.settledIds().size) this.settledIds.set(new Set(settled));
        if (!isBrowser) return;
        const wait = toMs(
          getComputedStyle(host).getPropertyValue('--gog-accordion-body-transition-duration'),
        );
        for (const id of open) {
          if (this.settledIds().has(id) || this.settleTimers.has(id)) continue;
          this.settleTimers.set(
            id,
            setTimeout(() => {
              this.settleTimers.delete(id);
              this.settledIds.update((ids) => new Set(ids).add(id));
            }, wait),
          );
        }
      });
    });
  }

  protected isOpen(id: string | number): boolean {
    return this.openIds().has(id);
  }

  protected toggle(item: GogAccordionItem): void {
    if (item.disabled) {
      return;
    }

    const id = item.id;
    const current = this.openIds();
    const next = new Set(current);

    if (next.has(id)) {
      next.delete(id);
    } else {
      if (!this.multi()) next.clear();
      next.add(id);
    }

    this.openIds.set(next);
    this.gogToggle.emit({ item, open: next.has(id) });
  }

  protected onHeaderKeydown(event: KeyboardEvent): void {
    const host = this.host.nativeElement as HTMLElement;
    // Disabled headers are excluded so arrow/Home/End navigation skips over them,
    // matching the WAI-ARIA expectation that non-interactive controls aren't focus stops.
    const headers = Array.from(
      host.querySelectorAll('.gog-accordion__header:not([disabled])'),
    ) as HTMLButtonElement[];

    handleRovingFocusKeydown(event, headers);
  }
}

/** `'0.2s'` → 200, `'150ms'` → 150, anything else → 0. */
function toMs(duration: string): number {
  const value = Number.parseFloat(duration);
  if (!Number.isFinite(value)) return 0;
  return duration.trim().endsWith('ms') ? value : value * 1000;
}
