import { Component } from '@angular/core';
import { ScrollComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ScrollComponent],
  template: `
    <gog-scroll axis="both" class="box" ariaLabel="Grid">
      <!-- Wider and taller than the box, so both bars have something to do. -->
      <div class="grid">
        @for (cell of cells; track cell) {
          <span class="cell">{{ cell }}</span>
        }
      </div>
    </gog-scroll>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 16px;
    }
    .box {
      height: 160px;
      width: 320px;
      border: 1px solid var(--gog-border-color);
      border-radius: var(--gog-radius);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(8, 90px);
      gap: 8px;
      padding: 8px;
    }
    .cell {
      padding: 12px 8px;
      border-radius: var(--gog-radius);
      background: var(--gog-hover-color);
      font-size: var(--gog-text-sm);
      text-align: center;
    }
  `,
})
export class ScrollAxisExample {
  protected readonly cells = Array.from({ length: 40 }, (_, index) => `Cell ${index + 1}`);
}
