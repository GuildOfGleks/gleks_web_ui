import { Component, OnDestroy, signal } from '@angular/core';
import { ButtonComponent, GogColumn, TableComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [TableComponent, GogColumn, ButtonComponent],
})
export class TableLoadingExample implements OnDestroy {
  protected readonly loading = signal(false);
  private timer: ReturnType<typeof setTimeout> | null = null;

  protected readonly rows = [
    { component: 'Buttons', status: 'Ready' },
    { component: 'Checkbox', status: 'Ready' },
    { component: 'Table', status: 'In review' },
    { component: 'Accordion', status: 'Planned' },
  ];

  /** Stands in for a refetch: in a real app `loading` is the request's in-flight flag. */
  protected reload(): void {
    if (this.timer) clearTimeout(this.timer);

    this.loading.set(true);
    this.timer = setTimeout(() => {
      this.loading.set(false);
      this.timer = null;
    }, 1200);
  }

  ngOnDestroy(): void {
    if (this.timer) clearTimeout(this.timer);
  }
}
