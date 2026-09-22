import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GogBadgeDirective, GogRippleDirective } from '@guildofgleks/ui';

import { DocAttrs } from '../../doc/doc-attrs';
import { DocCell, DocMatrix } from '../../doc/doc-matrix';
import { DocPage } from '../../doc/doc-page';
import { DocSection } from '../../doc/doc-section';
import { RippleScope } from './ripple-scope';

interface Setting {
  readonly name: string;
  readonly centred: boolean;
  readonly rippleDisabled: boolean;
  readonly disabled: boolean;
  readonly ariaDisabled: boolean;
}

@Component({
  selector: 'app-ripple-page',
  imports: [
    GogBadgeDirective,
    GogRippleDirective,
    DocAttrs,
    DocCell,
    DocMatrix,
    DocPage,
    DocSection,
    RippleScope,
  ],
  templateUrl: './ripple-page.html',
  styleUrl: './ripple-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RipplePage {
  protected readonly shapes = ['rounded', 'pill', 'square', 'tile'] as const;

  protected readonly settings: readonly Setting[] = [
    {
      name: 'gogRipple',
      centred: false,
      rippleDisabled: false,
      disabled: false,
      ariaDisabled: false,
    },
    {
      name: 'rippleCentred',
      centred: true,
      rippleDisabled: false,
      disabled: false,
      ariaDisabled: false,
    },
    {
      name: 'rippleDisabled',
      centred: false,
      rippleDisabled: true,
      disabled: false,
      ariaDisabled: false,
    },
    {
      name: 'disabled (on a button)',
      centred: false,
      rippleDisabled: false,
      disabled: true,
      ariaDisabled: false,
    },
    {
      name: 'aria-disabled="true"',
      centred: false,
      rippleDisabled: false,
      disabled: false,
      ariaDisabled: true,
    },
  ];

  /** The single column of a matrix whose rows are the only axis. */
  protected readonly controlColumn = ['host'] as const;

  protected readonly a11yStates = ['gogRipple', 'rippleDisabled'] as const;
}
