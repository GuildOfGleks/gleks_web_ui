import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { SliderComponent, type GogSliderRange } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [SliderComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderRangeExample {
  protected readonly price = signal<GogSliderRange>({ start: 40, end: 120 });
  protected readonly changes = signal(0);
}
