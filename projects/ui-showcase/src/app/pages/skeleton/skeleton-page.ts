import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import {
  SkeletonComponent,
  type GogSize,
  type GogSkeletonAnimation,
  type GogSkeletonShape,
} from '@guildofgleks/ui';

import { DocAttrs } from '../../doc/doc-attrs';
import { DocCell, DocMatrix } from '../../doc/doc-matrix';
import { DocPage } from '../../doc/doc-page';
import { DocSection } from '../../doc/doc-section';

@Component({
  selector: 'app-skeleton-page',
  imports: [SkeletonComponent, DocAttrs, DocCell, DocMatrix, DocPage, DocSection],
  templateUrl: './skeleton-page.html',
  styleUrl: './skeleton-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonPage {
  protected readonly sizes: readonly GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
  protected readonly shapes: readonly GogSkeletonShape[] = ['text', 'circle', 'rect'];
  protected readonly animations: readonly GogSkeletonAnimation[] = ['pulse', 'wave', 'none'];
  protected readonly lineCounts = [1, 2, 4] as const;

  /** The single column of a matrix whose rows are the only axis. */
  protected readonly controlColumn = ['skeleton'] as const;

  protected readonly a11yStates = ['default', 'ariaLabel="Loading profile"'] as const;

  protected readonly loading = signal(true);
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.reload();
    inject(DestroyRef).onDestroy(() => this.timer && clearTimeout(this.timer));
  }

  /** Bones for two seconds, then the real card — the swap the page is about. */
  protected reload(): void {
    if (this.timer) clearTimeout(this.timer);
    this.loading.set(true);
    this.timer = setTimeout(() => this.loading.set(false), 2000);
  }
}
