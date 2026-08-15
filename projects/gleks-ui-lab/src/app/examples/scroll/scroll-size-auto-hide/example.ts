import { Component, signal } from '@angular/core';
import { ButtonComponent, ScrollComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [ButtonComponent, ScrollComponent],
})
export class ScrollSizeAutoHideExample {
  protected readonly size = signal<'normal' | 'thin'>('normal');
  // With autoHide off the thumb is always visible; on, it fades after `hideDelay`.
  protected readonly autoHide = signal(true);

  protected readonly rows = Array.from({ length: 30 }, (_, index) => `Row ${index + 1}`);
}
