import { Component } from '@angular/core';
import { IconComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [IconComponent],
  template: `
    <gog-icon [template]="customDot" />

    <ng-template #customDot>
      <span
        style="width: 1em; height: 1em; border-radius: 50%; background: currentColor; display: block;"
      ></span>
    </ng-template>
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
export class IconCustomTemplateExample {}
