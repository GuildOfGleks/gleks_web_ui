import { ChangeDetectionStrategy, Component } from '@angular/core';
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
export class CollapsibleStatesExample {
  protected readonly states = [
    { name: 'Closed', open: false, disabled: false },
    { name: 'Open', open: true, disabled: false },
    { name: 'Disabled', open: false, disabled: true },
  ];
}
