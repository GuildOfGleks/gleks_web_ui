import { Component, signal } from '@angular/core';
import { SliderComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [SliderComponent],
})
export class SliderFullWidthExample {
  protected readonly compactValue = signal(40);
}
