import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
  model,
} from '@angular/core';

import { GOG_CONFIG, resolveConfigured } from '../../shared/config';
import { nextGogControlId } from '../../shared/control-id';
import { GogSize, GogSurfaceVariant } from '../../shared/types';
import { CollapsibleComponent } from '../collapsible/collapsible.component';
import { GogCollapsibleContentDirective } from '../collapsible/collapsible-content.directive';
import { GogCollapsibleTriggerDirective } from '../collapsible/collapsible-trigger.directive';
import { IconComponent } from '../icon/icon.component';
import { SkeletonComponent } from '../skeleton/skeleton.component';

/** Accessible name for the collapse toggle of a panel that has no heading to borrow one from. */
const DEFAULT_TOGGLE_LABEL = 'Toggle section';
/** Placeholder lines rendered in place of the panel's body while `loading` is on. */
const DEFAULT_SKELETON_LINES = 3;

/**
 * The panel's heading. Put it on the consumer's own `<h2>`…`<h6>`: the level belongs to the
 * page's outline, and this is a *region* of a page — the one place a real heading matters most.
 * The panel takes the element's id (generating one when it has none) and uses it twice: as its
 * own `aria-labelledby`, and as the accessible name of the collapse toggle.
 */
@Directive({
  selector: '[gogPanelHeader]',
  host: { class: 'gog-panel__heading' },
})
export class GogPanelHeaderDirective {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);

  /** The id the panel labels itself and its toggle with. A consumer-supplied `id` is kept. */
  readonly headerId: string;

  constructor() {
    const host = this.element.nativeElement;
    if (!host.id) {
      host.id = nextGogControlId('gog-panel-header');
    }
    this.headerId = host.id;
  }
}

/** The panel's footer row — actions, a summary. Collapses with the body. */
@Directive({
  selector: '[gogPanelFooter]',
  host: { class: 'gog-panel__footer' },
})
export class GogPanelFooterDirective {}

/**
 * A titled region of a page: a settings section, a dashboard area, a form group.
 *
 * Where `gog-card` is one self-contained thing, often repeated in a grid, a panel is a part of
 * *this* page — so the two differ in behaviour, not only in size:
 *
 * - the panel is a real landmark (`role="region"` named by its heading), because a handful of
 *   named regions is how a screen-reader user navigates a page, whereas a landmark per card
 *   would bury that list;
 * - it can **collapse**, composing `gog-collapsible` rather than repeating it, so the open/close
 *   state, the id wiring and the animation are the ones the rest of the library already uses;
 * - a card's whole surface can be a link (`gogCardLink`); a panel's cannot. Controls live
 *   *inside* a panel, and a region that is itself a link cannot hold them.
 *
 * The heading stays a heading. The toggle is a separate `<button>` labelled by it, whose hit
 * area covers the header row — so the pointer gets "click the title to collapse" while the
 * screen reader still gets a heading *and* a named, expandable button, instead of a heading
 * swallowed by `role="button"`.
 */
@Component({
  selector: 'gog-panel',
  imports: [
    CollapsibleComponent,
    GogCollapsibleContentDirective,
    GogCollapsibleTriggerDirective,
    IconComponent,
    SkeletonComponent,
  ],
  templateUrl: './panel.component.html',
  styleUrl: './panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
    '[attr.role]': 'labelledBy() ? "region" : null',
    '[attr.aria-labelledby]': 'labelledBy()',
    '[attr.aria-busy]': 'loading() ? "true" : null',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
  },
})
export class PanelComponent {
  readonly variant = input<GogSurfaceVariant>('elevated');
  readonly size = input<GogSize>('lg');
  /** Adds the collapse toggle to the header row. The body animates open and closed. */
  readonly collapsible = input(false, { transform: booleanAttribute });
  /** Two-way bindable: `[(open)]="isOpen"`. Ignored while `collapsible` is off. */
  readonly open = model(true);
  readonly disabled = input(false, { transform: booleanAttribute });
  /**
   * Replaces the panel's body with placeholder lines and marks the host `aria-busy`. The
   * heading stays: a page section is titled before its content arrives, and blanking the title
   * too would move the layout twice.
   */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Placeholder lines shown in place of the body while `loading` is on. */
  readonly skeletonLines = input(DEFAULT_SKELETON_LINES);

  protected readonly header = contentChild(GogPanelHeaderDirective);

  private readonly globalConfig = inject(GOG_CONFIG);

  protected readonly labelledBy = computed(() => this.header()?.headerId ?? null);
  /** Only used when there is no heading — otherwise the toggle is named by the heading. */
  protected readonly toggleLabel = computed(() =>
    resolveConfigured(undefined, this.globalConfig.labels?.togglePanel, DEFAULT_TOGGLE_LABEL),
  );

  /** A panel that cannot collapse is always open, whatever `open` was last set to. */
  protected readonly effectiveOpen = computed(() => (this.collapsible() ? this.open() : true));

  protected readonly hostClasses = computed(() =>
    [
      'gog-panel',
      `gog-panel--${this.variant()}`,
      `gog-panel--${this.size()}`,
      this.collapsible() ? 'gog-panel--collapsible' : null,
      this.collapsible() && !this.open() ? 'gog-panel--closed' : null,
      this.disabled() ? 'gog-panel--disabled' : null,
      this.loading() ? 'gog-panel--loading' : null,
    ]
      .filter((className): className is string => className !== null)
      .join(' '),
  );

  protected onOpenChange(open: boolean): void {
    if (this.collapsible()) {
      this.open.set(open);
    }
  }
}
