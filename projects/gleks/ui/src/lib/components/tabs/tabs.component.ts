import { isPlatformBrowser, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  PLATFORM_ID,
  TemplateRef,
  computed,
  contentChild,
  contentChildren,
  effect,
  forwardRef,
  inject,
  input,
  model,
  output,
  viewChildren,
} from '@angular/core';

import { IconComponent } from '../icon/icon.component';
import { ScrollComponent } from '../scroll/scroll.component';
import { handleRovingFocusKeydown } from '../../shared/roving-focus';
import { GogOrientation, GogSize, GogTabsAlign } from '../../shared/types';
import { GOG_TABS_STATE, type GogTabsState } from './tabs-state';
import { TabComponent } from './tab.component';

/** Context handed to a `gogTabHeader` template. */
export interface GogTabHeaderContext {
  /** The `gog-tab` this header belongs to. */
  $implicit: TabComponent;
  active: boolean;
  disabled: boolean;
  index: number;
}

/**
 * Custom markup for a tab's header button:
 *
 * ```html
 * <gog-tabs>
 *   <ng-template gogTabHeader let-tab let-active="active">
 *     {{ tab.label() }} <gog-tag *ngIf="active">•</gog-tag>
 *   </ng-template>
 *   <gog-tab label="Входящие">…</gog-tab>
 * </gog-tabs>
 * ```
 */
@Directive({ selector: '[gogTabHeader]' })
export class GogTabHeaderDirective {
  readonly templateRef = inject<TemplateRef<GogTabHeaderContext>>(TemplateRef);

  static ngTemplateContextGuard(
    _dir: GogTabHeaderDirective,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- only used as a type guard
    ctx: unknown,
  ): ctx is GogTabHeaderContext {
    return true;
  }
}

/**
 * A tablist over projected `<gog-tab>` children.
 *
 * ```html
 * <gog-tabs [(activeIndex)]="index" align="start">
 *   <gog-tab label="Профиль"><app-profile /></gog-tab>
 *   <gog-tab label="Настройки"><app-settings /></gog-tab>
 * </gog-tabs>
 * ```
 *
 * The header row is built from each tab's own `label` / `iconName` / `disabled`, so a tab is
 * declared in exactly one place. Overflowing headers scroll inside a `<gog-scroll>` rather than
 * a native `overflow-x`, per the library's styling contract — a native scrollbar is the one
 * piece of chrome no `--gog-*` token can reach.
 */
@Component({
  selector: 'gog-tabs',
  imports: [IconComponent, NgTemplateOutlet, ScrollComponent],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    // forwardRef because the class is not yet defined when this decorator is evaluated.
    { provide: GOG_TABS_STATE, useExisting: forwardRef(() => TabsComponent) },
  ],
  host: {
    '[class]': 'hostClasses()',
  },
})
export class TabsComponent implements GogTabsState {
  readonly tabs = contentChildren(TabComponent);

  /** Two-way bindable index of the visible tab: `[(activeIndex)]="signal"`. */
  readonly activeIndex = model(0);
  readonly align = input<GogTabsAlign>('start');
  readonly orientation = input<GogOrientation>('horizontal');
  readonly size = input<GogSize>('md');
  readonly fullWidth = input(false);
  readonly ariaLabel = input('');
  /**
   * Whether selecting a tab scrolls the (possibly overflowing) header row so the active tab
   * stays in view — centered where there's room, so its neighbours on both sides stay visible
   * too, the same "always show what's around the current position" idea `gog-paginator` uses
   * for pages. Reacts to `activeIndex` however it changes: a click, the arrow keys, or a
   * consumer setting it directly. On by default; turn it off for a header that never actually
   * overflows, or to own the scroll position yourself.
   */
  readonly scrollActiveIntoView = input(true);
  /**
   * Whether the header row shows its own draggable scroll thumb/track. Native scrolling
   * (wheel, touch, keyboard) works the same regardless; this is purely the visual affordance.
   *
   * Unset, it follows `scrollActiveIntoView`: hidden while that's on, since a second scroll
   * indicator sitting right next to the active-tab underline reads as two conflicting signals
   * for the same thing once selecting a tab already moves the row on its own; shown while it's
   * off, since the track is then the only way to reach an off-screen tab without a keyboard.
   * Set explicitly to pin it either way regardless of `scrollActiveIntoView`.
   */
  readonly showScrollTrack = input<boolean | undefined>(undefined);

  /** Emits the newly active index whenever it changes, including via keyboard. */
  readonly gogTabChange = output<number>();

  protected readonly headerSlot = contentChild(GogTabHeaderDirective);
  private readonly headerRefs = viewChildren<ElementRef<HTMLButtonElement>>('tabHeader');

  /**
   * The index actually shown. Clamped, and never a disabled tab: `activeIndex` is a plain
   * number a consumer can set to anything, and silently showing nothing would be worse than
   * falling back to the nearest usable tab.
   */
  protected readonly resolvedIndex = computed(() => {
    const tabs = this.tabs();
    if (tabs.length === 0) return -1;

    const requested = this.activeIndex();
    if (requested >= 0 && requested < tabs.length && !tabs[requested].disabled()) {
      return requested;
    }

    const firstEnabled = tabs.findIndex((tab) => !tab.disabled());
    return firstEnabled;
  });

  /** Read by each `gog-tab` through `GOG_TABS_STATE`; see `tabs-state.ts`. */
  readonly activeTab = computed<TabComponent | null>(() => {
    const index = this.resolvedIndex();
    return index === -1 ? null : (this.tabs()[index] ?? null);
  });

  /** See `showScrollTrack`'s doc for why this defaults off precisely when the other is on. */
  protected readonly resolvedShowScrollTrack = computed(
    () => this.showScrollTrack() ?? !this.scrollActiveIntoView(),
  );

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  /** Instant for the first scroll (page load shouldn't animate into place), smooth after. */
  private hasScrolledOnce = false;

  constructor() {
    effect(() => {
      const index = this.resolvedIndex();
      const header = this.headerRefs()[index]?.nativeElement;
      if (!this.isBrowser || !this.scrollActiveIntoView() || !header) return;

      // Feature-detected: absent in jsdom (so: in unit tests) and in very old browsers, which
      // then simply keep whatever scroll position they already had.
      if (typeof header.scrollIntoView !== 'function') return;

      header.scrollIntoView({
        inline: 'center',
        block: 'nearest',
        behavior: this.hasScrolledOnce && !this.prefersReducedMotion() ? 'smooth' : 'auto',
      });
      this.hasScrolledOnce = true;
    });
  }

  private prefersReducedMotion(): boolean {
    return (
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  protected readonly hostClasses = computed(() =>
    [
      'gog-tabs',
      `gog-tabs--${this.orientation()}`,
      `gog-tabs--align-${this.align()}`,
      `gog-tabs--${this.size()}`,
      this.fullWidth() ? 'gog-host--full-width' : null,
    ]
      .filter((className): className is string => className !== null)
      .join(' '),
  );

  protected selectIndex(index: number): void {
    const tab = this.tabs()[index];
    if (!tab || tab.disabled() || index === this.resolvedIndex()) return;

    this.activeIndex.set(index);
    this.gogTabChange.emit(index);
  }

  protected headerContext(tab: TabComponent, index: number): GogTabHeaderContext {
    return {
      $implicit: tab,
      active: index === this.resolvedIndex(),
      disabled: tab.disabled(),
      index,
    };
  }

  /**
   * Arrows move focus and activate in one step — the "automatic activation" variant of the
   * ARIA tabs pattern, which suits panels that are already in the DOM. Home/End jump to the
   * first/last enabled tab.
   */
  protected onHeaderKeydown(event: KeyboardEvent): void {
    const headers = this.headerRefs().map((ref) => ref.nativeElement);
    const tabs = this.tabs();
    const moved = handleRovingFocusKeydown(event, headers, {
      orientation: this.orientation(),
      isDisabled: (_header, index) => tabs[index]?.disabled() ?? true,
    });
    if (!moved) return;

    const focused = headers.indexOf(document.activeElement as HTMLButtonElement);
    if (focused !== -1) {
      this.selectIndex(focused);
    }
  }
}
