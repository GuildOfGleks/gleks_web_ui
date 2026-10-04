import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EmptyStateComponent, GogEmptyStateMediaDirective, CardComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [CardComponent, EmptyStateComponent, GogEmptyStateMediaDirective],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateMediaExample {}
