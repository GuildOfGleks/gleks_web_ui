import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CardComponent, GogCardHeaderDirective, GogSize } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [CardComponent, GogCardHeaderDirective],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardSizesExample {
  protected readonly sizes: readonly GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
}
