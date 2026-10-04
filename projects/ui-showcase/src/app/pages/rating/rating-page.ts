import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RatingComponent, type GogSize } from '@guildofgleks/ui';

import { DocAttrs } from '../../doc/doc-attrs';
import { DocCell, DocMatrix } from '../../doc/doc-matrix';
import { DocPage } from '../../doc/doc-page';
import { DocSection } from '../../doc/doc-section';

interface Labelled<T> {
  readonly name: string;
  readonly value: T;
}

@Component({
  selector: 'app-rating-page',
  imports: [
    ReactiveFormsModule,
    RatingComponent,
    DocAttrs,
    DocCell,
    DocMatrix,
    DocPage,
    DocSection,
  ],
  templateUrl: './rating-page.html',
  styleUrl: './rating-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingPage {
  protected readonly sizes: readonly GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
  protected readonly column = ['rating'] as const;
  protected readonly modes = ['interactive', 'readonly'] as const;

  protected readonly states: readonly Labelled<{ disabled: boolean; error: string }>[] = [
    { name: 'default', value: { disabled: false, error: '' } },
    { name: 'errorMessage', value: { disabled: false, error: 'Rate your stay' } },
    { name: 'disabled', value: { disabled: true, error: '' } },
  ];

  protected readonly displayed: readonly number[] = [0, 1.2, 2.5, 3.7, 4.3, 5];

  protected readonly score = signal<number | null>(3);
  protected readonly clearableScore = signal<number | null>(4);

  protected readonly control = new FormControl<number | null>(null, Validators.required);
}
