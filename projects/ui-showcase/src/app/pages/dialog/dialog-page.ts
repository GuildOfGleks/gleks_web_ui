import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  type TemplateRef,
  viewChild,
} from '@angular/core';
import { GogButtonDirective, IconComponent } from '@guildofgleks/ui';
import {
  ConfirmationDialogComponent,
  type ConfirmDialogData,
  type DialogConfig,
  DialogService,
} from '@guildofgleks/ui/dialog';

import { DocCell, DocMatrix } from '../../doc/doc-matrix';
import { DocPage } from '../../doc/doc-page';
import { DocSection } from '../../doc/doc-section';
import { DIALOG_CONFIG_ROWS } from './dialog.api';
import {
  DialogAttrsProbe,
  LongDialog,
  type RenameData,
  type RenameResult,
  RenameDialog,
  type StackData,
  StackDialog,
} from './dialog-demos';

/** A row of a matrix whose cells open a dialog: the label, and what it changes from the defaults. */
interface ConfigRow {
  readonly name: string;
  readonly config: Omit<DialogConfig, 'component'>;
}

@Component({
  selector: 'app-dialog-page',
  imports: [GogButtonDirective, IconComponent, DocCell, DocMatrix, DocPage, DocSection],
  templateUrl: './dialog-page.html',
  styleUrl: './dialog-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogPage {
  private readonly dialogs = inject(DialogService);
  private readonly closeTemplate = viewChild.required<TemplateRef<unknown>>('closeTemplate');

  protected readonly configRows = DIALOG_CONFIG_ROWS;

  /** The single column of a matrix whose rows are the only axis. */
  protected readonly openColumn = ['open'] as const;

  protected readonly shapes: readonly ConfigRow[] = [
    { name: '{ title } — every default', config: { title: 'Archive project' } },
    { name: 'modal: false', config: { title: 'Archive project', modal: false } },
    { name: 'closable: false', config: { title: 'Archive project', closable: false } },
    { name: 'draggable: false', config: { title: 'Archive project', draggable: false } },
    { name: "role: 'alertdialog'", config: { title: 'Archive project', role: 'alertdialog' } },
    { name: 'no title', config: {} },
  ];

  protected readonly widths: readonly ConfigRow[] = [
    { name: "width unset ('auto')", config: { title: 'Width' } },
    { name: "width: '24rem'", config: { title: 'Width', width: '24rem' } },
    {
      name: "width: '60rem', maxWidth: '36rem'",
      config: { title: 'Width', width: '60rem', maxWidth: '36rem' },
    },
  ];

  protected readonly a11yRows: readonly ConfigRow[] = [
    { name: '{ title }', config: { title: 'Archive project' } },
    { name: "role: 'alertdialog'", config: { title: 'Archive project', role: 'alertdialog' } },
    { name: 'modal: false', config: { title: 'Archive project', modal: false } },
    {
      name: "closeAriaLabel: 'Dismiss'",
      config: { title: 'Archive project', closeAriaLabel: 'Dismiss' },
    },
    { name: 'no title', config: {} },
  ];

  protected readonly lastResult = signal('none yet');

  /** Opens the library's confirmation dialog with `row`'s config over the defaults. */
  protected confirm(row: ConfigRow): void {
    const handle = this.dialogs.open<boolean, ConfirmDialogData>({
      ...row.config,
      component: ConfirmationDialogComponent,
      data: {
        title: 'Archive this project?',
        description: `Opened with ${row.name}. Archived projects stay readable and can be restored.`,
        confirmText: 'Archive',
        cancelText: 'Cancel',
      },
    });
    this.record(row.name, handle.afterClosed);
  }

  protected closeIcon(kind: 'name' | 'template'): void {
    const handle = this.dialogs.open<boolean, ConfirmDialogData>({
      title: kind === 'name' ? "closeIconName: 'arrow-left'" : 'closeIconTemplate',
      component: ConfirmationDialogComponent,
      ...(kind === 'name'
        ? { closeIconName: 'arrow-left' }
        : { closeIconTemplate: this.closeTemplate() }),
      data: {
        title: 'A different close glyph',
        description: 'Only the look changes: the button keeps its name, its focus ring and Escape.',
        confirmText: 'OK',
        cancelText: 'Cancel',
      },
    });
    this.record(`close icon by ${kind}`, handle.afterClosed);
  }

  protected rename(): void {
    const handle = this.dialogs.open<RenameResult, RenameData>({
      title: 'Rename report',
      component: RenameDialog,
      data: { name: 'Q3 revenue' },
      width: '28rem',
    });
    this.record('rename', handle.afterClosed);
  }

  protected long(): void {
    this.record(
      'long content',
      this.dialogs.open<void>({ title: 'Release notes', component: LongDialog, width: '32rem' })
        .afterClosed,
    );
  }

  protected stacked(): void {
    const handle = this.dialogs.open<unknown, StackData>({
      title: 'Stacked 1',
      component: StackDialog,
      data: { depth: 1 },
      width: '26rem',
    });
    this.record('stack', handle.afterClosed);
  }

  protected probe(row: ConfigRow): void {
    this.dialogs.open({ ...row.config, component: DialogAttrsProbe, width: '34rem' });
  }

  private record(what: string, afterClosed: Promise<unknown>): void {
    void afterClosed.then((result) =>
      this.lastResult.set(
        `${what} → ${result === undefined ? 'undefined' : JSON.stringify(result)}`,
      ),
    );
  }
}
