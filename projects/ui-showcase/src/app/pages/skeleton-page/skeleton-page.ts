import { ChangeDetectionStrategy, Component, OnDestroy, signal } from '@angular/core';
import {
  ButtonComponent,
  GogSize,
  GogSkeletonAnimation,
  SkeletonComponent,
} from '@guildofgleks/ui';

interface CatalogRow {
  name: string;
  category: string;
}

const ROWS: CatalogRow[] = [
  { name: 'Aurora Desk Lamp', category: 'Home' },
  { name: 'Trailblazer Jacket', category: 'Apparel' },
  { name: 'Nimbus Wireless Buds', category: 'Electronics' },
  { name: 'Fieldnotes Journal', category: 'Books' },
];

@Component({
  selector: 'app-skeleton-page',
  imports: [ButtonComponent, SkeletonComponent],
  templateUrl: './skeleton-page.html',
  styleUrl: './skeleton-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonPage implements OnDestroy {
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
  protected readonly animations: GogSkeletonAnimation[] = ['pulse', 'wave', 'none'];
  protected readonly rows = ROWS;

  protected readonly profileLoading = signal(false);
  protected readonly listLoading = signal(true);
  private profileTimer: ReturnType<typeof setTimeout> | null = null;

  protected reloadProfile(): void {
    if (this.profileTimer) {
      clearTimeout(this.profileTimer);
    }

    this.profileLoading.set(true);
    this.profileTimer = setTimeout(() => {
      this.profileLoading.set(false);
      this.profileTimer = null;
    }, 1800);
  }

  protected toggleListLoading(): void {
    this.listLoading.update((loading) => !loading);
  }

  ngOnDestroy(): void {
    if (this.profileTimer) {
      clearTimeout(this.profileTimer);
    }
  }
}
