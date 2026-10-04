import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  CardComponent,
  GogCardHeaderDirective,
  GogCardLinkDirective,
  GogSurfaceVariant,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [CardComponent, GogCardHeaderDirective, GogCardLinkDirective, RouterLink],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardVariantsExample {
  protected readonly variants: readonly GogSurfaceVariant[] = ['outlined', 'elevated', 'filled'];
  protected readonly states = ['at rest', 'disabled', 'loading'] as const;
}
