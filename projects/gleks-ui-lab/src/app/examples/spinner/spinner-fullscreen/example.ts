import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { ButtonComponent, SpinnerComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, SpinnerComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinnerFullscreenExample {
  protected readonly covering = signal(false);
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  protected cover(): void {
    this.covering.set(true);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.covering.set(false), 1500);
  }
}
