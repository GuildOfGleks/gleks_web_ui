import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  CollapsibleComponent,
  GogButtonDirective,
  GogCollapsibleContentDirective,
  GogCollapsibleTriggerDirective,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [
    CollapsibleComponent,
    GogButtonDirective,
    GogCollapsibleContentDirective,
    GogCollapsibleTriggerDirective,
  ],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollapsibleHeightExample {
  protected readonly open = signal(false);
  protected readonly versions = [9, 8, 7, 6, 5, 4, 3, 2];
}
