import { Component } from '@angular/core';
import { GogBuiltinIconName, ICON_DEFS, IconComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [IconComponent],
})
export class IconGalleryExample {
  // Read off the library, never hand-copied: this list grew from 19 to 41 in one release,
  // and a literal array would have gone stale without anything failing.
  protected readonly iconNames = Object.keys(ICON_DEFS) as GogBuiltinIconName[];
}
