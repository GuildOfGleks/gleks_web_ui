import { JsonPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  signal,
  viewChild,
} from '@angular/core';
import {
  AlertComponent,
  ButtonComponent,
  GogAlertIconDirective,
  IconComponent,
  type GogAlertLive,
  type GogSeverity,
} from '@guildofgleks/ui';

import { DocAttrs } from '../../doc/doc-attrs';
import { DocCell, DocMatrix } from '../../doc/doc-matrix';
import { DocPage } from '../../doc/doc-page';
import { DocSection } from '../../doc/doc-section';
import { ALERT_SCOPE_CONFIG, AlertConfigScope } from './alert-config-scope';

interface Labelled<T> {
  readonly name: string;
  readonly value: T;
}

@Component({
  selector: 'app-alert-page',
  imports: [
    JsonPipe,
    AlertComponent,
    ButtonComponent,
    GogAlertIconDirective,
    IconComponent,
    DocAttrs,
    DocCell,
    DocMatrix,
    DocPage,
    DocSection,
    AlertConfigScope,
  ],
  templateUrl: './alert-page.html',
  styleUrl: './alert-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertPage {
  protected readonly severities: readonly GogSeverity[] = [
    'accent',
    'info',
    'success',
    'warning',
    'danger',
  ];

  protected readonly shapes: readonly Labelled<{ heading?: string; dismissible: boolean }>[] = [
    { name: 'body only', value: { dismissible: false } },
    { name: 'heading="Payment failed"', value: { heading: 'Payment failed', dismissible: false } },
    {
      name: 'heading + [dismissible]="true"',
      value: { heading: 'Payment failed', dismissible: true },
    },
  ];

  /** The single column of a matrix whose rows are the only axis. */
  protected readonly controlColumn = ['alert'] as const;

  protected readonly scopeConfig = ALERT_SCOPE_CONFIG;
  protected readonly scopeAxis = ['outside scope', 'inside scope'] as const;

  protected readonly liveStates: readonly (Labelled<GogAlertLive | undefined> & {
    readonly severity: GogSeverity;
  })[] = [
    { name: 'severity="danger", live unset', severity: 'danger', value: undefined },
    { name: 'severity="info", live unset', severity: 'info', value: undefined },
    { name: 'severity="danger" live="polite"', severity: 'danger', value: 'polite' },
    { name: 'severity="danger" live="off"', severity: 'danger', value: 'off' },
  ];

  /** One flag per row of the live matrix, so each can be mounted on demand. */
  protected readonly shown = signal<Readonly<Record<string, boolean>>>({});

  protected readonly showDismissible = signal(true);
  protected readonly dismissCount = signal(0);

  /** `{ read: ElementRef }`: on a `<gog-button>` the query would hand back the component. */
  private readonly restoreButton = viewChild('restore', { read: ElementRef });

  constructor() {
    // Where focus goes after a dismissal is the app's call: here, to the button that replaces the
    // alert, once it exists. The alert is still mounted when `dismissed` fires, which is what
    // leaves focus somewhere to be moved from.
    effect(() => {
      if (this.showDismissible()) return;
      const host = this.restoreButton()?.nativeElement as HTMLElement | undefined;
      const button = host?.querySelector('button');
      if (button) queueMicrotask(() => button.focus());
    });
  }

  protected isShown(key: string): boolean {
    return this.shown()[key] ?? false;
  }

  protected toggle(key: string): void {
    this.shown.update((shown) => ({ ...shown, [key]: !shown[key] }));
  }

  protected onDismissed(): void {
    this.dismissCount.update((count) => count + 1);
    this.showDismissible.set(false);
  }
}
