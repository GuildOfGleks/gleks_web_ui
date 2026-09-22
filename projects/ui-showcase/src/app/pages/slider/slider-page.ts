import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { SliderComponent, type GogSliderRange } from '@guildofgleks/ui';

import { DocAttrs } from '../../doc/doc-attrs';
import { DocCell, DocMatrix } from '../../doc/doc-matrix';
import { DocPage } from '../../doc/doc-page';
import { DocSection } from '../../doc/doc-section';
import { SLIDER_SCOPE_CONFIG, SliderConfigScope } from './slider-config-scope';

interface VisualState {
  readonly name: string;
  readonly showThumb: boolean;
  readonly showValue: boolean;
  readonly disabled: boolean;
  readonly errorMessage: string;
}

@Component({
  selector: 'app-slider-page',
  imports: [
    JsonPipe,
    ReactiveFormsModule,
    SliderComponent,
    DocAttrs,
    DocCell,
    DocMatrix,
    DocPage,
    DocSection,
    SliderConfigScope,
  ],
  templateUrl: './slider-page.html',
  styleUrl: './slider-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderPage {
  protected readonly states: readonly VisualState[] = [
    { name: 'default', showThumb: true, showValue: true, disabled: false, errorMessage: '' },
    {
      name: '[showThumb]="false"',
      showThumb: false,
      showValue: true,
      disabled: false,
      errorMessage: '',
    },
    {
      name: '[showValue]="false"',
      showThumb: true,
      showValue: false,
      disabled: false,
      errorMessage: '',
    },
    {
      name: '[disabled]="true"',
      showThumb: true,
      showValue: true,
      disabled: true,
      errorMessage: '',
    },
    {
      name: 'errorMessage="Too loud"',
      showThumb: true,
      showValue: true,
      disabled: false,
      errorMessage: 'Too loud',
    },
  ];

  protected readonly modes = ['single', '[range]="true"'] as const;

  /** The single column of a matrix whose rows are the only axis. */
  protected readonly controlColumn = ['control'] as const;

  protected readonly steps = [
    { name: 'min 0 · max 100 · step 1', min: 0, max: 100, step: 1, value: 40 },
    { name: 'min 0 · max 1 · step 0.05', min: 0, max: 1, step: 0.05, value: 0.35 },
    { name: 'min -40 · max 40 · step 5', min: -40, max: 40, step: 5, value: -15 },
    { name: 'min 0 · max 10000 · step 250', min: 0, max: 10000, step: 250, value: 2750 },
  ] as const;

  protected readonly scopeConfig = SLIDER_SCOPE_CONFIG;
  protected readonly scopeAxis = ['outside scope', 'inside scope'] as const;
  protected readonly scopeColumns = ['errorDisplay unset'] as const;
  /** One control per cell, so touching one does not reveal the other's error. */
  protected readonly scopeControls = {
    'outside scope': new FormControl(10, { nonNullable: true, validators: Validators.min(20) }),
    'inside scope': new FormControl(10, { nonNullable: true, validators: Validators.min(20) }),
  };

  protected readonly a11yStates = [
    'label="Volume"',
    'label unset, ariaLabel="Volume"',
    'label and ariaLabel unset',
    'orientation="vertical"',
    'errorMessage="Too loud"',
    '[disabled]="true"',
  ] as const;

  protected readonly rangeA11yStates = [
    'label="Price" — start',
    'label="Price" — end',
    'label unset, ariaLabel="Price" — start',
    'startAriaLabel="From" — start',
    '[endDisabled]="true" — end',
  ] as const;

  protected readonly volume = signal(40);
  protected readonly vertical = signal(60);
  protected readonly price = signal<GogSliderRange>({ start: 40, end: 120 });
  protected readonly verticalRange = signal<GogSliderRange>({ start: 30, end: 70 });
  protected readonly floorPinned = signal<GogSliderRange>({ start: 20, end: 60 });
  protected readonly ceilingPinned = signal<GogSliderRange>({ start: 20, end: 60 });
  protected readonly clamped = signal(150);

  protected readonly formControl = new FormControl(10, {
    nonNullable: true,
    validators: Validators.min(20),
  });
  protected readonly rangeControl = new FormControl<GogSliderRange>(
    { start: 200, end: 200 },
    { nonNullable: true },
  );
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
