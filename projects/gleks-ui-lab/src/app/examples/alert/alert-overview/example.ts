import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AlertComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [AlertComponent],
  templateUrl: './example.html',
  styleUrl: './example.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertOverviewExample {}
