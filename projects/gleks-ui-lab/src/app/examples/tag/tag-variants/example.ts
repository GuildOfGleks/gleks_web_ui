import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GogIconName, GogSize, GogTagVariant, TagComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [TagComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagVariantsExample {
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
  protected readonly variants: GogTagVariant[] = ['info', 'success', 'warning', 'danger'];
  // The icon each status reads best with — a pairing, not something the tag does itself.
  protected readonly variantIcons: Record<GogTagVariant, GogIconName> = {
    info: 'info',
    success: 'success',
    warning: 'warning',
    danger: 'error',
  };
}
