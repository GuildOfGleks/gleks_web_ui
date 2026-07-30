import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GogIconName, GogSize, GogTagShape, GogTagVariant, TagComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-tag-page',
  imports: [TagComponent],
  templateUrl: './tag-page.html',
  styleUrl: './tag-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagPage {
  protected readonly variants: GogTagVariant[] = ['success', 'danger', 'warning', 'info'];
  protected readonly sizes: GogSize[] = ['sm', 'md', 'lg'];
  protected readonly shapes: GogTagShape[] = ['rounded', 'pill'];
  protected readonly variantIcons: Record<GogTagVariant, GogIconName> = {
    success: 'check',
    danger: 'error',
    warning: 'warning',
    info: 'info',
  };
}
