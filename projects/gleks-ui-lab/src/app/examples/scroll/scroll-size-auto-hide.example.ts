import { Component, signal } from '@angular/core';
import { ButtonComponent, ScrollComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, ScrollComponent],
  template: `
    <div class="controls">
      <gog-button
        size="sm"
        variant="outline"
        (gogClick)="size.set(size() === 'thin' ? 'normal' : 'thin')"
      >
        size: {{ size() }}
      </gog-button>
      <gog-button size="sm" variant="outline" (gogClick)="autoHide.set(!autoHide())">
        autoHide: {{ autoHide() }}
      </gog-button>
    </div>

    <gog-scroll [size]="size()" [autoHide]="autoHide()" class="box" ariaLabel="Rows">
      @for (row of rows; track row) {
        <p>{{ row }}</p>
      }
    </gog-scroll>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 16px;
    }
    .controls {
      display: flex;
      gap: 8px;
    }
    .box {
      display: block;
      height: 160px;
      border: 1px solid var(--gog-border-color);
      border-radius: var(--gog-radius);
      padding: 0 12px;
    }
  `,
})
export class ScrollSizeAutoHideExample {
  protected readonly size = signal<'normal' | 'thin'>('normal');
  // With autoHide off the thumb is always visible; on, it fades after `hideDelay`.
  protected readonly autoHide = signal(true);

  protected readonly rows = Array.from({ length: 30 }, (_, index) => `Row ${index + 1}`);
}
