import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  ButtonToggleGroupComponent,
  GogButtonToggleOptionDirective,
  type GogButtonToggleAppearance,
  type GogIconName,
  type GogOrientation,
  type GogSize,
  IconComponent,
} from '@guildofgleks/ui';

import { DocAttrs } from '../../doc/doc-attrs';
import { DocCell, DocMatrix } from '../../doc/doc-matrix';
import { DocPage } from '../../doc/doc-page';
import { DocSection } from '../../doc/doc-section';
import { BUTTON_TOGGLE_SCOPE_CONFIG, ButtonToggleConfigScope } from './button-toggle-config-scope';

interface DemoOption {
  readonly id: string;
  readonly name: string;
  readonly disabled?: boolean;
}

interface DemoIconOption extends DemoOption {
  readonly icon: GogIconName;
}

interface StateRow {
  readonly name: string;
  readonly options: DemoOption[];
  readonly value: string | null;
  readonly groupDisabled: boolean;
}

interface MultiStateRow {
  readonly name: string;
  readonly value: string[];
}

@Component({
  selector: 'app-button-toggle-page',
  imports: [
    JsonPipe,
    ReactiveFormsModule,
    ButtonToggleGroupComponent,
    GogButtonToggleOptionDirective,
    IconComponent,
    DocAttrs,
    DocCell,
    DocMatrix,
    DocPage,
    DocSection,
    ButtonToggleConfigScope,
  ],
  templateUrl: './button-toggle-page.html',
  styleUrl: './button-toggle-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonTogglePage {
  protected readonly appearances: readonly GogButtonToggleAppearance[] = ['joined', 'separated'];
  protected readonly orientations: readonly GogOrientation[] = ['horizontal', 'vertical'];
  protected readonly sizes: readonly GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];

  protected readonly alignOptions: DemoOption[] = [
    { id: 'left', name: 'Left' },
    { id: 'center', name: 'Center' },
    { id: 'right', name: 'Right' },
  ];
  protected readonly alignOptionsOneDisabled: DemoOption[] = [
    { id: 'left', name: 'Left' },
    { id: 'center', name: 'Center' },
    { id: 'right', name: 'Right', disabled: true },
  ];
  protected readonly toolOptions: DemoIconOption[] = [
    { id: 'search', name: 'Search', icon: 'search' },
    { id: 'filter', name: 'Filter', icon: 'filter' },
    { id: 'star', name: 'Star', icon: 'star' },
  ];

  protected readonly states: readonly StateRow[] = [
    { name: 'default', options: this.alignOptions, value: null, groupDisabled: false },
    { name: 'selected', options: this.alignOptions, value: 'center', groupDisabled: false },
    {
      name: 'optionDisabled: one option disabled',
      options: this.alignOptionsOneDisabled,
      value: null,
      groupDisabled: false,
    },
    {
      name: '[disabled]="true"',
      options: this.alignOptions,
      value: 'left',
      groupDisabled: true,
    },
  ];

  protected readonly multiStates: readonly MultiStateRow[] = [
    { name: 'none selected', value: [] },
    { name: 'one selected', value: ['search'] },
    { name: 'all selected', value: ['search', 'filter', 'star'] },
  ];

  /** Every non-attrs matrix on this page also has one cell per row. */
  protected readonly controlColumn = ['control'] as const;

  protected readonly modeRows = ['single, selected', 'multiple, selected'] as const;

  protected readonly groupAttrStates = [
    'default (single)',
    '[multiple]="true"',
    '[disabled]="true"',
    'orientation="vertical"',
  ] as const;
  protected readonly optionAttrStates = [
    'default (single)',
    'selected (single)',
    'selected (multiple)',
    'optionDisabled',
    '[disabled]="true" (group)',
  ] as const;
  /** Every doc-attrs matrix on this page has one cell per row — this column exists only so `app-doc-matrix` has something to iterate. */
  protected readonly attrColumns = ['attrs'] as const;

  protected readonly scopeConfig = BUTTON_TOGGLE_SCOPE_CONFIG;
  protected readonly scopeAxis = ['outside scope', 'inside scope'] as const;
  protected readonly scopeColumns = ['size unset', 'size="sm"', 'valueChange count'] as const;

  protected readonly singleValue = signal<string | null>('center');
  protected readonly multiValue = signal<string[]>(['search']);
  protected readonly slotValue = signal<string[]>([]);

  protected readonly formControl = new FormControl<string | null>('left');
  protected readonly formDisabled = signal(false);

  private readonly counts = signal<Readonly<Record<string, number>>>({});

  protected count(key: string): number {
    return this.counts()[key] ?? 0;
  }

  protected increment(key: string): void {
    this.counts.update((counts) => ({ ...counts, [key]: (counts[key] ?? 0) + 1 }));
  }

  protected toggleFormDisabled(): void {
    const next = !this.formDisabled();
    this.formDisabled.set(next);
    if (next) {
      this.formControl.disable();
    } else {
      this.formControl.enable();
    }
  }

  /**
   * `GogButtonToggleOptionDirective` takes no input, so nothing in a template lets
   * `strictTemplates` infer its `TOption` — `let-option` always types as `unknown`, even though
   * the runtime context is exactly this page's own `toolOptions` (see `docs/backlog.md`).
   */
  protected asIconOption(option: unknown): DemoIconOption {
    return option as DemoIconOption;
  }
}
