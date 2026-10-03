import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SliderComponent, type GogSliderRange } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ReactiveFormsModule, SliderComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderThumbsMeetExample {
  /** Both thumbs on top of each other at max: drag left and the start thumb comes away. */
  protected readonly control = new FormControl<GogSliderRange>(
    { start: 200, end: 200 },
    { nonNullable: true },
  );
}
