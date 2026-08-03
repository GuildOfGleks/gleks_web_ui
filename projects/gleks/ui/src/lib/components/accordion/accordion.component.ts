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
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { GogSize } from '../../shared/types';
import { handleRovingFocusKeydown } from '../../shared/roving-focus';
import { IconComponent } from '../icon/icon.component';
import { SkeletonComponent } from '../skeleton/skeleton.component';

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
  imports: [NgTemplateOutlet, IconComponent, SkeletonComponent],
  templateUrl: './accordion.component.html',
  styleUrl: './accordion.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'gog-accordion-host',
  },
})
export class AccordionComponent {
  private static nextUid = 0;
  readonly items = input<GogAccordionItem[]>([]);
  readonly size = input<GogSize>('lg');
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

  constructor() {
    effect(() => {
      const items = this.items();

      if (!this.expandFirst() || items.length === 0 || untracked(this.autoExpanded)) {
        return;
      }

      this.openIds.set(new Set([items[0].id]));
      this.autoExpanded.set(true);
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
