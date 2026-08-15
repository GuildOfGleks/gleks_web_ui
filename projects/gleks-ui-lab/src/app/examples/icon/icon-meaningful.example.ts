import { Component } from '@angular/core';
import { IconComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [IconComponent],
  template: `<gog-icon name="warning" [ariaHidden]="false" title="Warning" />`,
})
export class IconMeaningfulExample {}
