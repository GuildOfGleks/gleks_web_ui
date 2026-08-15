import { Component } from '@angular/core';
import { DividerComponent, IconComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [DividerComponent, IconComponent],
})
export class DividerInsetExample {}
