import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ButtonComponent,
  CardComponent,
  GogCardFooterDirective,
  GogCardHeaderDirective,
  GogCardLinkDirective,
  GogCardMediaDirective,
  TagComponent,
  type GogSize,
  type GogSurfaceVariant,
} from '@guildofgleks/ui';

import { DocAttrs } from '../../doc/doc-attrs';
import { DocCell, DocMatrix } from '../../doc/doc-matrix';
import { DocPage } from '../../doc/doc-page';
import { DocSection } from '../../doc/doc-section';

interface Labelled<T> {
  readonly name: string;
  readonly value: T;
}

interface Person {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly years: string;
}

interface A11yRow {
  readonly name: string;
  /** Which element's attributes the row prints: the card, or the link inside it. */
  readonly target: string;
}

@Component({
  selector: 'app-card-page',
  imports: [
    RouterLink,
    ButtonComponent,
    CardComponent,
    GogCardFooterDirective,
    GogCardHeaderDirective,
    GogCardLinkDirective,
    GogCardMediaDirective,
    TagComponent,
    DocAttrs,
    DocCell,
    DocMatrix,
    DocPage,
    DocSection,
  ],
  templateUrl: './card-page.html',
  styleUrl: './card-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardPage {
  protected readonly variants: readonly GogSurfaceVariant[] = ['outlined', 'elevated', 'filled'];
  protected readonly states: readonly Labelled<{ disabled: boolean; loading: boolean }>[] = [
    { name: 'rest', value: { disabled: false, loading: false } },
    { name: '[disabled]="true"', value: { disabled: true, loading: false } },
    { name: '[loading]="true"', value: { disabled: false, loading: true } },
  ];
  protected readonly sizes: readonly GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];

  /** The single column of a matrix whose rows are the only axis. */
  protected readonly controlColumn = ['card'] as const;

  protected readonly people: readonly Person[] = [
    { id: 'ada', name: 'Ada Lovelace', role: 'Mathematician', years: '1815–1852' },
    { id: 'alan', name: 'Alan Turing', role: 'Logician', years: '1912–1954' },
    { id: 'grace', name: 'Grace Hopper', role: 'Rear Admiral', years: '1906–1992' },
  ];

  /** Counts clicks that reached the footer button rather than the card's own link. */
  protected readonly footerClicks = signal(0);

  protected readonly a11yRows: readonly A11yRow[] = [
    { name: 'no gogCardHeader', target: 'gog-card' },
    { name: 'gogCardHeader', target: 'gog-card' },
    { name: '[loading]="true"', target: 'gog-card' },
    { name: '[disabled]="true" — the card', target: 'gog-card' },
    { name: '[disabled]="true" — its gogCardLink', target: 'a' },
  ];

  /**
   * Stand-in cover art. A data URI rather than a file in `public/`, so the media slot's
   * full-bleed geometry can be judged without the page depending on an asset.
   */
  protected readonly mediaSrc =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 200">
         <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
           <stop offset="0%" stop-color="#b48310"/><stop offset="100%" stop-color="#735100"/>
         </linearGradient></defs>
         <rect width="480" height="200" fill="url(#g)"/>
       </svg>`,
    );
}
