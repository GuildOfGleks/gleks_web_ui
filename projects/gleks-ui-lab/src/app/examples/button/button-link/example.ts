import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GogButtonDirective } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [GogButtonDirective, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonLinkExample {}
