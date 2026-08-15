import { Component, signal } from '@angular/core';
import { GogSliderRange, SliderComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [SliderComponent],
  template: `
    <gog-slider
      label="Price"
      [range]="true"
      [(rangeValue)]="priceRange"
      [min]="0"
      [max]="100"
      startAriaLabel="Lowest price"
      endAriaLabel="Highest price"
    />
  `,
})
export class SliderRangeExample {
  // `range` and `[(value)]` are mutually exclusive — with range on, `value` is ignored.
  protected readonly priceRange = signal<GogSliderRange>({ start: 20, end: 70 });
}
