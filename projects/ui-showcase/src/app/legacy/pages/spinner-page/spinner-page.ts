import { ChangeDetectionStrategy, Component, OnDestroy, signal } from '@angular/core';
import {
  ButtonComponent,
  GogPanelHeaderDirective,
  GogSize,
  GogSpinnerVariant,
  PanelComponent,
  SpinnerComponent,
  SpinnerOverlayComponent,
} from '@guildofgleks/ui';
import { SpinnerConfigScope } from './spinner-config-scope';

@Component({
  selector: 'app-spinner-page',
  imports: [
    ButtonComponent,
    GogPanelHeaderDirective,
    PanelComponent,
    SpinnerComponent,
    SpinnerOverlayComponent,
    SpinnerConfigScope,
  ],
  templateUrl: './spinner-page.html',
  styleUrl: './spinner-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinnerPage implements OnDestroy {
  protected readonly showOverlay = signal(false);
  protected readonly showFullscreenOverlay = signal(false);
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
  protected readonly variants: GogSpinnerVariant[] = ['runic', 'ring'];
  private overlayTimer: ReturnType<typeof setTimeout> | null = null;
  private fullscreenTimer: ReturnType<typeof setTimeout> | null = null;

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

  protected previewFullscreenOverlay(): void {
    if (this.fullscreenTimer) {
      clearTimeout(this.fullscreenTimer);
    }

    this.showFullscreenOverlay.set(true);
    this.fullscreenTimer = setTimeout(() => {
      this.showFullscreenOverlay.set(false);
      this.fullscreenTimer = null;
    }, 1500);
  }

  ngOnDestroy(): void {
    if (this.overlayTimer) {
      clearTimeout(this.overlayTimer);
    }
    if (this.fullscreenTimer) {
      clearTimeout(this.fullscreenTimer);
    }
  }
}
