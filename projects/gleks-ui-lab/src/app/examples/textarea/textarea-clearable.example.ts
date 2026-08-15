import { Component, signal } from '@angular/core';
import { TextareaComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [TextareaComponent],
  template: `<gog-textarea label="Notes" [clearable]="true" [(value)]="notes" />`,
})
export class TextareaClearableExample {
  protected readonly notes = signal('');
}
