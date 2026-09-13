import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AlertComponent, ButtonComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [AlertComponent, ButtonComponent],
  templateUrl: './example.html',
  styleUrl: './example.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertLiveExample {
  /** Both messages appear in response to a press, which is the case the severity default is for. */
  protected readonly saveFailed = signal(false);
  protected readonly exported = signal(false);
}
