import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  signal,
  viewChild,
} from '@angular/core';
import {
  AlertComponent,
  GogAlertIconDirective,
  GogPanelHeaderDirective,
  GogSeverity,
  IconComponent,
  PanelComponent,
  ButtonComponent,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-alert-page',
  imports: [
    AlertComponent,
    GogAlertIconDirective,
    IconComponent,
    PanelComponent,
    GogPanelHeaderDirective,
    ButtonComponent,
  ],
  templateUrl: './alert-page.html',
  styleUrl: './alert-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertPage {
  protected readonly severities: GogSeverity[] = ['accent', 'success', 'danger', 'warning', 'info'];

  /*
   * The alert never removes itself — `dismissed` is "pressed", and this page is what that looks
   * like from the consumer's side. Keeping the state here rather than inside the component is the
   * whole point: what happens to a dismissed message is the app's decision, not the library's.
   */
  protected readonly showDismissible = signal(true);

  // `{ read: ElementRef }` because `#restore` sits on a `<gog-button>`: without it the query
  // hands back the component instance, which has no `focus()`.
  private readonly restoreButton = viewChild('restore', { read: ElementRef });

  /*
   * **Where focus goes, which is the consumer's job and is only possible because of the
   * contract.** `dismissed` fires while the alert is still in the DOM and the close button still
   * has focus, so this handler runs with somewhere to move focus *from*. A component that removed
   * itself would have destroyed the focused element before anyone could react, and focus would
   * fall to `<body>` with a keyboard reader losing their place.
   *
   * The library cannot pick the destination — only the app knows what replaces the message — so
   * this page shows the pattern rather than the component guessing it.
   */
  protected onDismissed(): void {
    this.showDismissible.set(false);
  }

  constructor() {
    effect(() => {
      if (this.showDismissible()) return;
      const host = this.restoreButton()?.nativeElement as HTMLElement | undefined;
      // The real control inside `gog-button`, which is what takes focus.
      const button = host?.querySelector('button');
      if (button) queueMicrotask(() => button.focus());
    });
  }
}
