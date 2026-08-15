import { Component, signal } from '@angular/core';
import { CheckboxComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [CheckboxComponent],
  template: `
    <gog-checkbox label="I agree" [(checked)]="agreed" />
    <p class="readout">Checked: {{ agreed() }}</p>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
    .readout {
      margin: 0;
      color: var(--gog-muted-text-color);
      font-size: 0.9em;
    }
  `,
})
export class CheckboxOverviewExample {
  protected readonly agreed = signal(false);
}
