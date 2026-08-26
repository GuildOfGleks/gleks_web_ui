import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  CardComponent,
  GogCardHeaderDirective,
  GogSize,
  GogSurfaceVariant,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [CardComponent, GogCardHeaderDirective],
  templateUrl: './example.html',
  styleUrl: './example.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardVariantsExample {
  protected readonly variants: readonly GogSurfaceVariant[] = ['outlined', 'elevated', 'filled'];
  protected readonly sizes: readonly GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
}
