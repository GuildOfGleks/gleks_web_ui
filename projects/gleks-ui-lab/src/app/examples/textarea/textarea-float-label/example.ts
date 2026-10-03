import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TextareaComponent, type GogFloatLabelVariant } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [TextareaComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextareaFloatLabelExample {
  protected readonly variants: readonly GogFloatLabelVariant[] = ['none', 'in', 'on', 'over'];
}
