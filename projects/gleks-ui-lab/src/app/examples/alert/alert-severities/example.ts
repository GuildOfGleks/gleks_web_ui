import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AlertComponent, GogSeverity } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [AlertComponent],
  templateUrl: './example.html',
  styleUrl: './example.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertSeveritiesExample {
  protected readonly severities: GogSeverity[] = ['accent', 'success', 'danger', 'warning', 'info'];
}
