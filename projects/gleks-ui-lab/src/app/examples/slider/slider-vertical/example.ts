import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { SliderComponent, type GogSliderRange } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [SliderComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderVerticalExample {
  protected readonly gain = signal(60);
  protected readonly band = signal<GogSliderRange>({ start: 30, end: 70 });
}
