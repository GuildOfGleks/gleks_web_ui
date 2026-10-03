import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ToggleComponent, provideGogConfig } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ToggleComponent],
  // Usually in app.config.ts; here on the component, so it reaches only its own toggles.
  providers: [provideGogConfig({ control: { size: 'lg' } })],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleConfigExample {}
