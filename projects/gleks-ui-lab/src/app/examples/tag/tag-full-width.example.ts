import { Component } from '@angular/core';
import { TagComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [TagComponent],
  template: `<gog-tag variant="info" [fullWidth]="true">Full width</gog-tag>`,
})
export class TagFullWidthExample {}
