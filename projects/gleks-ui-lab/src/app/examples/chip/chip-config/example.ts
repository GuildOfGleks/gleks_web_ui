import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ChipComponent, provideGogConfig } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ChipComponent],
  // Usually in app.config.ts; here on the component, so it reaches only its own chips.
  providers: [provideGogConfig({ ripple: { enabled: true } })],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipConfigExample {}
