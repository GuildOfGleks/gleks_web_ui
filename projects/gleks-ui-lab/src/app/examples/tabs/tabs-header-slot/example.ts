import { Component } from '@angular/core';
import { GogTabHeaderDirective, TabComponent, TabsComponent, TagComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [TabsComponent, TabComponent, GogTabHeaderDirective, TagComponent],
})
export class TabsHeaderSlotExample {}
