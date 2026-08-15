import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonComponent, IconComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- No visible label, so ariaLabel is required: it lands on the inner <button>, which a
         plain aria-label attribute on <gog-button> would not. -->
    <gog-button variant="primary" ariaLabel="Confirm">
      <gog-icon name="check" />
    </gog-button>
    <gog-button variant="outline" ariaLabel="Dismiss">
      <gog-icon name="close" />
    </gog-button>
    <gog-button variant="ghost" size="sm" ariaLabel="More info">
      <gog-icon name="info" />
    </gog-button>
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
  `,
})
export class ButtonIconOnlyExample {}
