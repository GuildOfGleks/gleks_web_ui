import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonComponent, GogBadgeDirective } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, GogBadgeDirective],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeZeroExample {
  protected readonly count = signal(3);
  protected readonly hidden = signal(false);

  protected add(): void {
    this.count.update((value) => value + 1);
  }

  protected remove(): void {
    this.count.update((value) => Math.max(0, value - 1));
  }
}
