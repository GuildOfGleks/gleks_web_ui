import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  AvatarComponent,
  AvatarGroupComponent,
  CardComponent,
  GogCardHeaderDirective,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [AvatarComponent, AvatarGroupComponent, CardComponent, GogCardHeaderDirective],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarGroupSurfaceExample {
  protected readonly people = ['Ana Petrova', 'Jonas Berg', 'Lea Novak', 'Tomas Ruiz'];
}
