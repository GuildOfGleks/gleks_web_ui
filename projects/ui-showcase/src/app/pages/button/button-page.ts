import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ButtonComponent,
  GogButtonDirective,
  type GogSeverity,
  type GogSize,
  type GogVariant,
  IconComponent,
} from '@guildofgleks/ui';

import { DocAttrs } from '../../doc/doc-attrs';
import { DocCell, DocMatrix } from '../../doc/doc-matrix';
import { DocPage } from '../../doc/doc-page';
import { DocSection } from '../../doc/doc-section';
import { BUTTON_SCOPE_CONFIG, ButtonConfigScope } from './button-config-scope';

interface VisualState {
  readonly name: string;
  readonly disabled: boolean;
  readonly loading: boolean;
  readonly pressed: boolean | 'mixed' | null;
}

type Content = 'text' | 'icon + text' | 'icon only' | 'long text';
type Element = 'gog-button' | 'button[gogButton]' | 'a[gogButton]';

interface Scenario {
  readonly name: string;
  readonly key: string;
  /** What the result column counts. */
  readonly counts: 'gogClick' | 'form submit';
}

@Component({
  selector: 'app-button-page',
  imports: [
    JsonPipe,
    RouterLink,
    ButtonComponent,
    GogButtonDirective,
    IconComponent,
    DocAttrs,
    DocCell,
    DocMatrix,
    DocPage,
    DocSection,
    ButtonConfigScope,
  ],
  templateUrl: './button-page.html',
  styleUrl: './button-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonPage {
  protected readonly variants: readonly GogVariant[] = ['primary', 'secondary', 'outline', 'ghost'];
  protected readonly sizes: readonly GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
  protected readonly severities: readonly GogSeverity[] = [
    'accent',
    'success',
    'info',
    'warning',
    'danger',
  ];

  protected readonly states: readonly VisualState[] = [
    { name: 'default', disabled: false, loading: false, pressed: null },
    { name: '[disabled]="true"', disabled: true, loading: false, pressed: null },
    { name: '[loading]="true"', disabled: false, loading: true, pressed: null },
    { name: '[ariaPressed]="true"', disabled: false, loading: false, pressed: true },
    { name: 'ariaPressed="mixed"', disabled: false, loading: false, pressed: 'mixed' },
    {
      name: '[ariaPressed]="true" [disabled]="true"',
      disabled: true,
      loading: false,
      pressed: true,
    },
  ];

  protected readonly loadingAxis: readonly boolean[] = [false, true];
  protected readonly contents: readonly Content[] = [
    'text',
    'icon + text',
    'icon only',
    'long text',
  ];
  protected readonly elements: readonly Element[] = [
    'gog-button',
    'button[gogButton]',
    'a[gogButton]',
  ];

  protected readonly scenarios: readonly Scenario[] = [
    { name: 'debounce unset', key: 'default', counts: 'gogClick' },
    { name: '[debounce]="0"', key: 'zero', counts: 'gogClick' },
    { name: '[debounce]="1000"', key: 'slow', counts: 'gogClick' },
    { name: '[loading]="true"', key: 'loading', counts: 'gogClick' },
    { name: '[disabled]="true"', key: 'disabled', counts: 'gogClick' },
    { name: 'in <form>, type unset', key: 'form-button', counts: 'form submit' },
    { name: 'in <form>, type="submit"', key: 'form-submit', counts: 'form submit' },
    {
      name: 'in <form>, type="submit" [loading]="true"',
      key: 'form-submit-loading',
      counts: 'form submit',
    },
  ];
  protected readonly scenarioColumns = ['control', 'result'] as const;

  protected readonly scopeConfig = BUTTON_SCOPE_CONFIG;
  protected readonly scopeAxis = ['outside scope', 'inside scope'] as const;
  protected readonly scopeColumns = ['size unset', 'size="sm"', 'gogClick count'] as const;

  protected readonly a11yStates = [
    'default',
    '[disabled]="true"',
    '[loading]="true"',
    'ariaLabel="Close", icon only',
    '[ariaPressed]="false"',
    '[ariaPressed]="true"',
    'ariaPressed="mixed"',
    '[ariaExpanded]="false" ariaControls="menu-1" ariaHasPopup="menu"',
    'type="submit"',
  ] as const;
  protected readonly a11yColumns = ['inner <button>'] as const;

  private readonly counts = signal<Readonly<Record<string, number>>>({});

  protected count(key: string): number {
    return this.counts()[key] ?? 0;
  }

  protected increment(key: string): void {
    this.counts.update((counts) => ({ ...counts, [key]: (counts[key] ?? 0) + 1 }));
  }

  protected submitted(event: Event, key: string): void {
    event.preventDefault();
    this.increment(key);
  }
}
