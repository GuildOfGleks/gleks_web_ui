import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AlertComponent, GogAlertIconDirective, IconComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [AlertComponent, GogAlertIconDirective, IconComponent],
  templateUrl: './example.html',
  styleUrl: './example.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertIconsExample {}
