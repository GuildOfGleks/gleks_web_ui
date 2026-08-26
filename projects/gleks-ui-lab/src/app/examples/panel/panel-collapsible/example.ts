import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  ButtonComponent,
  CheckboxComponent,
  GogPanelFooterDirective,
  GogPanelHeaderDirective,
  PanelComponent,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [
    ButtonComponent,
    CheckboxComponent,
    GogPanelFooterDirective,
    GogPanelHeaderDirective,
    PanelComponent,
  ],
  templateUrl: './example.html',
  styleUrl: './example.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelCollapsibleExample {
  protected readonly notificationsOpen = signal(true);
  protected readonly securityOpen = signal(false);
  protected readonly billingOpen = signal(true);

  protected readonly emailDigest = signal(true);
  protected readonly pushAlerts = signal(false);
}
