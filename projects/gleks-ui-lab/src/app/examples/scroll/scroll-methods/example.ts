import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { ButtonComponent, ScrollComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, ScrollComponent],
  templateUrl: './example.html',
  styleUrl: './example.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollMethodsExample {
  protected readonly scroller = viewChild<ScrollComponent>('scrollRegion');

  protected readonly items = Array.from({ length: 30 }, (_, i) => `Row ${i + 1}`);
}
