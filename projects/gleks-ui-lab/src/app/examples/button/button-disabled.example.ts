import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonComponent, GogVariant } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (variant of variants; track variant) {
      <gog-button [variant]="variant" [disabled]="true">{{ variant }}</gog-button>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
  `,
})
export class ButtonDisabledExample {
  protected readonly variants: GogVariant[] = ['primary', 'secondary', 'outline', 'ghost'];
}
