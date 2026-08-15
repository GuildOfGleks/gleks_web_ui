import { Component } from '@angular/core';
import { ScrollComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [ScrollComponent],
})
export class ScrollAxisExample {
  protected readonly cells = Array.from({ length: 40 }, (_, index) => `Cell ${index + 1}`);
}
