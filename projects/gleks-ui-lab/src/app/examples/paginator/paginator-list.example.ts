import { Component, computed, signal } from '@angular/core';
import { PaginatorComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [PaginatorComponent],
  template: `
    <ul>
      @for (item of visibleItems(); track item) {
        <li>{{ item }}</li>
      }
    </ul>
    <gog-paginator [(page)]="page" [totalPages]="totalPages()" />
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 16px;
    }
  `,
})
export class PaginatorListExample {
  private readonly pageSize = 4;
  private readonly items = [
    'Apple',
    'Banana',
    'Cherry',
    'Date',
    'Elderberry',
    'Fig',
    'Grape',
    'Honeydew',
    'Kiwi',
    'Lemon',
  ];
  protected readonly page = signal(1);
  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.items.length / this.pageSize)),
  );
  protected readonly visibleItems = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.items.slice(start, start + this.pageSize);
  });
}
