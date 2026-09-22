import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  ButtonComponent,
  GogBadgeDirective,
  GogButtonDirective,
  type GogBadgePosition,
  type GogTagVariant,
} from '@guildofgleks/ui';

import { DocAttrs } from '../../doc/doc-attrs';
import { DocCell, DocMatrix } from '../../doc/doc-matrix';
import { DocPage } from '../../doc/doc-page';
import { DocSection } from '../../doc/doc-section';

interface Content {
  readonly name: string;
  readonly value: string | number | null;
  readonly dot: boolean;
}

@Component({
  selector: 'app-badge-page',
  imports: [
    ButtonComponent,
    GogBadgeDirective,
    GogButtonDirective,
    DocAttrs,
    DocCell,
    DocMatrix,
    DocPage,
    DocSection,
  ],
  templateUrl: './badge-page.html',
  styleUrl: './badge-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgePage {
  protected readonly variants: readonly GogTagVariant[] = ['danger', 'warning', 'success', 'info'];

  protected readonly contents: readonly Content[] = [
    { name: 'gogBadge="3"', value: 3, dot: false },
    { name: 'gogBadge="42"', value: 42, dot: false },
    { name: 'gogBadge="150"', value: 150, dot: false },
    { name: 'gogBadge="NEW"', value: 'NEW', dot: false },
    { name: 'badgeDot', value: null, dot: true },
  ];

  protected readonly positions: readonly GogBadgePosition[] = [
    'top-start',
    'top-end',
    'bottom-start',
    'bottom-end',
  ];

  /** The single column of a matrix whose rows are the only axis. */
  protected readonly controlColumn = ['host'] as const;

  protected readonly a11yStates = [
    'button gogBadge="12"',
    'button gogBadge="12" badgeAriaLabel="12 unread"',
    'gog-button gogBadge="12" — its inner button',
    'gog-button gogBadge="12" badgeAriaLabel="12 unread" — its inner button',
    'a gogButton gogBadge="12"',
  ] as const;

  protected readonly count = signal(3);
  protected readonly hidden = signal(false);

  protected add(): void {
    this.count.update((value) => value + 1);
  }

  protected remove(): void {
    this.count.update((value) => Math.max(0, value - 1));
  }
}
