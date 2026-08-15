import { Component } from '@angular/core';
import { SkeletonComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [SkeletonComponent],
  template: `<gog-skeleton shape="text" [lines]="3" style="width: 220px" />`,
})
export class SkeletonOverviewExample {}
