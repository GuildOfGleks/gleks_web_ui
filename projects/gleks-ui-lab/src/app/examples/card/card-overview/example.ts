import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CardComponent, GogCardHeaderDirective } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [CardComponent, GogCardHeaderDirective],
  templateUrl: './example.html',
  styleUrl: './example.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardOverviewExample {}
