import { Component } from '@angular/core';
import { ChipComponent, GogTooltipDirective } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ChipComponent, GogTooltipDirective],
  template: `
    <button gogTooltip="Save changes">Save</button>
    <gog-chip [gogTooltip]="hint">Draft</gog-chip>
  `,
})
export class TooltipOverviewExample {
  protected readonly hint = 'Not visible to anyone else yet';
}
