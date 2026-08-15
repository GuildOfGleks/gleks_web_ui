import { Component } from '@angular/core';
import { DividerComponent, GogDividerVariant } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [DividerComponent],
  template: `
    @for (variantOption of variants; track variantOption) {
      <gog-divider [variant]="variantOption" />
    }
  `,
})
export class DividerVariantsExample {
  protected readonly variants: GogDividerVariant[] = ['solid', 'dashed', 'dotted'];
}
