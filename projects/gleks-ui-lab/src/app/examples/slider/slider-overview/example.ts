import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { SliderComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [SliderComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderOverviewExample {
  protected readonly volume = signal(40);
  protected readonly changes = signal(0);
}
