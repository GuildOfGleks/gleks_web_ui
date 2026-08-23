import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  ButtonComponent,
  CheckboxComponent,
  GogPanelFooterDirective,
  GogPanelHeaderDirective,
  GogSize,
  GogSurfaceVariant,
  InputfieldComponent,
  PanelComponent,
  SelectComponent,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-panel-page',
  imports: [
    ButtonComponent,
    CheckboxComponent,
    GogPanelFooterDirective,
    GogPanelHeaderDirective,
    InputfieldComponent,
    PanelComponent,
    SelectComponent,
  ],
  templateUrl: './panel-page.html',
  styleUrl: './panel-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelPage {
  protected readonly variants: GogSurfaceVariant[] = ['outlined', 'elevated', 'filled'];
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];

  protected readonly notificationsOpen = signal(true);
  protected readonly securityOpen = signal(false);
  protected readonly disabledOpen = signal(true);
  protected readonly loading = signal(true);

  protected readonly emailDigest = signal(true);
  protected readonly pushAlerts = signal(false);
  protected readonly displayName = signal('Ada');

  /** Proves a dropdown inside a non-collapsible panel is not clipped by the collapse geometry. */
  protected readonly timezone = signal<string | null>(null);
  protected readonly timezones = [
    { id: 'utc', name: 'UTC' },
    { id: 'cet', name: 'Central European Time' },
    { id: 'eet', name: 'Eastern European Time' },
  ];
}
