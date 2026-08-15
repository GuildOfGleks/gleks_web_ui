import { Component, signal } from '@angular/core';
import { GogSliderRange, SliderComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [SliderComponent],
})
export class SliderOneSidedExample {
  // The floor is pinned at 0; only the ceiling moves. `disabled` would freeze both.
  protected readonly cappedRange = signal<GogSliderRange>({ start: 0, end: 60 });
}
