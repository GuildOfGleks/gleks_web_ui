import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import {
  ButtonComponent,
  CardComponent,
  PanelComponent,
  SkeletonComponent,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, CardComponent, PanelComponent, SkeletonComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonComposedExample {
  protected readonly avatar =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='32' fill='%23c9b896'/><text x='32' y='40' text-anchor='middle' font-size='24' font-family='Arial' fill='%231a1208'>AL</text></svg>";
  protected readonly loading = signal(true);
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    // In the browser only: a server render has no one to show the content to.
    afterNextRender(() => this.reload());
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  protected reload(): void {
    this.loading.set(true);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.loading.set(false), 2000);
  }
}
