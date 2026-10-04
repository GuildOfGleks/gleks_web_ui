import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonComponent, GogBadgeDirective, IconComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, GogBadgeDirective, IconComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeDotExample {}
