import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AvatarComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [AvatarComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarInitialsExample {
  protected readonly names = [
    'Ada King Lovelace',
    'grace hopper',
    'Plato',
    'Émilie du Châtelet',
    '🦊 Fox',
  ];
}
