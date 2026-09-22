import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { ChipComponent, type GogSize } from '@guildofgleks/ui';

import { DocAttrs } from '../../doc/doc-attrs';
import { DocCell, DocMatrix } from '../../doc/doc-matrix';
import { DocPage } from '../../doc/doc-page';
import { DocSection } from '../../doc/doc-section';
import { CHIP_SCOPE_CONFIG, ChipConfigScope } from './chip-config-scope';

interface VisualState {
  readonly name: string;
  readonly selected: boolean | null;
  readonly disabled: boolean;
  readonly clickable: boolean;
}

/** An initials avatar as a data URL, so the page needs no image files. */
function avatar(initials: string, fill: string): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' fill='${fill}'/><text x='32' y='40' text-anchor='middle' font-size='26' font-family='Arial' fill='%231a1208'>${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${svg}`;
}

@Component({
  selector: 'app-chip-page',
  imports: [
    JsonPipe,
    ChipComponent,
    DocAttrs,
    DocCell,
    DocMatrix,
    DocPage,
    DocSection,
    ChipConfigScope,
  ],
  templateUrl: './chip-page.html',
  styleUrl: './chip-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipPage {
  protected readonly sizes: readonly GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];

  protected readonly states: readonly VisualState[] = [
    { name: 'default', selected: null, disabled: false, clickable: true },
    { name: '[selected]="false"', selected: false, disabled: false, clickable: true },
    { name: '[selected]="true"', selected: true, disabled: false, clickable: true },
    { name: '[disabled]="true"', selected: null, disabled: true, clickable: true },
    {
      name: '[disabled]="true" [selected]="true"',
      selected: true,
      disabled: true,
      clickable: true,
    },
    { name: '[clickable]="false"', selected: null, disabled: false, clickable: false },
  ];

  protected readonly shapes = ['rounded', 'pill'] as const;

  /** The single column of a matrix whose rows are the only axis. */
  protected readonly controlColumn = ['chip'] as const;

  protected readonly ada = avatar('AL', '%23c9b896');
  protected readonly alan = avatar('AT', '%23d4b483');

  protected readonly topics = [
    { label: 'Accessibility', on: signal<boolean | null>(true) },
    { label: 'Theming', on: signal<boolean | null>(false) },
    { label: 'Forms', on: signal<boolean | null>(true) },
    { label: 'Tables', on: signal<boolean | null>(false) },
  ];
  protected readonly selectedTopics = computed(() =>
    this.topics.filter((topic) => topic.on()).map((topic) => topic.label),
  );

  protected readonly filters = signal(['Angular', 'Design system', 'Pinned', 'Open']);
  protected readonly lastAction = signal('nothing yet');

  protected readonly scopeConfig = CHIP_SCOPE_CONFIG;
  protected readonly scopeAxis = ['outside scope', 'inside scope'] as const;
  protected readonly scopeColumns = ['ripple unset', '[ripple]="false"'] as const;

  protected readonly a11yStates = [
    'default',
    '[selected]="false"',
    '[selected]="true"',
    '[disabled]="true"',
    '[clickable]="false"',
    '[removable]="true"',
    'ariaLabel="Angular filter"',
  ] as const;

  protected remove(label: string): void {
    this.filters.update((filters) => filters.filter((filter) => filter !== label));
    this.lastAction.set(`gogRemove: ${label}`);
  }

  protected resetFilters(): void {
    this.filters.set(['Angular', 'Design system', 'Pinned', 'Open']);
    this.lastAction.set('reset');
  }
}
