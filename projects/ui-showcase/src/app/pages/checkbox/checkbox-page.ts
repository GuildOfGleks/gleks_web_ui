import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  CheckboxComponent,
  GogCheckboxIconDirective,
  IconComponent,
  type GogSize,
} from '@guildofgleks/ui';

import { DocAttrs } from '../../doc/doc-attrs';
import { DocCell, DocMatrix } from '../../doc/doc-matrix';
import { DocPage } from '../../doc/doc-page';
import { DocSection } from '../../doc/doc-section';
import { CHECKBOX_SCOPE_CONFIG, CheckboxConfigScope } from './checkbox-config-scope';

interface VisualState {
  readonly name: string;
  readonly checked: boolean;
  readonly indeterminate: boolean;
  readonly disabled: boolean;
}

interface Topic {
  readonly id: string;
  readonly name: string;
}

@Component({
  selector: 'app-checkbox-page',
  imports: [
    JsonPipe,
    ReactiveFormsModule,
    CheckboxComponent,
    GogCheckboxIconDirective,
    IconComponent,
    DocAttrs,
    DocCell,
    DocMatrix,
    DocPage,
    DocSection,
    CheckboxConfigScope,
  ],
  templateUrl: './checkbox-page.html',
  styleUrl: './checkbox-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxPage {
  protected readonly sizes: readonly GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];

  protected readonly states: readonly VisualState[] = [
    { name: 'checked unset', checked: false, indeterminate: false, disabled: false },
    { name: '[checked]="true"', checked: true, indeterminate: false, disabled: false },
    { name: '[indeterminate]="true"', checked: false, indeterminate: true, disabled: false },
    { name: '[disabled]="true"', checked: false, indeterminate: false, disabled: true },
    {
      name: '[disabled]="true" [checked]="true"',
      checked: true,
      indeterminate: false,
      disabled: true,
    },
  ];

  /** The single column of a matrix whose rows are the only axis. */
  protected readonly controlColumn = ['control'] as const;

  protected readonly scopeConfig = CHECKBOX_SCOPE_CONFIG;
  protected readonly scopeAxis = ['outside scope', 'inside scope'] as const;
  protected readonly scopeColumns = ['size unset', 'size="sm"'] as const;

  protected readonly a11yStates = [
    'default',
    '[checked]="true"',
    '[indeterminate]="true"',
    '[disabled]="true"',
    'label unset, ariaLabel="Accept the terms"',
  ] as const;

  protected readonly bound = signal(false);
  protected readonly starred = signal(true);

  /** The classic parent row: three children, and a parent that is neither on nor off. */
  protected readonly topics: readonly Topic[] = [
    { id: 'releases', name: 'Releases' },
    { id: 'security', name: 'Security advisories' },
    { id: 'digest', name: 'Weekly digest' },
  ];
  protected readonly selected = signal<readonly string[]>(['security']);

  protected readonly allSelected = computed(() => this.selected().length === this.topics.length);
  /** What `indeterminate` is for: some but not all. It is never both with `checked`. */
  protected readonly someSelected = computed(
    () => this.selected().length > 0 && !this.allSelected(),
  );

  protected isSelected(id: string): boolean {
    return this.selected().includes(id);
  }

  protected toggleTopic(id: string, checked: boolean): void {
    this.selected.update((current) =>
      checked ? [...current, id] : current.filter((entry) => entry !== id),
    );
  }

  protected toggleAll(checked: boolean): void {
    this.selected.set(checked ? this.topics.map((topic) => topic.id) : []);
  }

  /** Left deliberately unmanaged, to show what a stuck `indeterminate` looks like. */
  protected readonly stuck = signal(false);

  protected readonly formControl = new FormControl<boolean>(false, {
    nonNullable: true,
    validators: [Validators.requiredTrue],
  });
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
}
