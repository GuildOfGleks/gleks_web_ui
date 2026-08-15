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
export class SkeletonAnimationsExample {
  protected readonly animations: GogSkeletonAnimation[] = ['pulse', 'wave', 'none'];
}
