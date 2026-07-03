import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ButtonComponent } from '../../button/button.component';
import { DIALOG_DATA, DIALOG_REF } from '../dialog.tokens';

export interface ConfirmDialogData {
  title: string;
  description: string;
  confirmText: string;
  cancelText: string;
}

@Component({
  selector: 'gog-confirmation-dialog',
  imports: [ButtonComponent],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationDialogComponent {
  private static count = 0;

  protected readonly instanceId = ++ConfirmationDialogComponent.count;
  protected readonly data = inject<ConfirmDialogData>(DIALOG_DATA);
  private readonly ref = inject(DIALOG_REF);

  protected confirm(): void {
    this.ref.close(true);
  }

  protected cancel(): void {
    this.ref.close(false);
  }
}
