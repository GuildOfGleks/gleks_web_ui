import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  AvatarComponent,
  ButtonComponent,
  GogMenuItemDirective,
  GogMenuTriggerDirective,
  IconComponent,
  MenuComponent,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [
    AvatarComponent,
    ButtonComponent,
    GogMenuItemDirective,
    GogMenuTriggerDirective,
    IconComponent,
    MenuComponent,
  ],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarDecorativeExample {}
