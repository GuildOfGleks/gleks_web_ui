import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { AlertComponent, ButtonComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [AlertComponent, ButtonComponent],
  templateUrl: './example.html',
  styleUrl: './example.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertDismissibleExample {
  private readonly injector = inject(Injector);

  protected readonly visible = signal(true);

  // `read: ElementRef`, because on a `<gog-button>` the query would return the component instance.
  private readonly restore = viewChild('restore', { read: ElementRef });

  /**
   * `dismissed` means the close button was pressed. The alert is still in the DOM and its close
   * button still has focus, so this is the moment to decide where focus goes next — only the app
   * knows what replaces the message.
   */
  protected onDismissed(): void {
    this.visible.set(false);
    afterNextRender(
      () =>
        (this.restore()?.nativeElement as HTMLElement | undefined)
          ?.querySelector('button')
          ?.focus(),
      { injector: this.injector },
    );
  }
}
