import { ChangeDetectionStrategy, Component, OnDestroy, signal } from '@angular/core';
import {
  ButtonComponent,
  GogPanelHeaderDirective,
  GogProgressbarVariant,
  GogSize,
  PanelComponent,
  ProgressbarComponent,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-progressbar-page',
  imports: [ButtonComponent, GogPanelHeaderDirective, PanelComponent, ProgressbarComponent],
  templateUrl: './progressbar-page.html',
  styleUrl: './progressbar-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressbarPage implements OnDestroy {
  protected readonly variants: GogProgressbarVariant[] = [
    'accent',
    'success',
    'danger',
    'warning',
    'info',
  ];
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];

  /** Local to one panel, so the rest of the page stays in colour beside it. */
  protected readonly greyscale = signal(false);

  protected readonly progress = signal(35);
  protected readonly buffer = signal(60);
  private timer: ReturnType<typeof setInterval> | null = null;

  protected toggleGreyscale(): void {
    this.greyscale.update((on) => !on);
  }

  protected start(): void {
    this.stop();
    this.progress.set(0);
    this.buffer.set(15);
    this.timer = setInterval(() => {
      this.progress.update((value) => Math.min(100, value + 4));
      this.buffer.update((value) => Math.min(100, value + 6));
      if (this.progress() >= 100) this.stop();
    }, 200);
  }

  protected stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  ngOnDestroy(): void {
    this.stop();
  }
}
