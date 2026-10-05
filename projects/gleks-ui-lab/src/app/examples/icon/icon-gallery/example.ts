import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GogBuiltinIconName, ICON_DEFS, IconComponent } from '@guildofgleks/ui';

interface IconGroup {
  readonly title: string;
  readonly names: readonly GogBuiltinIconName[];
}

// Grouped by what a reader is looking for. ICON_DEFS is the source of the names, and "Other"
// catches any icon a later release adds that no group mentions yet, so none can go missing.
const GROUPS: readonly IconGroup[] = [
  {
    title: 'Chevrons & arrows',
    names: [
      'chevron-up',
      'chevron-down',
      'chevron-left',
      'chevron-right',
      'arrow-left',
      'arrow-right',
    ],
  },
  { title: 'Confirm & dismiss', names: ['check', 'close', 'checkbox', 'checkbox-checked'] },
  { title: 'Status', names: ['success', 'error', 'warning', 'info'] },
  { title: 'Sorting', names: ['sort', 'sort-up', 'sort-down', 'filter'] },
  {
    title: 'Actions',
    names: [
      'search',
      'plus',
      'minus',
      'trash',
      'pencil',
      'copy',
      'download',
      'upload',
      'refresh',
      'external-link',
    ],
  },
  { title: 'Chrome', names: ['menu', 'more-horizontal', 'more-vertical', 'settings'] },
  {
    title: 'Objects & state',
    names: ['user', 'lock', 'mail', 'calendar', 'clock', 'eye', 'eye-off', 'star', 'star-filled'],
  },
  {
    title: 'Navigation & layout',
    names: [
      'home',
      'arrow-up',
      'arrow-down',
      'arrow-up-right',
      'chevrons-left',
      'chevrons-right',
      'chevrons-up-down',
      'log-in',
      'log-out',
      'grid',
      'list',
      'dashboard',
      'layers',
      'sliders',
      'drag',
      'maximize',
      'minimize',
      'zoom-in',
      'zoom-out',
    ],
  },
  {
    title: 'More actions',
    names: [
      'save',
      'share',
      'link',
      'send',
      'printer',
      'archive',
      'bookmark',
      'flag',
      'pin',
      'undo',
      'redo',
      'clipboard',
      'power',
    ],
  },
  {
    title: 'Files & media',
    names: [
      'file',
      'file-text',
      'folder',
      'folder-open',
      'paperclip',
      'image',
      'camera',
      'video',
      'mic',
      'play',
      'pause',
      'volume',
      'volume-off',
      'cloud',
      'database',
      'code',
      'terminal',
    ],
  },
  {
    title: 'Communication',
    names: ['bell', 'bell-off', 'message', 'inbox', 'phone', 'at-sign', 'globe', 'map-pin'],
  },
  {
    title: 'People & status',
    names: [
      'users',
      'user-plus',
      'heart',
      'thumbs-up',
      'thumbs-down',
      'help',
      'ban',
      'shield',
      'shield-check',
      'key',
      'unlock',
      'history',
      'hourglass',
      'zap',
      'sparkles',
      'lightbulb',
    ],
  },
  {
    title: 'Commerce & data',
    names: [
      'shopping-cart',
      'credit-card',
      'wallet',
      'tag',
      'gift',
      'package',
      'truck',
      'building',
      'briefcase',
      'percent',
      'chart-bar',
      'chart-pie',
      'trending-up',
      'trending-down',
      'activity',
    ],
  },
  {
    title: 'Appearance & devices',
    names: ['sun', 'moon', 'monitor', 'smartphone', 'wifi', 'wifi-off', 'book-open'],
  },
];

function withOther(groups: readonly IconGroup[]): readonly IconGroup[] {
  const grouped = new Set(groups.flatMap((group) => group.names));
  const other = (Object.keys(ICON_DEFS) as GogBuiltinIconName[]).filter(
    (name) => !grouped.has(name),
  );
  return other.length === 0 ? groups : [...groups, { title: 'Other', names: other }];
}

@Component({
  selector: 'app-example',
  imports: [IconComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconGalleryExample {
  protected readonly groups = withOther(GROUPS);
}
