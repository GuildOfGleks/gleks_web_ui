import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SliderComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [SliderComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderAriaLabelExample {}
