import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GogButtonDirective } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [GogButtonDirective, RouterLink],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonLinkExample {}
