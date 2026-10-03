import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonComponent, GogSize, GogVariant } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonVariantsExample {
  protected readonly variants: readonly GogVariant[] = ['primary', 'secondary', 'outline', 'ghost'];
  protected readonly sizes: readonly GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
}
