import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  GogTagIconDirective,
  IconComponent,
  TagComponent,
  type GogIconName,
  type GogSize,
  type GogTagVariant,
} from '@guildofgleks/ui';

import { DocAttrs } from '../../doc/doc-attrs';
import { DocCell, DocMatrix } from '../../doc/doc-matrix';
import { DocPage } from '../../doc/doc-page';
import { DocSection } from '../../doc/doc-section';

@Component({
  selector: 'app-tag-page',
  imports: [
    GogTagIconDirective,
    IconComponent,
    TagComponent,
    DocAttrs,
    DocCell,
    DocMatrix,
    DocPage,
    DocSection,
  ],
  templateUrl: './tag-page.html',
  styleUrl: './tag-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagPage {
  protected readonly sizes: readonly GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
  protected readonly variants: readonly GogTagVariant[] = ['info', 'success', 'warning', 'danger'];
  protected readonly shapes = ['rounded', 'pill'] as const;

  /** The icon each status reads best with — a pairing, not something the tag does itself. */
  protected readonly variantIcons: Readonly<Record<GogTagVariant, GogIconName>> = {
    info: 'info',
    success: 'success',
    warning: 'warning',
    danger: 'error',
  };

  /** The single column of a matrix whose rows are the only axis. */
  protected readonly controlColumn = ['tag'] as const;

  protected readonly a11yStates = ['default', 'iconName="success"', 'gogTagIcon template'] as const;
}
