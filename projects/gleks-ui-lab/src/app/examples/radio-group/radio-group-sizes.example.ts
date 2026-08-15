import { Component, signal } from '@angular/core';
import { GogSize, RadioGroupComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [RadioGroupComponent],
  template: `
    @for (sizeOption of sizes; track sizeOption) {
      <gog-radio-group [size]="sizeOption" [options]="planOptions" [(value)]="sizeValue" />
    }
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
export class RadioGroupSizesExample {
  protected readonly planOptions = [
    { id: 'monthly', label: 'Monthly' },
    { id: 'yearly', label: 'Yearly' },
  ];

  protected readonly sizeValue = signal<string | null>('monthly');
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
}
