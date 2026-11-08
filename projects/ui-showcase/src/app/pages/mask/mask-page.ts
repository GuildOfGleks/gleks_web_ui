import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  type GogMask,
  type GogMaskState,
  type GogMaskTokens,
  GogMaskDirective,
  formatMask,
} from '@guildofgleks/ui';

import { DocAttrs } from '../../doc/doc-attrs';
import { DocCell, DocMatrix } from '../../doc/doc-matrix';
import { DocPage } from '../../doc/doc-page';
import { DocSection } from '../../doc/doc-section';

type Fill = 'empty' | 'partial' | 'complete';

interface PatternDemo {
  /** As a template writes it. */
  readonly name: string;
  readonly mask: GogMask;
  readonly tokens: GogMaskTokens;
  /** Raw values — slot characters only — written in through `ngModel`. */
  readonly values: Readonly<Record<Fill, string>>;
}

const HEX: GogMaskTokens = { H: /[0-9a-f]/i };

@Component({
  selector: 'app-mask-page',
  imports: [
    JsonPipe,
    FormsModule,
    ReactiveFormsModule,
    GogMaskDirective,
    DocAttrs,
    DocCell,
    DocMatrix,
    DocPage,
    DocSection,
  ],
  templateUrl: './mask-page.html',
  styleUrl: './mask-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MaskPage {
  protected readonly fills: readonly Fill[] = ['empty', 'partial', 'complete'];

  protected readonly patterns: readonly PatternDemo[] = [
    {
      name: 'gogMask="+00 (000) 000-00-00"',
      mask: '+00 (000) 000-00-00',
      tokens: {},
      values: { empty: '', partial: '38050', complete: '380501234567' },
    },
    {
      name: 'gogMask="00/00/0000"',
      mask: '00/00/0000',
      tokens: {},
      values: { empty: '', partial: '0711', complete: '07112026' },
    },
    {
      name: 'gogMask="a0a 0a0"',
      mask: 'a0a 0a0',
      tokens: {},
      values: { empty: '', partial: 'K1A', complete: 'K1A0B1' },
    },
    {
      name: `[gogMask]="['0000 0000 0000 0000', '0000 0000 0000 0000 000']"`,
      mask: ['0000 0000 0000 0000', '0000 0000 0000 0000 000'],
      tokens: {},
      values: { empty: '', partial: '411111111111', complete: '6011000990139424123' },
    },
    {
      name: 'gogMask="#HHHHHH" [gogMaskTokens]="{ H: /[0-9a-f]/i }"',
      mask: '#HHHHHH',
      tokens: HEX,
      values: { empty: '', partial: 'c0f', complete: 'c0ffee' },
    },
  ];

  protected readonly cardMask = ['0000 0000 0000 0000', '0000 0000 0000 0000 000'] as const;
  protected readonly hexTokens = HEX;

  protected readonly phoneRaw = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });
  protected readonly phoneFormatted = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });

  protected readonly card = signal<GogMaskState | null>(null);

  /** Raw values from a backend, formatted for display with no control at all. */
  protected readonly stored = ['380501234567', '380671112233', '3804412'];
  protected readonly formatted = this.stored.map((raw) => formatMask(raw, '+00 (000) 000-00-00'));

  protected readonly a11yStates = [
    'gogMask="000 000"',
    'gogMask="a0a 0a0"',
    'gogMask="000 000" inputmode="text"',
  ] as const;
  protected readonly a11yColumns = ['input'] as const;
}
