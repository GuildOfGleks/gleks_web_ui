import { Component, signal } from '@angular/core';
import { ProgressbarComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ProgressbarComponent],
  template: `
    <gog-progressbar [value]="uploaded()" [showValue]="true" ariaLabel="Upload progress" />
  `,
})
export class ProgressbarShowValueExample {
  protected readonly uploaded = signal(42);
}
