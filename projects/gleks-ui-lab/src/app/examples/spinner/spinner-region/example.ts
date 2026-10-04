import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { ButtonComponent, PanelComponent, SpinnerOverlayComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, PanelComponent, SpinnerOverlayComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinnerRegionExample {
  protected readonly loading = signal(false);
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  protected load(): void {
    this.loading.set(true);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.loading.set(false), 3000);
  }
}
