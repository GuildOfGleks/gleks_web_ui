import { Component } from '@angular/core';
import { GogSpinnerVariant, SpinnerComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [SpinnerComponent],
  template: `
    @for (variantOption of variants; track variantOption) {
      <gog-spinner
        [variant]="variantOption"
        size="lg"
        [ariaLabel]="'Loading, ' + variantOption + ' variant'"
      />
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
    }
  `,
})
export class SpinnerVariantsExample {
  protected readonly variants: GogSpinnerVariant[] = ['runic', 'ring'];
}
