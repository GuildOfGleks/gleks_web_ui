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
export class DividerVariantsExample {
  protected readonly variants: GogDividerVariant[] = ['solid', 'dashed', 'dotted'];
}
