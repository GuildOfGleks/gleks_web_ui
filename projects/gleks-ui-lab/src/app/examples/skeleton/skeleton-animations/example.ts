import { Component } from '@angular/core';
import { GogSkeletonAnimation, SkeletonComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [SkeletonComponent],
})
export class SkeletonAnimationsExample {
  protected readonly animations: GogSkeletonAnimation[] = ['pulse', 'wave', 'none'];
}
