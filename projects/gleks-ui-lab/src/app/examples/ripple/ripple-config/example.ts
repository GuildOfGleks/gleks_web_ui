import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  ButtonComponent,
  ChipComponent,
  GogRippleDirective,
  provideGogConfig,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, ChipComponent, GogRippleDirective],
  // Usually in app.config.ts; here on the component, so only these components ripple.
  providers: [provideGogConfig({ ripple: { enabled: true } })],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RippleConfigExample {}
