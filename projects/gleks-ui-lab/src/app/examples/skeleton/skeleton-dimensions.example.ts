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
export class SkeletonDimensionsExample {}
