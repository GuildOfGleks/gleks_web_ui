import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
} from '@angular/core';
import { ButtonComponent, InputfieldComponent, SelectComponent } from '@guildofgleks/ui';
import {
  ConfirmationDialogComponent,
  type ConfirmDialogData,
  DIALOG_DATA,
  DIALOG_REF,
  type DialogRef,
  DialogService,
} from '@guildofgleks/ui/dialog';

export interface RenameData {
  readonly name: string;
}

export interface RenameResult {
  readonly name: string;
  readonly folder: string | number | null;
}

/**
 * A consumer's own dialog: data in through `DIALOG_DATA`, a typed result out through
 * `DIALOG_REF`. Its select renders into `<body>`, since the dialog's body is a scroller that would
 * clip it, and stacks above the dialog on the `--gog-dropdown-z` the panel raises. Its delete
 * button opens a second dialog on top of this one.
 */
@Component({
  selector: 'app-rename-dialog',
  imports: [ButtonComponent, InputfieldComponent, SelectComponent],
  template: `
    <gog-inputfield label="Name" [(value)]="name" />
    <gog-select label="Folder" [options]="folders" [appendToBody]="true" [(value)]="folder" />
    <p class="demo-dialog__out">{{ deleteAnswer() }}</p>
    <div class="demo-dialog__actions">
      <gog-button variant="ghost" severity="danger" (gogClick)="confirmDelete()"
        >Delete…</gog-button
      >
      <gog-button variant="ghost" (gogClick)="ref.close()">Cancel</gog-button>
      <gog-button (gogClick)="save()">Save</gog-button>
    </div>
  `,
  styleUrl: './dialog-demos.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RenameDialog {
  private readonly data = inject<RenameData>(DIALOG_DATA);
  private readonly dialogs = inject(DialogService);
  protected readonly ref = inject<DialogRef<RenameResult>>(DIALOG_REF);

  protected readonly folders = [
    { id: 'drafts', name: 'Drafts' },
    { id: 'reports', name: 'Reports' },
    { id: 'archive', name: 'Archive' },
  ];
  protected readonly name = signal(this.data.name);
  protected readonly folder = signal<string | number | null>('reports');
  protected readonly deleteAnswer = signal('Delete opens a confirmation above this dialog.');

  protected save(): void {
    this.ref.close({ name: this.name(), folder: this.folder() });
  }

  protected confirmDelete(): void {
    const handle = this.dialogs.open<boolean, ConfirmDialogData>({
      component: ConfirmationDialogComponent,
      role: 'alertdialog',
      data: {
        title: `Delete "${this.name()}"?`,
        description: 'The dialog underneath stays open until this one answers.',
        confirmText: 'Delete',
        cancelText: 'Keep',
      },
    });
    void handle.afterClosed.then((confirmed) =>
      this.deleteAnswer.set(`The confirmation answered: ${String(confirmed)}`),
    );
  }
}

export interface StackData {
  readonly depth: number;
}

/** Opens another of itself on top, or closes every open dialog through `DialogService.closeAll`. */
@Component({
  selector: 'app-stack-dialog',
  imports: [ButtonComponent],
  template: `
    <p>
      Dialog {{ data.depth }}. Each new one opens above the last with a higher z-index and its own
      drag offset; Escape closes only the top one.
    </p>
    <div class="demo-dialog__actions">
      <gog-button variant="ghost" (gogClick)="dialogs.closeAll('closeAll')">Close all</gog-button>
      <gog-button (gogClick)="openAnother()">Open another</gog-button>
    </div>
  `,
  styleUrl: './dialog-demos.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StackDialog {
  protected readonly data = inject<StackData>(DIALOG_DATA);
  protected readonly dialogs = inject(DialogService);

  protected openAnother(): void {
    const depth = this.data.depth + 1;
    this.dialogs.open<unknown, StackData>({
      title: `Stacked ${depth}`,
      component: StackDialog,
      data: { depth },
      width: '26rem',
    });
  }
}

/** Enough text to pass `--gog-dialog-body-max-height`, so the body scrolls under a fixed header. */
@Component({
  selector: 'app-long-dialog',
  imports: [ButtonComponent],
  template: `
    @for (paragraph of paragraphs; track paragraph) {
      <p>
        {{ paragraph }}. The body scrolls inside the panel with the library's thin scrollbar; the
        header, and with it the close button and the drag handle, stays where it is.
      </p>
    }
    <div class="demo-dialog__actions">
      <gog-button (gogClick)="ref.close()">Done</gog-button>
    </div>
  `,
  styleUrl: './dialog-demos.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LongDialog {
  protected readonly ref = inject(DIALOG_REF);
  protected readonly paragraphs = Array.from(
    { length: 24 },
    (_, index) => `Paragraph ${index + 1}`,
  );
}

const REPORTED = /^(aria-|role$|tabindex$)/;

export interface ProbeData {
  /** Renders a heading with this id, for a dialog named through `ariaLabelledBy`. */
  readonly headingId?: string;
}

/**
 * Prints the accessibility-relevant attributes of the panel it renders in, and the name of the
 * panel's close button, as the browser has them. The panel belongs to `gog-dialog`, so the page
 * cannot read it with `app-doc-attrs` from where it stands.
 */
@Component({
  selector: 'app-dialog-attrs-probe',
  imports: [ButtonComponent],
  template: `
    @if (data?.headingId; as headingId) {
      <h3 [id]="headingId">Archive project</h3>
    }
    <code class="demo-dialog__out">{{ attributes() }}</code>
    <div class="demo-dialog__actions">
      <gog-button (gogClick)="ref.close()">Close</gog-button>
    </div>
  `,
  styleUrl: './dialog-demos.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogAttrsProbe {
  protected readonly ref = inject(DIALOG_REF);
  protected readonly data = inject<ProbeData | undefined>(DIALOG_DATA);
  protected readonly attributes = signal('…');

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    afterNextRender(() => {
      const panel = host.closest('[role="dialog"], [role="alertdialog"]');
      if (!panel) {
        this.attributes.set('no ancestor has role="dialog" or role="alertdialog"');
        return;
      }
      const own = Array.from(panel.attributes)
        .filter((attribute) => REPORTED.test(attribute.name))
        .map((attribute) => `${attribute.name}="${attribute.value}"`);
      const labelledBy = panel.getAttribute('aria-labelledby');
      const name = labelledBy ? panel.ownerDocument.getElementById(labelledBy)?.textContent : null;
      const close = Array.from(panel.querySelectorAll('button[aria-label]'))
        .filter((button) => !host.contains(button))
        .map((button) => `close button: aria-label="${button.getAttribute('aria-label')}"`);
      this.attributes.set(
        [
          `panel: ${own.join(' ')}`,
          `accessible name: ${name?.trim() ?? '(none)'}`,
          close[0] ?? 'close button: (none)',
        ].join('\n'),
      );
    });
  }
}
