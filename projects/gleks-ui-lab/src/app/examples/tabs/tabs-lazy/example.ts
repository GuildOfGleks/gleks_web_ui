import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  GogTabContentDirective,
  InputfieldComponent,
  TabComponent,
  TabsComponent,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [GogTabContentDirective, InputfieldComponent, TabComponent, TabsComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsLazyExample {}
