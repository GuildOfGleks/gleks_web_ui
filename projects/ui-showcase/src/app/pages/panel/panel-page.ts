import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  ButtonComponent,
  CheckboxComponent,
  GogPanelFooterDirective,
  GogPanelHeaderDirective,
  PanelComponent,
  SelectComponent,
  type GogSize,
  type GogSurfaceVariant,
} from '@guildofgleks/ui';

import { DocAttrs } from '../../doc/doc-attrs';
import { DocCell, DocMatrix } from '../../doc/doc-matrix';
import { DocPage } from '../../doc/doc-page';
import { DocSection } from '../../doc/doc-section';
import { PANEL_SCOPE_CONFIG, PanelConfigScope } from './panel-config-scope';

interface Labelled<T> {
  readonly name: string;
  readonly value: T;
}

interface PanelState {
  readonly open: boolean;
  readonly disabled: boolean;
  readonly loading: boolean;
}

interface A11yRow {
  readonly name: string;
  /** Which element's attributes the row prints: the panel, or its toggle. */
  readonly target: string;
}

@Component({
  selector: 'app-panel-page',
  imports: [
    JsonPipe,
    ButtonComponent,
    CheckboxComponent,
    GogPanelFooterDirective,
    GogPanelHeaderDirective,
    PanelComponent,
    SelectComponent,
    DocAttrs,
    DocCell,
    DocMatrix,
    DocPage,
    DocSection,
    PanelConfigScope,
  ],
  templateUrl: './panel-page.html',
  styleUrl: './panel-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelPage {
  protected readonly variants: readonly GogSurfaceVariant[] = ['outlined', 'elevated', 'filled'];
  protected readonly states: readonly Labelled<PanelState>[] = [
    { name: 'rest', value: { open: true, disabled: false, loading: false } },
    { name: '[open]="false"', value: { open: false, disabled: false, loading: false } },
    { name: '[disabled]="true"', value: { open: true, disabled: true, loading: false } },
    { name: '[loading]="true"', value: { open: true, disabled: false, loading: true } },
  ];
  protected readonly sizes: readonly GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];

  /** The single column of a matrix whose rows are the only axis. */
  protected readonly controlColumn = ['panel'] as const;

  protected readonly notificationsOpen = signal(true);
  protected readonly toggles = signal(0);
  protected readonly emailDigest = signal(true);
  protected readonly pushAlerts = signal(false);

  /** A dropdown inside a non-collapsible panel must escape the panel's box. */
  protected readonly timezone = signal<string | null>(null);
  protected readonly timezones = [
    { id: 'pst', name: 'Pacific Time' },
    { id: 'est', name: 'Eastern Time' },
    { id: 'utc', name: 'UTC' },
    { id: 'wet', name: 'Western European Time' },
    { id: 'cet', name: 'Central European Time' },
    { id: 'eet', name: 'Eastern European Time' },
    { id: 'ist', name: 'India Standard Time' },
    { id: 'jst', name: 'Japan Standard Time' },
  ];

  protected readonly scopeConfig = PANEL_SCOPE_CONFIG;
  protected readonly scopeAxis = ['outside scope', 'inside scope'] as const;

  protected readonly a11yRows: readonly A11yRow[] = [
    { name: 'no gogPanelHeader', target: 'gog-panel' },
    { name: 'gogPanelHeader', target: 'gog-panel' },
    { name: '[collapsible]="true" — its toggle', target: '.gog-panel__toggle' },
    { name: '[open]="false" — its toggle', target: '.gog-panel__toggle' },
    { name: '[disabled]="true" — its toggle', target: '.gog-panel__toggle' },
    { name: '[loading]="true"', target: 'gog-panel' },
  ];

  protected onOpenChange(open: boolean): void {
    this.notificationsOpen.set(open);
    this.toggles.update((count) => count + 1);
  }
}
