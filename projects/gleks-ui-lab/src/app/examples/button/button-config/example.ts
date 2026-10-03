import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonComponent, provideGogConfig } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent],
  // Usually in app.config.ts; here on the component, so it reaches only its own buttons.
  providers: [provideGogConfig({ control: { size: 'lg' }, button: { debounce: 1000 } })],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonConfigExample {
  protected readonly clicks = signal(0);
}
