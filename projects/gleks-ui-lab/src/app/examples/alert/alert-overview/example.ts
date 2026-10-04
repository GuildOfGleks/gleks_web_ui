import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AlertComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [AlertComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertOverviewExample {}
