import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  DividerComponent,
  IconComponent,
  TagComponent,
  type GogDividerVariant,
} from '@guildofgleks/ui';

import { DocAttrs } from '../../doc/doc-attrs';
import { DocCell, DocMatrix } from '../../doc/doc-matrix';
import { DocPage } from '../../doc/doc-page';
import { DocSection } from '../../doc/doc-section';

@Component({
  selector: 'app-divider-page',
  imports: [
    DividerComponent,
    IconComponent,
    TagComponent,
    DocAttrs,
    DocCell,
    DocMatrix,
    DocPage,
    DocSection,
  ],
  templateUrl: './divider-page.html',
  styleUrl: './divider-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DividerPage {
  protected readonly variants: readonly GogDividerVariant[] = ['solid', 'dashed', 'dotted'];
  protected readonly labels = ['no label', 'OR'] as const;

  /** The single column of a matrix whose rows are the only axis. */
  protected readonly controlColumn = ['divider'] as const;

  protected readonly people = ['Ada Lovelace', 'Alan Turing', 'Grace Hopper'] as const;

  protected readonly a11yStates = ['horizontal', 'orientation="vertical"', 'with a label'] as const;
}
