import { Component } from '@angular/core';
import { ButtonComponent, GogTooltipDirective, TagComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, TagComponent, GogTooltipDirective],
  template: `
    <ng-template #richHint>
      <strong>Deployment blocked</strong>
      <p>Two checks are still running. <gog-tag variant="warning">CI</gog-tag></p>
    </ng-template>

    <gog-button [gogTooltip]="richHint">Deploy</gog-button>
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
export class TooltipTemplateExample {}
