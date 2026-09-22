import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  ProgressbarComponent,
  type GogProgressbarMode,
  type GogProgressbarVariant,
  type GogSize,
} from '@guildofgleks/ui';

import { DocAttrs } from '../../doc/doc-attrs';
import { DocCell, DocMatrix } from '../../doc/doc-matrix';
import { DocPage } from '../../doc/doc-page';
import { DocSection } from '../../doc/doc-section';

@Component({
  selector: 'app-progressbar-page',
  imports: [ProgressbarComponent, DocAttrs, DocCell, DocMatrix, DocPage, DocSection],
  templateUrl: './progressbar-page.html',
  styleUrl: './progressbar-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressbarPage {
  protected readonly sizes: readonly GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
  protected readonly modes: readonly GogProgressbarMode[] = [
    'determinate',
    'buffer',
    'indeterminate',
  ];
  protected readonly variants: readonly GogProgressbarVariant[] = [
    'accent',
    'info',
    'success',
    'warning',
    'danger',
  ];
  /** The same bars twice: as drawn, and with hue taken away. */
  protected readonly renderings = ['colour', 'filter: grayscale(1)'] as const;
  protected readonly clampValues = [-20, 0, 62, 140, Number.NaN] as const;

  /** The single column of a matrix whose rows are the only axis. */
  protected readonly controlColumn = ['progressbar'] as const;

  protected readonly a11yStates = [
    '[value]="62" ariaLabel="Uploading"',
    'mode="indeterminate" ariaLabel="Uploading"',
    'mode="buffer" [value]="40" [buffer]="70"',
    'ariaLabel unset',
    'aria-labelledby on the host',
  ] as const;

  protected readonly upload = signal(20);

  protected step(by: number): void {
    this.upload.update((value) => value + by);
  }
}
