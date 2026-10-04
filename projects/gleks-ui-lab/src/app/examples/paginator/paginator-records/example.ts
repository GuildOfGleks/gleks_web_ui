import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { PaginatorComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [PaginatorComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginatorRecordsExample {
  protected readonly people = Array.from({ length: 47 }, (_, index) => `Person ${index + 1}`);
  protected readonly page = signal(1);
  protected readonly pageSize = signal(5);
  protected readonly visiblePeople = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.people.slice(start, start + this.pageSize());
  });
}
