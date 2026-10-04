import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DividerComponent, IconComponent, TagComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [DividerComponent, IconComponent, TagComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DividerLabelsExample {}
