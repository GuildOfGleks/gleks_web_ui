import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  TemplateRef,
  computed,
  contentChild,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';

import type { GogIconName } from '../icon/icon.component';
import { GOG_TABS_STATE } from './tabs-state';

/**
 * Marks a tab's content as **lazy**: it is built the first time the tab is shown, and kept
 * alive afterwards.
 *
 * ```html
 * <gog-tab label="Report">
 *   <ng-template gogTabContent><app-expensive-report /></ng-template>
 * </gog-tab>
 * ```
 *
 * Without it, content written directly inside `<gog-tab>` renders immediately and is merely
 * hidden while inactive — which is what you want for cheap content, because it preserves
 * scroll position, un-submitted input and any state the DOM is holding. Which behaviour you
 * get is decided by whether this template is present; there is no `lazy` input to keep in sync.
 */
@Directive({ selector: '[gogTabContent]' })
export class GogTabContentDirective {
  readonly templateRef = inject<TemplateRef<unknown>>(TemplateRef);
}

/**
 * One tab inside a `<gog-tabs>`. Declares its own header text and holds its own content.
 *
 * ```html
 * <gog-tabs>
 *   <gog-tab label="Profile"><app-profile /></gog-tab>
 *   <gog-tab label="Settings" iconName="info" [disabled]="!canEdit">…</gog-tab>
 * </gog-tabs>
 * ```
 */
@Component({
  selector: 'gog-tab',
  imports: [NgTemplateOutlet],
  templateUrl: './tab.component.html',
  styleUrl: './tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'gog-tab',
    role: 'tabpanel',
    '[attr.id]': 'panelId',
    '[attr.aria-labelledby]': 'headerId',
    // `hidden` rather than removing the panel: an inactive tab that keeps its DOM keeps its
    // scroll position and half-filled inputs, which is the behaviour people expect from tabs.
    '[hidden]': '!active()',
    // Reachable by keyboard so someone tabbing out of the tablist lands in the content.
    '[attr.tabindex]': 'active() ? 0 : null',
  },
})
export class TabComponent {
  private static nextUid = 0;
  private readonly uid = `gog-tab-${++TabComponent.nextUid}`;

  /** Header text. */
  readonly label = input('');
  /** Optional leading icon in the header. */
  readonly iconName = input<GogIconName | null>(null);
  readonly disabled = input(false);

  readonly panelId = `${this.uid}-panel`;
  readonly headerId = `${this.uid}-header`;

  private readonly tabsState = inject(GOG_TABS_STATE);
  /** Identity comparison against the group's current tab — no index bookkeeping either side. */
  readonly active = computed(() => this.tabsState.activeTab() === this);

  protected readonly lazySlot = contentChild(GogTabContentDirective);

  /**
   * Latches on first activation and never resets, so a lazy tab pays its build cost once and
   * then behaves like an eager one — revisiting it does not rebuild the subtree or lose what
   * the user typed into it.
   */
  private readonly everActivated = signal(false);
  protected readonly shouldRenderLazy = computed(() => this.active() || this.everActivated());

  constructor() {
    // The latch is set from an effect rather than inside the computed above, which may not
    // write signals. Timing is not a concern: on the activating pass `active()` is already
    // true, so the content renders in the same cycle and the latch only has to survive the
    // *next* deactivation.
    effect(() => {
      if (this.active()) {
        this.everActivated.set(true);
      }
    });
  }
}
