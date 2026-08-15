import { Component } from '@angular/core';
import { GogTagIconDirective, IconComponent, TagComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [TagComponent, IconComponent, GogTagIconDirective],
})
export class TagCustomIconExample {}
