import { Component, signal } from '@angular/core';
import { SliderComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [SliderComponent],
})
export class SliderLabelingExample {
  protected readonly hiddenValue = signal(60);
  protected readonly ariaOnlyValue = signal(50);
}
