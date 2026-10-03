import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonToggleGroupComponent, provideGogConfig } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonToggleGroupComponent],
  // Usually in app.config.ts; here on the component, so it reaches only its own groups.
  providers: [provideGogConfig({ control: { size: 'lg' }, ripple: { enabled: true } })],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonToggleConfigExample {
  protected readonly alignments = [
    { id: 'left', name: 'Left' },
    { id: 'center', name: 'Center' },
    { id: 'right', name: 'Right' },
  ];
}
