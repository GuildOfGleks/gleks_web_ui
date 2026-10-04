import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { BreadcrumbsComponent, GogBreadcrumbDirective, type GogSize } from '@guildofgleks/ui';

import { DocAttrs } from '../../doc/doc-attrs';
import { DocCell, DocMatrix } from '../../doc/doc-matrix';
import { DocPage } from '../../doc/doc-page';
import { DocSection } from '../../doc/doc-section';

@Component({
  selector: 'app-breadcrumbs-page',
  imports: [
    BreadcrumbsComponent,
    GogBreadcrumbDirective,
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
  /** Re-mounts the collapsed trails, so each can be expanded again. */
  protected readonly generation = signal(0);
}
