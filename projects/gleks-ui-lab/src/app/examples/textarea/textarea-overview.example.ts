import { Component, signal } from '@angular/core';
import { TextareaComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [TextareaComponent],
  template: `<gog-textarea label="Bio" placeholder="Tell us about yourself" [(value)]="bio" />`,
})
export class TextareaOverviewExample {
  protected readonly bio = signal('');
}
