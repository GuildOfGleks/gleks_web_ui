import { Component } from '@angular/core';
import { ScrollComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [ScrollComponent],
})
export class ScrollOverviewExample {
  protected readonly items = Array.from({ length: 30 }, (_, i) => `Row ${i + 1}`);
}
