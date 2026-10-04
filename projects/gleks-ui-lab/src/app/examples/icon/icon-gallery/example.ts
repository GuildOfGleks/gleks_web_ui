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
