import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ButtonComponent } from '@guildofgleks/ui';
import { DIALOG_DATA, DIALOG_REF } from '../dialog.tokens';

export interface ConfirmDialogData {
  title: string;
  /**
   * Id for the heading. Pass the same string as the dialog's `ariaLabelledBy` to name the dialog
   * by this heading instead of repeating it as a `title`. Unset, one is generated.
   */
  titleId?: string;
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
  protected readonly titleId = this.data.titleId ?? `confirm-title-${this.instanceId}`;
  private readonly ref = inject(DIALOG_REF);

  protected confirm(): void {
    this.ref.close(true);
  }

  protected cancel(): void {
    this.ref.close(false);
  }
}
