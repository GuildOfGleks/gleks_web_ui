import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonOverviewExample {
  protected readonly clicks = signal(0);

  protected onClick(): void {
    this.clicks.update((count) => count + 1);
  }
}
