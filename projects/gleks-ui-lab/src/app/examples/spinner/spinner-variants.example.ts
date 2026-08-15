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
})
export class SpinnerVariantsExample {
  protected readonly variants: GogSpinnerVariant[] = ['runic', 'ring'];
}
