import { Component } from '@angular/core';
import { GogTabContentDirective, TabComponent, TabsComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [TabsComponent, TabComponent, GogTabContentDirective],
})
export class TabsLazyExample {}
