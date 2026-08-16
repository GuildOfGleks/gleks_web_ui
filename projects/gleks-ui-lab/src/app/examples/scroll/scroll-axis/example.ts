import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ScrollComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ScrollComponent],
  templateUrl: './example.html',
  styleUrl: './example.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollAxisExample {
  protected readonly items = Array.from({ length: 20 }, (_, i) => `Column ${i + 1}`);
}
