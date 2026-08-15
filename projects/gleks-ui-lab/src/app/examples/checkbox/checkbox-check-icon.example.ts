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
})
export class CheckboxCheckIconExample {}
