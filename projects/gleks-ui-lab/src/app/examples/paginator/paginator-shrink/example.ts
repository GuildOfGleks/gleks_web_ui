import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonComponent, PaginatorComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, PaginatorComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginatorShrinkExample {
  protected readonly page = signal(8);
  protected readonly totalPages = signal(8);

  protected reset(): void {
    this.totalPages.set(8);
    this.page.set(8);
  }
}
