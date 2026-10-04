import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GogPanelHeaderDirective, GogSurfaceVariant, PanelComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [GogPanelHeaderDirective, PanelComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelVariantsExample {
  protected readonly variants: readonly GogSurfaceVariant[] = ['elevated', 'outlined', 'filled'];
  protected readonly states = [
    { name: 'open', open: true, disabled: false, loading: false },
    { name: 'closed', open: false, disabled: false, loading: false },
    { name: 'disabled', open: false, disabled: true, loading: false },
    { name: 'loading', open: true, disabled: false, loading: true },
  ];
}
