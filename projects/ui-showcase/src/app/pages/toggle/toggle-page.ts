import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ToggleComponent, type GogSize } from '@guildofgleks/ui';

import { DocAttrs } from '../../doc/doc-attrs';
import { DocCell, DocMatrix } from '../../doc/doc-matrix';
import { DocPage } from '../../doc/doc-page';
import { DocSection } from '../../doc/doc-section';
import { TOGGLE_SCOPE_CONFIG, ToggleConfigScope } from './toggle-config-scope';

interface VisualState {
  readonly name: string;
  readonly checked: boolean;
  readonly disabled: boolean;
}

interface Labelled<T> {
  readonly name: string;
  readonly value: T;
}

@Component({
  selector: 'app-toggle-page',
  imports: [
    JsonPipe,
    ReactiveFormsModule,
    ToggleComponent,
    DocAttrs,
    DocCell,
    DocMatrix,
    DocPage,
    DocSection,
    ToggleConfigScope,
  ],
  templateUrl: './toggle-page.html',
  styleUrl: './toggle-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TogglePage {
  protected readonly sizes: readonly GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];

  protected readonly states: readonly VisualState[] = [
    { name: 'checked unset', checked: false, disabled: false },
    { name: '[checked]="true"', checked: true, disabled: false },
    { name: '[disabled]="true"', checked: false, disabled: true },
    { name: '[disabled]="true" [checked]="true"', checked: true, disabled: true },
  ];

  protected readonly labelPositions: readonly Labelled<'start' | 'end'>[] = [
    { name: 'labelPosition unset (end)', value: 'end' },
    { name: 'labelPosition="start"', value: 'start' },
  ];

  /** The single column of a matrix whose rows are the only axis. */
  protected readonly controlColumn = ['control'] as const;

  protected readonly scopeConfig = TOGGLE_SCOPE_CONFIG;
  protected readonly scopeAxis = ['outside scope', 'inside scope'] as const;
  protected readonly scopeColumns = ['size unset', 'size="sm"'] as const;

  protected readonly a11yStates = [
    'default',
    '[checked]="true"',
    '[disabled]="true"',
    'onLabel / offLabel set',
    'label unset, ariaLabel="Dark mode"',
  ] as const;

  protected readonly bound = signal(false);
  protected readonly notifications = signal(true);
  protected readonly telemetry = signal(false);
  protected readonly betaFeatures = signal(false);

  protected readonly formControl = new FormControl<boolean>(true, { nonNullable: true });
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
