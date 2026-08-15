import { Component, OnDestroy, signal } from '@angular/core';
import { ButtonComponent, SpinnerComponent } from '@guildofgleks/ui';

/** Long enough to see it, short enough that it always gives the page back. */
const PREVIEW_DURATION_MS = 1500;

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [ButtonComponent, SpinnerComponent],
})
export class SpinnerFullscreenExample implements OnDestroy {
  protected readonly loading = signal(false);
  private timer: ReturnType<typeof setTimeout> | null = null;

  protected preview(): void {
    if (this.timer) clearTimeout(this.timer);

    this.loading.set(true);
    this.timer = setTimeout(() => {
      this.loading.set(false);
      this.timer = null;
    }, PREVIEW_DURATION_MS);
  }

  ngOnDestroy(): void {
    if (this.timer) clearTimeout(this.timer);
  }
}
