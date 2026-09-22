import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import {
  ButtonComponent,
  SpinnerComponent,
  SpinnerOverlayComponent,
  type GogSize,
  type GogSpinnerVariant,
} from '@guildofgleks/ui';

import { DocAttrs } from '../../doc/doc-attrs';
import { DocCell, DocMatrix } from '../../doc/doc-matrix';
import { DocPage } from '../../doc/doc-page';
import { DocSection } from '../../doc/doc-section';
import { SpinnerConfigScope } from './spinner-config-scope';

@Component({
  selector: 'app-spinner-page',
  imports: [
    ButtonComponent,
    SpinnerComponent,
    SpinnerOverlayComponent,
    DocAttrs,
    DocCell,
    DocMatrix,
    DocPage,
    DocSection,
    SpinnerConfigScope,
  ],
  templateUrl: './spinner-page.html',
  styleUrl: './spinner-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinnerPage {
  protected readonly sizes: readonly GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
  protected readonly variants: readonly GogSpinnerVariant[] = ['runic', 'ring', 'custom'];

  /** The single column of a matrix whose rows are the only axis. */
  protected readonly controlColumn = ['spinner'] as const;

  protected readonly a11yStates = [
    'default',
    'ariaLabel="Loading invoices"',
    'ariaLabel=""',
    'inside a loading gog-button',
    'gog-spinner-overlay [loading]="true"',
  ] as const;

  protected readonly regionLoading = signal(false);
  protected readonly fullscreen = signal(false);

  private readonly timers: ReturnType<typeof setTimeout>[] = [];

  constructor() {
    inject(DestroyRef).onDestroy(() => this.timers.forEach(clearTimeout));
  }

  /** Shows `flag` for `ms`, the way a real request would. */
  protected flash(flag: typeof this.regionLoading, ms: number): void {
    flag.set(true);
    this.timers.push(setTimeout(() => flag.set(false), ms));
  }
}
