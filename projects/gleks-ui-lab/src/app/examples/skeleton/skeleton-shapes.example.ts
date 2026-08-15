import { Component } from '@angular/core';
import { SkeletonComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [SkeletonComponent],
  template: `
    <gog-skeleton shape="text" [lines]="3" style="width: 220px" />
    <gog-skeleton shape="circle" size="lg" />
    <gog-skeleton shape="rect" size="sm" />
  `,
})
export class SkeletonShapesExample {}
