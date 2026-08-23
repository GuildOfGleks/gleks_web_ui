import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  ButtonComponent,
  GogBadgeDirective,
  GogPanelHeaderDirective,
  GogRippleDirective,
  PanelComponent,
} from '@guildofgleks/ui';

import { RippleScope } from './ripple-scope';

@Component({
  selector: 'app-ripple-page',
  imports: [
    ButtonComponent,
    GogBadgeDirective,
    GogPanelHeaderDirective,
    GogRippleDirective,
    PanelComponent,
    RippleScope,
  ],
  templateUrl: './ripple-page.html',
  styleUrl: './ripple-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RipplePage {
  protected readonly disabled = signal(false);
  protected readonly centred = signal(false);

  protected toggleDisabled(): void {
    this.disabled.update((value) => !value);
  }

  protected toggleCentred(): void {
    this.centred.update((value) => !value);
  }
}
