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
})
export class TooltipPositionsExample {
  protected readonly positions: GogTooltipPosition[] = ['top', 'bottom', 'left', 'right'];
}
