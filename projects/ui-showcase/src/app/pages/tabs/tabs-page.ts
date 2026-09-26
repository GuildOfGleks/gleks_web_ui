import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  GogTabContentDirective,
  GogTabHeaderDirective,
  TabComponent,
  TabsComponent,
  TagComponent,
  type GogSize,
  type GogTabsAlign,
} from '@guildofgleks/ui';

import { DocAttrs } from '../../doc/doc-attrs';
import { DocCell, DocMatrix } from '../../doc/doc-matrix';
import { DocPage } from '../../doc/doc-page';
import { DocSection } from '../../doc/doc-section';
import { TabsBuildCounter } from './tabs-build-counter';

interface A11yRow {
  readonly name: string;
  /** Which element's attributes the row prints. */
  readonly target: string;
}

@Component({
  selector: 'app-tabs-page',
  imports: [
    GogTabContentDirective,
    GogTabHeaderDirective,
    TabComponent,
    TabsComponent,
    TagComponent,
    DocAttrs,
    DocCell,
    DocMatrix,
    DocPage,
    DocSection,
    TabsBuildCounter,
  ],
  templateUrl: './tabs-page.html',
  styleUrl: './tabs-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsPage {
  protected readonly sizes: readonly GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
  protected readonly aligns: readonly GogTabsAlign[] = ['start', 'center', 'end', 'stretch'];

  /** The single column of a matrix whose rows are the only axis. */
  protected readonly controlColumn = ['tabs'] as const;

  protected readonly months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  protected readonly boundIndex = signal(0);
  protected readonly lastChange = signal<number | null>(null);
  protected readonly disabledTarget = signal(2);

  protected readonly draft = signal('');
  protected readonly builds = signal<Readonly<Record<string, number>>>({});

  protected readonly a11yRows: readonly A11yRow[] = [
    { name: 'the tablist', target: '[role=tablist]' },
    { name: 'the active tab', target: '[role=tab][aria-selected=true]' },
    { name: 'a disabled tab', target: '[role=tab][disabled]' },
    { name: 'the active panel', target: 'gog-tab:not([hidden])' },
    { name: 'an inactive panel', target: 'gog-tab[hidden]' },
  ];

  protected onDraft(event: Event): void {
    this.draft.set((event.target as HTMLInputElement).value);
  }

  protected onBuilt(name: string): void {
    this.builds.update((builds) => ({ ...builds, [name]: (builds[name] ?? 0) + 1 }));
  }

  protected buildCount(name: string): number {
    return this.builds()[name] ?? 0;
  }
}
