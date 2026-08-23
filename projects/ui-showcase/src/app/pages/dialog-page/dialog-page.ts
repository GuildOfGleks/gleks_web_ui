import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import {
  ButtonComponent,
  ConfirmationDialogComponent,
  DialogComponent,
  DialogService,
  GogPanelHeaderDirective,
  PanelComponent,
  ToastService,
} from '@guildofgleks/ui';
import { LoadingInventoryDialogComponent } from './loading-inventory-dialog.component';
import {
  WarehouseRegistrationDialogComponent,
  type WarehouseRegistrationDialogResult,
} from './warehouse-registration-dialog.component';

@Component({
  selector: 'app-dialog-page',
  imports: [ButtonComponent, DialogComponent, GogPanelHeaderDirective, PanelComponent],
  templateUrl: './dialog-page.html',
  styleUrl: './dialog-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogPage {
  private readonly dialogService = inject(DialogService);
  private readonly toastService = inject(ToastService);
  private readonly customCloseIconTpl = viewChild.required<TemplateRef<unknown>>('customCloseIcon');

  protected readonly lastDialogResult = signal('No dialog opened yet.');

  protected openConfirmDialog(): void {
    const ref = this.dialogService.open<boolean>({
      title: 'Delete workspace?',
      component: ConfirmationDialogComponent,
      data: {
        title: 'Delete workspace?',
        description: 'This action removes the demo item from the showcase state.',
        confirmText: 'Delete',
        cancelText: 'Keep it',
      },
      role: 'alertdialog',
      modal: true,
      closable: true,
      draggable: true,
      width: 'min(100%, 34rem)',
    });

    void ref.afterClosed.then((confirmed) => {
      this.lastDialogResult.set(confirmed ? 'Confirmed deletion' : 'Cancelled deletion');
      this.toastService.show({
        message: confirmed ? 'Workspace deleted' : 'Workspace kept',
        type: confirmed ? 'success' : 'info',
      });
    });
  }

  protected openNonModalDialog(): void {
    const ref = this.dialogService.open<boolean>({
      title: 'Non-modal dialog',
      component: ConfirmationDialogComponent,
      data: {
        title: 'Non-modal dialog',
        description:
          'modal="false" — no backdrop dimming, no focus trap; the rest of the page stays interactive while this is open.',
        confirmText: 'Got it',
        cancelText: 'Close',
      },
      modal: false,
      closable: true,
      draggable: true,
      width: 'min(100%, 28rem)',
    });

    void ref.afterClosed.then(() => this.lastDialogResult.set('Non-modal dialog closed'));
  }

  protected openNonClosableDialog(): void {
    const ref = this.dialogService.open<boolean>({
      component: ConfirmationDialogComponent,
      data: {
        title: 'No escape hatch',
        description:
          'closable="false" — no header, no X button, Escape and backdrop clicks do nothing. Only the buttons below can close it.',
        confirmText: 'Acknowledge',
        cancelText: 'Dismiss',
      },
      modal: true,
      closable: false,
      width: 'min(100%, 28rem)',
    });

    void ref.afterClosed.then(() =>
      this.lastDialogResult.set('Non-closable dialog closed via its own buttons'),
    );
  }

  protected openNonDraggableDialog(): void {
    const ref = this.dialogService.open<boolean>({
      title: 'Fixed in place',
      component: ConfirmationDialogComponent,
      data: {
        title: 'Fixed in place',
        description: 'draggable="false" — the header is still there, but dragging it does nothing.',
        confirmText: 'OK',
        cancelText: 'Close',
      },
      modal: true,
      closable: true,
      draggable: false,
      width: 'min(100%, 28rem)',
    });

    void ref.afterClosed.then(() => this.lastDialogResult.set('Non-draggable dialog closed'));
  }

  protected openCustomCloseIconDialog(): void {
    const ref = this.dialogService.open<boolean>({
      title: 'closeIconName',
      component: ConfirmationDialogComponent,
      data: {
        title: 'closeIconName',
        description: 'The header close button is "info" instead of the default "close" glyph.',
        confirmText: 'OK',
        cancelText: 'Close',
      },
      modal: true,
      closable: true,
      closeIconName: 'info',
      width: 'min(100%, 28rem)',
    });

    void ref.afterClosed.then(() => this.lastDialogResult.set('Custom-close-icon dialog closed'));
  }

  protected openCustomCloseTemplateDialog(): void {
    const ref = this.dialogService.open<boolean>({
      title: 'closeIconTemplate',
      component: ConfirmationDialogComponent,
      data: {
        title: 'closeIconTemplate',
        description: 'The close button projects arbitrary markup — "✕✕" here — instead of an icon.',
        confirmText: 'OK',
        cancelText: 'Close',
      },
      modal: true,
      closable: true,
      closeIconTemplate: this.customCloseIconTpl(),
      width: 'min(100%, 28rem)',
    });

    void ref.afterClosed.then(() =>
      this.lastDialogResult.set('Custom-close-template dialog closed'),
    );
  }

  protected openStackedDialogs(): void {
    this.dialogService.open<boolean>({
      title: 'Bottom dialog',
      component: ConfirmationDialogComponent,
      data: {
        title: 'Bottom dialog',
        description: 'Drag the dialog on top by its header to reveal this one underneath it.',
        confirmText: 'OK',
        cancelText: 'Close',
      },
      modal: true,
      closable: true,
      draggable: true,
      width: 'min(100%, 26rem)',
    });

    const top = this.dialogService.open<boolean>({
      title: 'Top dialog',
      component: ConfirmationDialogComponent,
      data: {
        title: 'Top dialog',
        description:
          'Opened second, so it stacks above the first with a higher z-index. Drag me by the header.',
        confirmText: 'OK',
        cancelText: 'Close',
      },
      modal: true,
      closable: true,
      draggable: true,
      width: 'min(100%, 26rem)',
    });

    void top.afterClosed.then(() => this.lastDialogResult.set('Top dialog of the stack closed'));
  }

  protected openLoadingDialog(): void {
    const ref = this.dialogService.open<void>({
      title: 'Warehouse inventory snapshot',
      component: LoadingInventoryDialogComponent,
      modal: true,
      closable: true,
      draggable: true,
      width: 'min(100%, 40rem)',
    });

    void ref.afterClosed.then(() => {
      this.lastDialogResult.set('Loading dialog closed');
    });
  }

  protected openWarehouseRegistrationDialog(): void {
    const ref = this.dialogService.open<WarehouseRegistrationDialogResult>({
      title: 'Register product to warehouse',
      component: WarehouseRegistrationDialogComponent,
      modal: true,
      closable: true,
      draggable: true,
      width: 'min(100%, 60rem)',
      maxWidth: '60rem',
    });

    void ref.afterClosed.then((result) => {
      if (!result) {
        this.lastDialogResult.set('Warehouse registration cancelled');
        return;
      }

      this.lastDialogResult.set(`Saved ${result.productName} (${result.sku})`);
    });
  }
}
