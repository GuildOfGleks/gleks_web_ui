import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
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
}
