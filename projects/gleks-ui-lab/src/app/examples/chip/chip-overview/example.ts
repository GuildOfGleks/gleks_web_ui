import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ChipComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ChipComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipOverviewExample {
  protected readonly lastClicked = signal('nothing yet');
}
