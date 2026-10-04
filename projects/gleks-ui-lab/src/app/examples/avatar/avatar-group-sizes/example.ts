import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AvatarComponent, AvatarGroupComponent, type GogSize } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [AvatarComponent, AvatarGroupComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarGroupSizesExample {
  protected readonly sizes: readonly GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
  /** 140 people: the +N draws 99+, and its name keeps the exact count. */
  protected readonly members = Array.from({ length: 140 }, (_, i) => `Member ${i + 1}`);
}
