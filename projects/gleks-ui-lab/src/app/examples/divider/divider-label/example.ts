import { Component } from '@angular/core';
import { DividerComponent, IconComponent, TagComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [DividerComponent, IconComponent, TagComponent],
})
export class DividerLabelExample {}
