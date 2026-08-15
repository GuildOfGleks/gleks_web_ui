import { Component } from '@angular/core';
import { GogProgressbarVariant, ProgressbarComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ProgressbarComponent],
  template: `
    @for (variantOption of variants; track variantOption) {
      <gog-progressbar [variant]="variantOption" [value]="65" [ariaLabel]="variantOption" />
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
export class ProgressbarVariantsExample {
  protected readonly variants: GogProgressbarVariant[] = [
    'accent',
    'success',
    'danger',
    'warning',
    'info',
  ];
}
