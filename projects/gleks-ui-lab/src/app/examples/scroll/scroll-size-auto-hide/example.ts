import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonComponent, GogScrollSize, ScrollComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, ScrollComponent],
  templateUrl: './example.html',
  styleUrl: './example.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollSizeAutoHideExample {
  protected readonly size = signal<GogScrollSize>('normal');
  protected readonly autoHide = signal(true);

  protected readonly items = Array.from({ length: 30 }, (_, i) => `Row ${i + 1}`);
}
