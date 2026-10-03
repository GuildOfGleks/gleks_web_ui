import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonComponent, IconComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, IconComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonIconsExample {}
