import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  Injector,
  Renderer2,
  TemplateRef,
  afterNextRender,
  afterRenderEffect,
  computed,
  contentChildren,
  contentChild,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

import { IconComponent, type GogIconName } from '../icon/icon.component';
import {
  GOG_CONFIG,
  GogSize,
  readOption,
  resolveConfigured,
  type GogOptionAccessor,
} from '@guildofgleks/ui/shared';

/**
 * One item of a `gog-breadcrumbs` trail, on an element of your own:
 *
 * ```html
 * <a *gogBreadcrumb routerLink="/components">Components</a>
 * ```
 *
 * Structural, so the trail receives a template rather than the element: that is what lets it stamp
 * each item inside a `<li>` of its own and leave the middle out while collapsed. The element stays
 * yours — `routerLink`, `href` and anything else on it keep working. One element per item.
 */
@Directive({ selector: '[gogBreadcrumb]' })
export class GogBreadcrumbDirective {
  readonly templateRef = inject<TemplateRef<unknown>>(TemplateRef);
}

/** What a `gogBreadcrumbItem` template is handed for each item of `items`. */
export interface GogBreadcrumbItemContext<T> {
  $implicit: T;
  item: T;
  /** As read through `itemLabel`. */
  label: string;
  /** The last item: the current page, drawn as text rather than a link. */
  current: boolean;
  index: number;
}

/**
 * Custom content for each item of `items`, inside the link (or the current page's text) the trail
 * draws — an icon and a badge, say. The link itself, its `href` and `aria-current` stay the trail's.
 *
 * ```html
 * <gog-breadcrumbs [items]="trail">
 *   <ng-template gogBreadcrumbItem let-crumb [gogBreadcrumbItemTypeOf]="trail">
 *     {{ crumb.label }} <span class="count">{{ crumb.count }}</span>
 *   </ng-template>
 * </gog-breadcrumbs>
 * ```
 */
@Directive({ selector: '[gogBreadcrumbItem]' })
export class GogBreadcrumbItemDirective<T = unknown> {
  readonly templateRef = inject<TemplateRef<GogBreadcrumbItemContext<T>>>(TemplateRef);

  /** Types the template's context; never read at runtime. Bind the same array as `items`. */
  readonly gogBreadcrumbItemTypeOf = input<readonly T[]>();

  static ngTemplateContextGuard<T>(
    _dir: GogBreadcrumbItemDirective<T>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- only used as a type guard
    ctx: unknown,
  ): ctx is GogBreadcrumbItemContext<T> {
    return true;
  }
}

/** What `gogItemClick` carries: the item pressed, where it is, and the click itself. */
export interface GogBreadcrumbClick<T> {
  item: T;
  index: number;
  /** `preventDefault()` it to navigate yourself — with a router, say — instead of following `href`. */
  event: MouseEvent;
}

/** Built-in defaults, used when `GOG_CONFIG.labels` leaves them unset. */
const DEFAULT_LABELS = {
  breadcrumbs: 'Breadcrumb',
  showBreadcrumbs: 'Show full path',
};

/** One item of `items`, read through the accessors once per change. */
interface DataItem<T> {
  readonly item: T;
  readonly index: number;
  readonly label: string;
  readonly href: string | null;
  readonly icon: GogIconName | null;
}

/**
 * One rendered slot: a template of yours (`*gogBreadcrumb`), an item of `items`, or the `…` that
 * stands for the collapsed middle.
 */
interface Entry<T> {
  readonly key: unknown;
  readonly template: GogBreadcrumbDirective | null;
  readonly data: DataItem<T> | null;
}

/**
 * Where the current page sits, as a trail of links — from an array, or from elements of your own:
 *
 * ```html
 * <gog-breadcrumbs [items]="[{ label: 'Home', href: '/' }, { label: 'Orders', href: '/orders' }, { label: '#1042' }]" />
 *
 * <gog-breadcrumbs>
 *   <a *gogBreadcrumb routerLink="/">Home</a>
 *   <span *gogBreadcrumb>#1042</span>
 * </gog-breadcrumbs>
 * ```
 *
 * The array is the short way: each item a link from its `href` and the last one the current page.
 * `*gogBreadcrumb` is the way to put anything on the element itself — `routerLink`, a query
 * parameter, a tooltip. When `items` has entries it wins.
 * `docs/breadcrumbs.md` has the argument for why
 * it is a component; the short version is that every part of a correct trail is invisible — the
 * named landmark, the list, `aria-current="page"` on the last item, separators a screen reader does
 * not read — so nothing on screen says when one is missing.
 *
 * **Collapsing.** Past `maxItems` the middle becomes a `…` button that expands the trail in place.
 * The button is removed by its own press, so focus moves to the first item it revealed rather than
 * falling back to `<body>`.
 */
@Component({
  selector: 'gog-breadcrumbs',
  imports: [IconComponent, NgTemplateOutlet],
  templateUrl: './breadcrumbs.component.html',
  styleUrl: './breadcrumbs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
  },
})
export class BreadcrumbsComponent<T = unknown> {
  /**
   * The trail, first item to current page, as data. Each item is read through the accessors below,
   * so your own objects work as they are. Empty, the trail is your `*gogBreadcrumb` elements.
   */
  readonly items = input<readonly T[]>([]);
  readonly itemLabel = input<GogOptionAccessor<T, string>>('label');
  /** A parent with an `href` is a link; one without is a button that only emits `gogItemClick`. */
  readonly itemHref = input<GogOptionAccessor<T, string | null | undefined>>('href');
  readonly itemIcon = input<GogOptionAccessor<T, GogIconName | null | undefined>>('icon');

  /**
   * A parent item of `items` was pressed. With a router, `preventDefault()` the event and navigate
   * to the item yourself; without one, the link simply follows its `href`.
   */
  readonly gogItemClick = output<GogBreadcrumbClick<T>>();

  /** Past this many items, the middle collapses into a `…` button. Unset, the trail never collapses. */
  readonly maxItems = input<number | null>(null);
  /** Items kept before the `…` while collapsed. */
  readonly itemsBefore = input(1);
  /** Items kept after it — the current page and its parent by default. */
  readonly itemsAfter = input(2);
  /** Drawn between items, and mirrored under `dir="rtl"`. */
  readonly separatorIcon = input<GogIconName>('chevron-right');
  readonly size = input<GogSize>('md');
  /** Names the landmark. Unset, `GOG_CONFIG.labels.breadcrumbs`, then `'Breadcrumb'`. */
  readonly ariaLabel = input<string | undefined>(undefined);

  private readonly globalConfig = inject(GOG_CONFIG);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly injector = inject(Injector);
  private readonly templates = contentChildren(GogBreadcrumbDirective);
  protected readonly itemTemplate = contentChild(GogBreadcrumbItemDirective);

  private readonly dataItems = computed<DataItem<T>[]>(() => {
    const label = this.itemLabel();
    const href = this.itemHref();
    const icon = this.itemIcon();
    return this.items().map((item, index) => ({
      item,
      index,
      label: String(readOption(item, label) ?? ''),
      href: readOption(item, href) || null,
      icon: readOption(item, icon) || null,
    }));
  });

  /** Every item, before any collapsing, from whichever of the two sources is in use. */
  private readonly allEntries = computed<Entry<T>[]>(() => {
    const data = this.dataItems();
    if (data.length) {
      return data.map((item) => ({ key: `item:${item.index}`, template: null, data: item }));
    }
    return this.templates().map((template) => ({ key: template, template, data: null }));
  });

  /** Set by the `…` button. A trail, once expanded, stays expanded. */
  protected readonly expanded = signal(false);

  protected readonly resolvedLabels = computed(() => {
    const configured = this.globalConfig.labels ?? {};
    return {
      landmark: resolveConfigured(
        this.ariaLabel(),
        configured.breadcrumbs,
        DEFAULT_LABELS.breadcrumbs,
      ),
      more: resolveConfigured(
        undefined,
        configured.showBreadcrumbs,
        DEFAULT_LABELS.showBreadcrumbs,
      ),
    };
  });

  /** Whether the middle is collapsed right now — only if that hides at least one item. */
  private readonly collapsed = computed(() => {
    const max = this.maxItems();
    const count = this.allEntries().length;
    if (this.expanded() || max === null || count <= max) return false;
    return this.before() + this.after() < count;
  });
  private readonly before = computed(() => Math.max(0, Math.floor(this.itemsBefore())));
  private readonly after = computed(() => Math.max(1, Math.floor(this.itemsAfter())));

  protected readonly entries = computed<readonly Entry<T>[]>(() => {
    const all = this.allEntries();
    if (!this.collapsed()) return all;
    return [
      ...all.slice(0, this.before()),
      { key: 'more', template: null, data: null },
      ...all.slice(all.length - this.after()),
    ];
  });

  protected contextFor(data: DataItem<T>, current: boolean): GogBreadcrumbItemContext<T> {
    return { $implicit: data.item, item: data.item, label: data.label, current, index: data.index };
  }

  protected onItemClick(data: DataItem<T>, event: MouseEvent): void {
    this.gogItemClick.emit({ item: data.item, index: data.index, event });
  }

  protected readonly hostClasses = computed(
    () => `gog-breadcrumbs gog-breadcrumbs--${this.size()}`,
  );

  constructor() {
    // The last item is the current page. Its element is yours, rendered from your template, so the
    // attribute is set on it after each render rather than bound — and taken off any item that
    // used to be last.
    afterRenderEffect(() => {
      const count = this.entries().length;
      this.itemElements().forEach((element, index) => {
        if (index === count - 1) this.renderer.setAttribute(element, 'aria-current', 'page');
        else if (element.getAttribute('aria-current') === 'page') {
          this.renderer.removeAttribute(element, 'aria-current');
        }
      });
    });
  }

  protected expand(): void {
    const firstRevealed = this.before();
    this.expanded.set(true);
    // The button that had focus is gone after this render; hand focus to what it revealed.
    afterNextRender(() => this.itemElements()[firstRevealed]?.focus(), { injector: this.injector });
  }

  /** The element each `<li>` holds, in order — the first element child that is not the trail's own. */
  private itemElements(): HTMLElement[] {
    const items = this.elementRef.nativeElement.querySelectorAll('.gog-breadcrumbs__item');
    return Array.from(items, (li) => li.firstElementChild as HTMLElement | null).filter(
      (element): element is HTMLElement => element !== null,
    );
  }
}
