import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TextareaComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [TextareaComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextareaClearableExample {
  protected readonly longText = [
    'A first line long enough to run the whole width of the field and reach its end edge.',
    'Second line.',
    'Third line.',
    'Fourth line.',
    'Fifth line.',
    'Sixth line.',
  ].join('\n');
}
