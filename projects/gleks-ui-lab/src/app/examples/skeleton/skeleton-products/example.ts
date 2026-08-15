import { Component, signal } from '@angular/core';
import { SkeletonComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [SkeletonComponent],
})
export class SkeletonProductsExample {
  protected readonly loading = signal(true);
}
