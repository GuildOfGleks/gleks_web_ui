import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  CollapsibleComponent,
  GogCollapsibleContentDirective,
  GogCollapsibleTriggerDirective,
  IconComponent,
  SelectComponent,
} from '@guildofgleks/ui';

import { DocAttrs } from '../../doc/doc-attrs';
import { DocCell, DocMatrix } from '../../doc/doc-matrix';
import { DocPage } from '../../doc/doc-page';
import { DocSection } from '../../doc/doc-section';

interface Labelled<T> {
  readonly name: string;
  readonly value: T;
}

interface A11yRow {
  readonly name: string;
  readonly kind: 'button' | 'div' | 'div-disabled' | 'div-role' | 'content';
  /** Which element's attributes the row prints. */
  readonly target: string;
}

@Component({
  selector: 'app-collapsible-page',
  imports: [
    CollapsibleComponent,
    GogCollapsibleContentDirective,
    GogCollapsibleTriggerDirective,
    IconComponent,
    SelectComponent,
    DocAttrs,
    DocCell,
    DocMatrix,
    DocPage,
    DocSection,
  ],
  templateUrl: './collapsible-page.html',
  styleUrl: './collapsible-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollapsiblePage {
  protected readonly hosts: readonly Labelled<'button' | 'div'>[] = [
    { name: '<button>', value: 'button' },
    { name: '<div>', value: 'div' },
  ];
  protected readonly states: readonly Labelled<{ open: boolean; disabled: boolean }>[] = [
    { name: 'closed', value: { open: false, disabled: false } },
    { name: '[open]="true"', value: { open: true, disabled: false } },
    { name: '[disabled]="true"', value: { open: false, disabled: true } },
  ];

  /** The single column of a matrix whose rows are the only axis. */
  protected readonly controlColumn = ['collapsible'] as const;

  protected readonly rowOpen = signal(false);
  protected readonly swapOpen = signal(false);
  protected readonly cappedOpen = signal(false);
  protected readonly selectOpen = signal(true);
  protected readonly externalOpen = signal(false);

  protected readonly focusOutOpen = signal(false);
  protected readonly focusOutCloses = signal(0);

  protected readonly faq = signal([
    { id: 'shipping', title: 'Shipping', body: 'Ships within 2 business days.', open: false },
    { id: 'returns', title: 'Returns', body: 'Free returns within 30 days.', open: false },
    { id: 'warranty', title: 'Warranty', body: 'Two years on parts and labour.', open: false },
  ]);

  protected readonly timezone = signal<string | null>(null);
  protected readonly timezones = [
    { id: 'pst', name: 'Pacific Time' },
    { id: 'est', name: 'Eastern Time' },
    { id: 'utc', name: 'UTC' },
    { id: 'wet', name: 'Western European Time' },
    { id: 'cet', name: 'Central European Time' },
    { id: 'eet', name: 'Eastern European Time' },
  ];

  protected readonly a11yRows: readonly A11yRow[] = [
    { name: '<button gogCollapsibleTrigger>', kind: 'button', target: 'button' },
    { name: '<div gogCollapsibleTrigger>', kind: 'div', target: '.gog-collapsible__trigger' },
    {
      name: '<div gogCollapsibleTrigger>, [disabled]="true"',
      kind: 'div-disabled',
      target: '.gog-collapsible__trigger',
    },
    {
      name: '<div role="tab" gogCollapsibleTrigger>',
      kind: 'div-role',
      target: '.gog-collapsible__trigger',
    },
    {
      name: 'gogCollapsibleContent, closed',
      kind: 'content',
      target: '.gog-collapsible__content',
    },
  ];

  protected onFocusOutChange(open: boolean): void {
    if (!open && this.focusOutOpen()) this.focusOutCloses.update((count) => count + 1);
    this.focusOutOpen.set(open);
  }

  protected setFaqOpen(id: string, open: boolean): void {
    this.faq.update((items) => items.map((item) => (item.id === id ? { ...item, open } : item)));
  }
}
