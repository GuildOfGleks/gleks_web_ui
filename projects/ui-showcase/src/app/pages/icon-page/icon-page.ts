import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  ChipComponent,
  GogBuiltinIconName,
  ICON_DEFS,
  IconComponent,
  TagComponent,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-icon-page',
  imports: [IconComponent, TagComponent, ChipComponent],
  templateUrl: './icon-page.html',
  styleUrl: './icon-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconPage {
  /**
   * Read off `ICON_DEFS` rather than hand-listed: a literal array here silently stopped showing
   * the whole set the moment the library gained a glyph, which is exactly what happened before.
   * `ICON_DEFS` is keyed by `GogBuiltinIconName`, so this stays the shipped set — registered
   * icons are demonstrated separately below.
   */
  protected readonly iconNames = Object.keys(ICON_DEFS) as GogBuiltinIconName[];
}
