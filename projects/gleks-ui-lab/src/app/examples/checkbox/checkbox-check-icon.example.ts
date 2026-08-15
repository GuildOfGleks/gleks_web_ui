import { Component } from '@angular/core';
import { CheckboxComponent, GogCheckboxIconDirective, IconComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [CheckboxComponent, GogCheckboxIconDirective, IconComponent],
  template: `
    <gog-checkbox label="Custom mark" [checked]="true">
      <ng-template gogCheckboxIcon>
        <gog-icon name="close" />
      </ng-template>
    </gog-checkbox>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
      max-width: 420px;
    }
  `,
})
export class CheckboxCheckIconExample {}
