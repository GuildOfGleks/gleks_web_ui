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
  inject,
  input,
  signal,
} from '@angular/core';

import { IconComponent, type GogIconName } from '../icon/icon.component';
import { GOG_CONFIG, GogSize, resolveConfigured } from '@guildofgleks/ui/shared';

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

/** Built-in defaults, used when `GOG_CONFIG.labels` leaves them unset. */
const DEFAULT_LABELS = {
  breadcrumbs: 'Breadcrumb',
  showBreadcrumbs: 'Show full path',
};

/** One rendered slot: an item, or the `…` that stands for the collapsed middle. */
interface Entry {
  readonly key: GogBreadcrumbDirective | 'more';
  readonly item: GogBreadcrumbDirective | null;
}

/**
 * Where the current page sits, as a trail of links. `docs/breadcrumbs.md` has the argument for why
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
export class BreadcrumbsComponent {
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
  private readonly items = contentChildren(GogBreadcrumbDirective);

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
    const count = this.items().length;
    if (this.expanded() || max === null || count <= max) return false;
    return this.before() + this.after() < count;
  });
  private readonly before = computed(() => Math.max(0, Math.floor(this.itemsBefore())));
  private readonly after = computed(() => Math.max(1, Math.floor(this.itemsAfter())));

  protected readonly entries = computed<readonly Entry[]>(() => {
    const items = this.items();
    const all = items.map((item) => ({ key: item, item }));
    if (!this.collapsed()) return all;
    return [
      ...all.slice(0, this.before()),
      { key: 'more', item: null },
      ...all.slice(items.length - this.after()),
    ];
  });

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
