import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonComponent, GogRippleDirective } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, GogRippleDirective],
  templateUrl: './example.html',
  styleUrl: './example.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RippleOptionsExample {
  protected readonly centred = signal(false);
  protected readonly disabled = signal(false);

  protected toggleCentred(): void {
    this.centred.update((v) => !v);
  }

  protected toggleDisabled(): void {
    this.disabled.update((v) => !v);
  }
}
