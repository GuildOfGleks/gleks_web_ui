import { Component } from '@angular/core';
import { ButtonComponent, GogTooltipDirective, GogTooltipPosition } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, GogTooltipDirective],
  template: `
    @for (position of positions; track position) {
      <gog-button [gogTooltip]="position" [gogTooltipPosition]="position">
        {{ position }}
      </gog-button>
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
export class TooltipPositionsExample {
  protected readonly positions: GogTooltipPosition[] = ['top', 'bottom', 'left', 'right'];
}
