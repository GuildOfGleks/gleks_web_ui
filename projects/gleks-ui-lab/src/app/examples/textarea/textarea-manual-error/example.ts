import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TextareaComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [TextareaComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextareaManualErrorExample {
  protected readonly feedback = signal('');
}
