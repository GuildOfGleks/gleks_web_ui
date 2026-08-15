import { Component, signal } from '@angular/core';
import {
  ButtonComponent,
  CollapsibleComponent,
  GogCollapsibleContentDirective,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [ButtonComponent, CollapsibleComponent, GogCollapsibleContentDirective],
})
export class CollapsibleControlledExample {
  protected readonly open = signal(false);
}
