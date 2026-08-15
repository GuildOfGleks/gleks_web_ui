import { Component } from '@angular/core';
import { SkeletonComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [SkeletonComponent],
  template: `
    <gog-skeleton shape="text" [lines]="1" />
    <gog-skeleton shape="text" [lines]="3" />
    <gog-skeleton shape="text" [lines]="5" size="sm" />
  `,
})
export class SkeletonLinesExample {}
