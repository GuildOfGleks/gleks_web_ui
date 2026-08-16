import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { GogScrollMetrics, ScrollComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ScrollComponent, DecimalPipe],
  templateUrl: './example.html',
  styleUrl: './example.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollReachExample {
  protected readonly reachState = signal(
    'Scroll to the edges to see gogReachStart / gogReachEnd fire.',
  );
  protected readonly lastMetrics = signal<GogScrollMetrics | null>(null);

  protected readonly items = Array.from({ length: 30 }, (_, i) => `Row ${i + 1}`);

  protected onScroll(metrics: GogScrollMetrics): void {
    this.lastMetrics.set(metrics);
  }
}
