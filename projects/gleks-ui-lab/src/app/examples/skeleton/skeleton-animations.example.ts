import { Component } from '@angular/core';
import { GogSkeletonAnimation, SkeletonComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [SkeletonComponent],
  template: `
    @for (animationOption of animations; track animationOption) {
      <gog-skeleton shape="rect" size="xsm" [animation]="animationOption" />
    }
  `,
})
export class SkeletonAnimationsExample {
  protected readonly animations: GogSkeletonAnimation[] = ['pulse', 'wave', 'none'];
}
