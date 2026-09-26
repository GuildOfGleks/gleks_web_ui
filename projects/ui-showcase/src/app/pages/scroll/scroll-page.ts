import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  ScrollComponent,
  type GogScrollAxis,
  type GogScrollMetrics,
  type GogScrollSize,
} from '@guildofgleks/ui';

import { DocAttrs } from '../../doc/doc-attrs';
import { DocCell, DocMatrix } from '../../doc/doc-matrix';
import { DocPage } from '../../doc/doc-page';
import { DocSection } from '../../doc/doc-section';
import { SCROLL_SCOPE_CONFIG, ScrollConfigScope } from './scroll-config-scope';

interface Labelled<T> {
  readonly name: string;
  readonly value: T;
}

interface A11yRow {
  readonly name: string;
  readonly kind: 'default' | 'named' | 'unfocusable' | 'short';
}

const PARAGRAPHS = [
  'A scroll region replaces the browser scrollbar with a themeable overlay thumb.',
  'The content still scrolls natively: wheel, touch, keyboard and focus-into-view.',
  'Only the chrome changes, so nothing about how the region scrolls is reimplemented.',
  'The thumb fades after a short delay unless autoHide is off.',
  'Drag the thumb, or click the track to page by most of a viewport.',
  'Reach events fire once per edge, for a load-more trigger or a pinned log.',
  'Overscroll behaviour decides whether the page scrolls on when this one ends.',
  'This is the last paragraph.',
];

@Component({
  selector: 'app-scroll-page',
  imports: [
    JsonPipe,
    ScrollComponent,
    DocAttrs,
    DocCell,
    DocMatrix,
    DocPage,
    DocSection,
    ScrollConfigScope,
  ],
  templateUrl: './scroll-page.html',
  styleUrl: './scroll-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollPage {
  protected readonly paragraphs = PARAGRAPHS;
  protected readonly chips = Array.from({ length: 16 }, (_, index) => `Item ${index + 1}`);
  protected readonly grid = Array.from({ length: 12 }, (_, row) =>
    Array.from({ length: 12 }, (_, col) => `${String.fromCharCode(65 + col)}${row + 1}`),
  );

  protected readonly sizes: readonly GogScrollSize[] = ['normal', 'thin'];
  protected readonly hideAxis: readonly Labelled<boolean>[] = [
    { name: 'autoHide (default)', value: true },
    { name: '[autoHide]="false"', value: false },
  ];
  protected readonly axes: readonly GogScrollAxis[] = ['vertical', 'horizontal', 'both'];

  /** The single column of a matrix whose rows are the only axis. */
  protected readonly controlColumn = ['scroll'] as const;

  protected readonly reach = signal('none yet');
  protected readonly metrics = signal<GogScrollMetrics | null>(null);

  protected readonly scopeConfig = SCROLL_SCOPE_CONFIG;
  protected readonly scopeAxis = ['outside scope', 'inside scope'] as const;

  protected readonly a11yRows: readonly A11yRow[] = [
    { name: 'default', kind: 'default' },
    { name: 'ariaLabel="Release notes"', kind: 'named' },
    { name: '[focusable]="false"', kind: 'unfocusable' },
    { name: 'default, content that does not overflow', kind: 'short' },
  ];

  protected position(metrics: GogScrollMetrics | null): string {
    if (!metrics) return 'not scrolled yet';
    return `scrollTop ${Math.round(metrics.scrollTop)} of ${metrics.scrollHeight - metrics.clientHeight}`;
  }
}
