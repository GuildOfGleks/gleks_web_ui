import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonComponent, GogSeverity, GogVariant } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonSeverityExample {
  protected readonly variants: readonly GogVariant[] = ['primary', 'secondary', 'outline', 'ghost'];
  protected readonly severities: readonly GogSeverity[] = ['success', 'danger', 'warning', 'info'];
}
