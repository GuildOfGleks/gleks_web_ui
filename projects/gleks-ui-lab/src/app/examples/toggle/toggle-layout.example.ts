import { Component, signal } from '@angular/core';
import { ToggleComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ToggleComponent],
  template: `
    <gog-toggle label="Label after the switch" [(checked)]="compactMode" />
    <gog-toggle label="Label before it" labelPosition="start" [(checked)]="labelStart" />
    <gog-toggle label="Full width" [fullWidth]="true" [(checked)]="compactMode" />
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
      max-width: 420px;
    }
  `,
})
export class ToggleLayoutExample {
  protected readonly compactMode = signal(false);
  protected readonly labelStart = signal(true);
}
