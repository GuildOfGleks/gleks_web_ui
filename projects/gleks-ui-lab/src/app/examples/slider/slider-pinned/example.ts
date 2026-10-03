import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { SliderComponent, type GogSliderRange } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [SliderComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderPinnedExample {
  protected readonly floorPinned = signal<GogSliderRange>({ start: 20, end: 60 });
  protected readonly ceilingPinned = signal<GogSliderRange>({ start: 20, end: 60 });
}
