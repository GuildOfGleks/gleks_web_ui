import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonComponent, GogTooltipDirective, provideGogConfig } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, GogTooltipDirective],
  // Usually in app.config.ts; here on the component, so it reaches only its own tooltips.
  providers: [provideGogConfig({ tooltip: { position: 'bottom', showDelay: 0, hideDelay: 100 } })],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipConfigExample {}
