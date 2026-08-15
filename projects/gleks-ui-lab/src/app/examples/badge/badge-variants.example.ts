import { Component } from '@angular/core';
import { ButtonComponent, GogBadgeDirective, GogTagVariant } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, GogBadgeDirective],
  template: `
    @for (variantOption of variants; track variantOption) {
      <gog-button gogBadge="7" [badgeVariant]="variantOption">{{ variantOption }}</gog-button>
    }
  `,
})
export class BadgeVariantsExample {
  protected readonly variants: GogTagVariant[] = ['success', 'danger', 'warning', 'info'];
}
