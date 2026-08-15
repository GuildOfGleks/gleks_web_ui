import { Component } from '@angular/core';
import { SkeletonComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [SkeletonComponent],
  template: `
    <gog-skeleton shape="rect" width="100%" height="64px" />
    <gog-skeleton shape="circle" width="56px" />
    <gog-skeleton shape="rect" [rounded]="false" />
  `,
})
export class SkeletonDimensionsExample {}
