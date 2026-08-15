import { Component, signal } from '@angular/core';
import { SliderComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [SliderComponent],
})
export class SliderOverviewExample {
  protected readonly volume = signal(45);
}
