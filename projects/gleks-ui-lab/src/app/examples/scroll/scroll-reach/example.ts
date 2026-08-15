import { Component, signal } from '@angular/core';
import { GogScrollMetrics, ScrollComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [ScrollComponent],
})
export class ScrollReachExample {
  protected readonly reachState = signal('Scroll to see it fire.');
  protected readonly scrollTop = signal(0);
  protected readonly rows = Array.from({ length: 30 }, (_, index) => `Row ${index + 1}`);

  // Fires on every scroll and resize with the viewport's geometry — the same numbers a
  // "load more when near the end" check would use.
  protected onScroll(metrics: GogScrollMetrics): void {
    this.scrollTop.set(Math.round(metrics.scrollTop));
  }
}
