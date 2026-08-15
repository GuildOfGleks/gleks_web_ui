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
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
      max-width: 420px;
    }
  `,
})
export class SkeletonLinesExample {}
