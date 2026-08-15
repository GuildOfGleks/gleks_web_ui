import { Component, signal } from '@angular/core';
import { GogScrollMetrics, ScrollComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ScrollComponent],
  template: `
    <gog-scroll
      style="height: 160px"
      [reachThreshold]="8"
      (gogReachStart)="reachState.set('At the top')"
      (gogReachEnd)="reachState.set('At the bottom')"
      (gogScroll)="onScroll($event)"
    >
      …
    </gog-scroll>
  `,
})
export class ScrollReachExample {
  protected readonly reachState = signal('Scroll to see it fire.');

  protected onScroll(metrics: GogScrollMetrics): void {
    console.log(metrics.scrollTop, metrics.scrollHeight);
  }
}
