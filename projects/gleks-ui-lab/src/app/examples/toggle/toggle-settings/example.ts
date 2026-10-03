import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ToggleComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ToggleComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleSettingsExample {
  protected readonly email = signal(true);
  protected readonly telemetry = signal(false);
}
