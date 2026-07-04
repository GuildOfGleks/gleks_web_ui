import { ChangeDetectionStrategy, Component, OnDestroy, signal } from '@angular/core';
import { ButtonComponent, Column, TableComponent } from '@gleks/ui';

interface DemoRow {
  component: string;
  status: string;
  owner: string;
  updated: string;
}

@Component({
  selector: 'app-table-page',
  imports: [ButtonComponent, Column, TableComponent],
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

  ngOnDestroy(): void {
    if (this.loadingTimer) {
      clearTimeout(this.loadingTimer);
    }
  }
}
