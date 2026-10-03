import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ToggleComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ToggleComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleOverviewExample {
  protected readonly notifications = signal(true);
}
