import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonComponent, GogVariant } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonPressExample {
  protected readonly variants: readonly GogVariant[] = ['primary', 'secondary', 'outline', 'ghost'];
}
