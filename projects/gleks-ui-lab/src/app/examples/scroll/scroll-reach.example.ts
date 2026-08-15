import { Component, signal } from '@angular/core';
import { GogScrollMetrics, ScrollComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ScrollComponent],
  template: `
    <gog-scroll
      class="box"
      ariaLabel="Rows"
      [reachThreshold]="8"
      (gogReachStart)="reachState.set('At the top')"
      (gogReachEnd)="reachState.set('At the bottom — this is where you would load more')"
      (gogScroll)="onScroll($event)"
    >
      @for (row of rows; track row) {
        <p>{{ row }}</p>
      }
    </gog-scroll>

    <div class="readout">
      <span>{{ reachState() }}</span>
      <span>scrollTop: {{ scrollTop() }}</span>
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 16px;
    }
    gog-scroll p {
      margin: 0;
      padding: 8px 0;
      border-bottom: 1px solid var(--gog-border-color);
    }
    .readout {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 8px;
      color: var(--gog-muted-text-color);
      font-size: 0.9em;
    }
    .box {
      height: 160px;
      border: 1px solid var(--gog-border-color);
      border-radius: var(--gog-radius);
      padding: 0 12px;
    }
  `,
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
