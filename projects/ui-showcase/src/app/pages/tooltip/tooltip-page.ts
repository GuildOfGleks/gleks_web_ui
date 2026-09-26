import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  GogButtonDirective,
  GogTooltipDirective,
  type GogTooltipPosition,
} from '@guildofgleks/ui';

import { DocAttrs } from '../../doc/doc-attrs';
import { DocCell, DocMatrix } from '../../doc/doc-matrix';
import { DocPage } from '../../doc/doc-page';
import { DocSection } from '../../doc/doc-section';
import { TOOLTIP_SCOPE_CONFIG, TooltipConfigScope } from './tooltip-config-scope';

@Component({
  selector: 'app-tooltip-page',
  imports: [
    JsonPipe,
    GogButtonDirective,
    GogTooltipDirective,
      DocAttrs,
    DocCell,
    DocMatrix,
    DocPage,
    DocSection,
    TooltipConfigScope,
  ],
  templateUrl: './tooltip-page.html',
  styleUrl: './tooltip-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipPage {
  protected readonly positions: readonly GogTooltipPosition[] = [
    'auto',
    'top',
    'bottom',
    'left',
    'right',
  ];

  /** The single column of a matrix whose rows are the only axis. */
  protected readonly controlColumn = ['trigger'] as const;

  protected readonly muted = signal(false);

  protected readonly scopeConfig = TOOLTIP_SCOPE_CONFIG;
  protected readonly scopeAxis = ['outside scope', 'inside scope'] as const;
  protected readonly a11yRows = ['<button gogTooltip>'] as const;
}
