import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  EmptyStateComponent,
  GogEmptyStateActionsDirective,
  ButtonComponent,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, EmptyStateComponent, GogEmptyStateActionsDirective],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateOverviewExample {}
