import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonComponent, GogSize, GogVariant } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (variant of variants; track variant) {
      <div class="row">
        <span class="row__label">{{ variant }}</span>
        @for (size of sizes; track size) {
          <gog-button [variant]="variant" [size]="size">{{ size }}</gog-button>
        }
      </div>
    }
  `,
  styles: `
    .row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 12px;
    }
    .row__label {
      width: 90px;
      color: var(--gog-muted-text-color);
      font-size: var(--gog-text-sm);
    }
  `,
})
export class ButtonVariantsExample {
  protected readonly variants: GogVariant[] = ['primary', 'secondary', 'outline', 'ghost'];
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
}
