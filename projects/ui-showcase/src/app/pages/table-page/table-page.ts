import { ChangeDetectionStrategy, Component, OnDestroy, signal } from '@angular/core';
import { ButtonComponent, Column, GogSize, GogTagVariant, TableComponent, TagComponent, TemplateDirective } from '@guildofgleks/ui';

interface DemoRow {
  component: string;
  status: string;
  owner: string;
  updated: string;
}

const STATUS_VARIANTS: Record<string, GogTagVariant> = {
  Ready: 'success',
  'In review': 'warning',
  Planned: 'info',
};

@Component({
  selector: 'app-table-page',
  imports: [ButtonComponent, Column, TableComponent, TemplateDirective, TagComponent],
  templateUrl: './table-page.html',
  styleUrl: './table-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablePage implements OnDestroy {
  protected readonly rows: DemoRow[] = [
    { component: 'Buttons', status: 'Ready', owner: 'Design', updated: 'Today' },
    { component: 'Checkbox', status: 'Ready', owner: 'Forms', updated: 'Yesterday' },
    { component: 'Table', status: 'In review', owner: 'Data', updated: '2 days ago' },
    { component: 'Accordion', status: 'Planned', owner: 'Navigation', updated: 'This week' },
    { component: 'Spinner', status: 'Ready', owner: 'Feedback', updated: 'This month' },
  ];

  protected readonly loading = signal(false);
  private loadingTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly sizes: GogSize[] = ['sm', 'md', 'lg'];
  protected readonly size = signal<GogSize>('lg');

  protected readonly paginatorPositions: Array<'left' | 'center' | 'right'> = ['left', 'center', 'right'];
  protected readonly paginatorPosition = signal<'left' | 'center' | 'right'>('center');

  protected readonly stickyHeader = signal(false);
  protected readonly showEmpty = signal(false);

  protected statusVariant(status: string): GogTagVariant {
    return STATUS_VARIANTS[status] ?? 'info';
  }

  protected toggleLoading(): void {
    if (this.loadingTimer) {
      clearTimeout(this.loadingTimer);
    }

    this.loading.set(true);
    this.loadingTimer = setTimeout(() => {
      this.loading.set(false);
      this.loadingTimer = null;
    }, 1200);
  }

  protected toggleStickyHeader(): void {
    this.stickyHeader.update((value) => !value);
  }

  protected toggleEmpty(): void {
    this.showEmpty.update((value) => !value);
  }

  ngOnDestroy(): void {
    if (this.loadingTimer) {
      clearTimeout(this.loadingTimer);
    }
  }
}
