import { Component, signal } from '@angular/core';
import { GogSliderRange, SliderComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [SliderComponent],
})
export class SliderRangeExample {
  // `range` and `[(value)]` are mutually exclusive — with range on, `value` is ignored.
  protected readonly priceRange = signal<GogSliderRange>({ start: 20, end: 70 });
}
