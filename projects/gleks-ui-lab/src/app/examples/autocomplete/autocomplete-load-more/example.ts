import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { AutocompleteComponent } from '@guildofgleks/ui';

const PAGE = 20;
const ALL = Array.from({ length: 200 }, (_, i) => ({ id: i + 1, name: `Contact #${i + 1}` }));

@Component({
  selector: 'app-example',
  imports: [AutocompleteComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteLoadMoreExample {
  protected readonly total = ALL.length;
  protected readonly contacts = signal(ALL.slice(0, PAGE));
  protected readonly loading = signal(false);
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  /** Stands in for a paginated API: one more page each time the panel is scrolled to its end. */
  protected loadMore(): void {
    const loaded = this.contacts().length;
    if (loaded >= ALL.length || this.loading()) return;
    this.loading.set(true);
    this.timer = setTimeout(() => {
      this.contacts.set(ALL.slice(0, loaded + PAGE));
      this.loading.set(false);
    }, 400);
  }
}
