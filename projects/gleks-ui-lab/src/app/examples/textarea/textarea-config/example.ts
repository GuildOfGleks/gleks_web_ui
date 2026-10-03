import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TextareaComponent, provideGogConfig } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [TextareaComponent],
  // Usually in app.config.ts; here on the component, so it reaches only its own fields.
  providers: [
    provideGogConfig({
      control: { size: 'lg', clearable: true },
      floatLabel: { variant: 'over' },
      textarea: { resize: 'none' },
    }),
  ],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextareaConfigExample {}
