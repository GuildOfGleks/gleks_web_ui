import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GogTabHeaderDirective, TabComponent, TabsComponent, TagComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [GogTabHeaderDirective, TabComponent, TabsComponent, TagComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsHeaderExample {}
