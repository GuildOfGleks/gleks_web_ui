import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  BreadcrumbsComponent,
  GogBreadcrumbDirective,
  GogBreadcrumbItemDirective,
  type GogBreadcrumbClick,
  type GogIconName,
  type GogSize,
} from '@guildofgleks/ui';

import { DocAttrs } from '../../doc/doc-attrs';
import { DocCell, DocMatrix } from '../../doc/doc-matrix';
import { DocPage } from '../../doc/doc-page';
import { DocSection } from '../../doc/doc-section';

interface Crumb {
  id: string;
  label: string;
  href?: string;
  icon?: GogIconName;
  count?: number;
}

@Component({
  selector: 'app-breadcrumbs-page',
  imports: [
    BreadcrumbsComponent,
    GogBreadcrumbDirective,
    GogBreadcrumbItemDirective,
    DocAttrs,
    DocCell,
    DocMatrix,
    DocPage,
    DocSection,
  ],
  templateUrl: './breadcrumbs-page.html',
  styleUrl: './breadcrumbs-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbsPage {
  protected readonly sizes: readonly GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
  /** The single column of a matrix whose rows are the only axis. */
  protected readonly trailColumn = ['trail'] as const;

  protected readonly deep = ['Workspace', 'Sales', 'Europe', 'Germany', 'Berlin', 'Q3 orders'];
  /** The short way: an array, first item to current page. */
  protected readonly trail: readonly Crumb[] = [
    { id: 'home', label: 'Home', href: '#items', icon: 'home' },
    { id: 'sales', label: 'Sales', href: '#items' },
    { id: 'europe', label: 'Europe' },
    { id: 'orders', label: 'Q3 orders', count: 128 },
  ];
  protected readonly lastClick = signal('none yet');

  protected onCrumb(click: GogBreadcrumbClick<Crumb>): void {
    // With a router: click.event.preventDefault(); this.router.navigateByUrl(click.item.href!);
    click.event.preventDefault();
    this.lastClick.set(`${click.item.label} (index ${click.index})`);
  }

  /** Re-mounts the collapsed trails, so each can be expanded again. */
  protected readonly generation = signal(0);
}
