import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonComponent, SliderComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, SliderComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderClampExample {
  protected readonly level = signal(150);
}
