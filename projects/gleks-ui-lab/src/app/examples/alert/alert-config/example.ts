import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AlertComponent, provideGogConfig } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [AlertComponent],
  // Usually in app.config.ts; here on the component, so it reaches only its own alert.
  providers: [provideGogConfig({ labels: { closeAlert: 'Meldung schließen' } })],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertConfigExample {}
