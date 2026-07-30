import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  GogIconName,
  GogSize,
  GogTagShape,
  GogTagVariant,
  IconComponent,
  TagComponent,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-tag-page',
  imports: [TagComponent, IconComponent],
  templateUrl: './tag-page.html',
  styleUrl: './tag-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagPage {
  protected readonly variants: GogTagVariant[] = ['success', 'danger', 'warning', 'info'];
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
  protected readonly shapes: GogTagShape[] = ['rounded', 'pill'];
  protected readonly variantIcons: Record<GogTagVariant, GogIconName> = {
    success: 'check',
    danger: 'error',
    warning: 'warning',
    info: 'info',
  };
}
