import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import {
  ButtonComponent,
  SkeletonComponent,
  SpinnerComponent,
  provideGogConfig,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, SpinnerComponent],
  // Any component: in an app, your own loader. A pulsing skeleton bone stands in for it here.
  // Usually in app.config.ts; on the component, it reaches only the spinners inside it.
  providers: [provideGogConfig({ spinner: { component: SkeletonComponent } })],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinnerConfigExample {
  protected readonly saving = signal(false);
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  protected save(): void {
    this.saving.set(true);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.saving.set(false), 2200);
  }
}
