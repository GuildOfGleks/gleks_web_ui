import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  ChipComponent,
  ICON_DEFS,
  IconComponent,
  TagComponent,
  type GogBuiltinIconName,
} from '@guildofgleks/ui';

import { DocAttrs } from '../../doc/doc-attrs';
import { DocCell, DocMatrix } from '../../doc/doc-matrix';
import { DocPage } from '../../doc/doc-page';
import { DocSection } from '../../doc/doc-section';
import { IconRegistryScope } from './icon-registry-scope';

interface Labelled<T> {
  readonly name: string;
  readonly value: T;
}

@Component({
  selector: 'app-icon-page',
  imports: [
    ChipComponent,
    IconComponent,
    TagComponent,
    DocAttrs,
    DocCell,
    DocMatrix,
    DocPage,
    DocSection,
    IconRegistryScope,
  ],
  templateUrl: './icon-page.html',
  styleUrl: './icon-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconPage {
  /**
   * Read off `ICON_DEFS` rather than hand-listed, so the gallery cannot fall behind the shipped
   * set. Keyed by `GogBuiltinIconName`: registered icons are shown separately.
   */
  protected readonly builtins = Object.keys(ICON_DEFS) as GogBuiltinIconName[];

  /** Font sizes the icon is placed in, since `--gog-icon-size` is `1.2em` by default. */
  protected readonly fontSizes: readonly Labelled<string>[] = [
    { name: 'font-size: 12px', value: '12px' },
    { name: 'font-size: 16px', value: '16px' },
    { name: 'font-size: 24px', value: '24px' },
    { name: 'font-size: 40px', value: '40px' },
  ];

  protected readonly strokeWidths: readonly Labelled<string>[] = [
    { name: '--gog-icon-stroke-width: 1', value: '1' },
    { name: 'unset (2)', value: '2' },
    { name: '--gog-icon-stroke-width: 3', value: '3' },
  ];

  /** The single column of a matrix whose rows are the only axis. */
  protected readonly controlColumn = ['icon'] as const;

  protected readonly a11yStates = [
    'default',
    '[ariaHidden]="false" title="Warning"',
    '[ariaHidden]="false", title unset',
    'unknown name',
  ] as const;
}
