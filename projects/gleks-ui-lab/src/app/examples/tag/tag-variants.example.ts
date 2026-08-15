import { Component } from '@angular/core';
import { GogTagVariant, TagComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [TagComponent],
  template: `
    @for (variantOption of variants; track variantOption) {
      <gog-tag [variant]="variantOption" [iconName]="variantIcons[variantOption]">
        Example
      </gog-tag>
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
export class TagVariantsExample {
  protected readonly variants: GogTagVariant[] = ['success', 'danger', 'warning', 'info'];
  protected readonly variantIcons: Record<GogTagVariant, string> = {
    success: 'check',
    danger: 'error',
    warning: 'warning',
    info: 'info',
  };
}
