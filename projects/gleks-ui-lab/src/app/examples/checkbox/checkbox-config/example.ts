import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CheckboxComponent, provideGogConfig } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [CheckboxComponent],
  // Usually in app.config.ts; here on the component, so it reaches only its own checkboxes.
  providers: [provideGogConfig({ control: { size: 'lg' } })],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxConfigExample {}
