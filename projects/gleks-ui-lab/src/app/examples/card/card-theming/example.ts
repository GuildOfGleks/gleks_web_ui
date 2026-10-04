import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CardComponent, GogCardHeaderDirective } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [CardComponent, GogCardHeaderDirective],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardThemingExample {}
