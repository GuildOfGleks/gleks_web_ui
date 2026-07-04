import { ChangeDetectionStrategy, Component, OnDestroy, signal } from '@angular/core';
import { ButtonComponent, GogSize, SpinnerComponent, SpinnerOverlayComponent } from '@gleks/ui';

@Component({
  selector: 'app-spinner-page',
  imports: [ButtonComponent, SpinnerComponent, SpinnerOverlayComponent],
  templateUrl: './spinner-page.html',
  styleUrl: './spinner-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinnerPage implements OnDestroy {
  protected readonly showOverlay = signal(false);
  protected readonly sizes: GogSize[] = ['sm', 'md', 'lg'];
  private overlayTimer: ReturnType<typeof setTimeout> | null = null;

  protected previewOverlay(): void {
    if (this.overlayTimer) {
      clearTimeout(this.overlayTimer);
    }

    this.showOverlay.set(true);
    this.overlayTimer = setTimeout(() => {
      this.showOverlay.set(false);
      this.overlayTimer = null;
    }, 1500);
  }

  ngOnDestroy(): void {
    if (this.overlayTimer) {
      clearTimeout(this.overlayTimer);
    }
  }
}
