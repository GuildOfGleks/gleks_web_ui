import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  TemplateRef,
  computed,
  contentChild,
  contentChildren,
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
