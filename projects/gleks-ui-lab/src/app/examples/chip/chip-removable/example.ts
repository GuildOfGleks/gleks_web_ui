import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonComponent, ChipComponent } from '@guildofgleks/ui';

const FILTERS = ['Angular', 'Design system', 'Pinned', 'Open'];

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, ChipComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipRemovableExample {
  protected readonly filters = signal(FILTERS);
  protected readonly lastAction = signal('nothing yet');

  protected remove(label: string): void {
    this.filters.update((filters) => filters.filter((filter) => filter !== label));
    this.lastAction.set(`gogRemove: ${label}`);
  }

  protected reset(): void {
    this.filters.set(FILTERS);
    this.lastAction.set('reset');
  }
}
