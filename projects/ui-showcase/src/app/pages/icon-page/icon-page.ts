import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GogIconName, IconComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-icon-page',
  imports: [IconComponent],
  templateUrl: './icon-page.html',
  styleUrl: './icon-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconPage {
  protected readonly iconNames: GogIconName[] = [
    'check',
    'close',
    'chevron-up',
    'chevron-down',
    'chevron-left',
    'chevron-right',
    'calendar',
    'clock',
    'sort',
    'sort-up',
    'sort-down',
    'success',
    'error',
    'warning',
    'info',
    'checkbox',
    'checkbox-checked',
    'eye',
    'eye-off',
    'copy',
  ];
}
