import { ChangeDetectionStrategy, Component, inject, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import {
  CollapsibleComponent,
  DividerComponent,
  GogCollapsibleContentDirective,
  GogCollapsibleTriggerDirective,
  IconComponent,
  ScrollComponent,
} from '@guildofgleks/ui';
import { NAV_SECTIONS } from '../nav-data';
import type { NavGroup, NavItem } from '../../types/nav-item';

interface SidebarNavItem extends NavItem {
  /** Only set for items with children — starts open when the active route is one of them. */
  readonly open?: WritableSignal<boolean>;
}

interface SidebarNavSection {
  readonly title: string;
  /** Flat section (e.g. "General") — mutually exclusive with `groups`. */
  readonly items?: readonly SidebarNavItem[];
  /**
   * Categorized section (e.g. "Components") — mutually exclusive with `items`. Rendered as one
   * continuous list, groups separated by a labeled `gog-divider` rather than a collapsible —
   * every item stays reachable by scrolling alone, nothing to expand first.
   */
  readonly groups?: readonly NavGroup[];
}

function toSidebarItem(item: NavItem): SidebarNavItem {
  return { ...item, open: item.children?.length ? signal(false) : undefined };
}

@Component({
  selector: 'app-sidebar-left',
  imports: [
    RouterLink,
    RouterLinkActive,
    CollapsibleComponent,
    GogCollapsibleContentDirective,
    GogCollapsibleTriggerDirective,
    IconComponent,
    ScrollComponent,
    DividerComponent,
  ],
  templateUrl: './sidebar-left.html',
  styleUrl: './sidebar-left.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarLeftComponent {
  private readonly router = inject(Router);

  protected readonly sections: readonly SidebarNavSection[] = NAV_SECTIONS.map((section) => ({
    title: section.title,
    items: section.items?.map(toSidebarItem),
    groups: section.groups,
  }));

  constructor() {
    // The initial navigation hasn't resolved yet when this shell component constructs (it
    // sits outside <router-outlet>), so router.url isn't usable synchronously above — this
    // catches both that first navigation and every later one, opening (never auto-closing,
    // so a manual collapse elsewhere sticks) whichever item owns the now-active route.
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((event) => {
        for (const section of this.sections) {
          for (const item of section.items ?? []) {
            if (!item.open || !item.children?.length) continue;
            if (
              item.children.some((child) => event.urlAfterRedirects.startsWith('/' + child.path))
            ) {
              item.open.set(true);
            }
          }
        }
      });
  }
}
