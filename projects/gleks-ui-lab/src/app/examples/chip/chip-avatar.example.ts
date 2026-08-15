import { Component } from '@angular/core';
import { ChipComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ChipComponent],
  template: `
    <gog-chip avatarUrl="https://i.pravatar.cc/64" avatarAlt="Jane Doe">Jane Doe</gog-chip>
  `,
})
export class ChipAvatarExample {}
