import { Component, signal } from '@angular/core';
import {
  ButtonComponent,
  CollapsibleComponent,
  GogCollapsibleContentDirective,
  GogCollapsibleTriggerDirective,
  IconComponent,
  InputfieldComponent,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [
    ButtonComponent,
    CollapsibleComponent,
    GogCollapsibleTriggerDirective,
    GogCollapsibleContentDirective,
    IconComponent,
    InputfieldComponent,
  ],
})
export class CollapsibleFocusOutExample {
  protected readonly open = signal(false);
  protected readonly keyword = signal('');
}
