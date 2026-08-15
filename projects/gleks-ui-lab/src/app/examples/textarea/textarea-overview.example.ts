import { Component, signal } from '@angular/core';
import { TextareaComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [TextareaComponent],
  template: `
    <gog-textarea label="Bio" placeholder="Tell us about yourself" [(value)]="bio" />
    <p class="readout">Value: "{{ bio() }}"</p>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
      max-width: 420px;
    }
    .readout {
      margin: 0;
      color: var(--gog-muted-text-color);
      font-size: 0.9em;
    }
  `,
})
export class TextareaOverviewExample {
  protected readonly bio = signal('');
}
