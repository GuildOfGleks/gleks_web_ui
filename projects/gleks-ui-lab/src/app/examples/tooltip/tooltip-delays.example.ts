import { Component } from '@angular/core';
import { ButtonComponent, GogTooltipDirective } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, GogTooltipDirective],
  template: `
    <gog-button gogTooltip="Appears at once" [gogTooltipShowDelay]="0">No delay</gog-button>
    <gog-button gogTooltip="Never shown" [gogTooltipDisabled]="true">Disabled</gog-button>
  `,
})
export class TooltipDelaysExample {}
