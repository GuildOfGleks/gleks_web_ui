import { ChangeDetectionStrategy, Component } from '@angular/core';
import { InputfieldComponent, GogFloatLabelVariant } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [InputfieldComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputfieldFloatLabelExample {
  protected readonly variants: readonly GogFloatLabelVariant[] = ['none', 'in', 'on', 'over'];
}
