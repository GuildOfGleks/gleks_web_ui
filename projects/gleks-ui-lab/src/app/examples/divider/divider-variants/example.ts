import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DividerComponent, GogDividerVariant } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [DividerComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DividerVariantsExample {
  protected readonly variants: GogDividerVariant[] = ['solid', 'dashed', 'dotted'];
}
