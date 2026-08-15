import { Component, inject } from '@angular/core';
import { ButtonComponent, DIALOG_REF, DialogRef, DialogService } from '@guildofgleks/ui';

@Component({
  selector: 'app-dialog-body',
  imports: [ButtonComponent],
  template: `
    <p>The dialog's body is a component of your own — it receives DIALOG_REF, so it can close.</p>
    <gog-button size="sm" (gogClick)="ref.close()">Close from the body</gog-button>
  `,
})
export class DialogOptionsBodyComponent {
  protected readonly ref = inject<DialogRef<void>>(DIALOG_REF);
}

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [ButtonComponent],
})
export class DialogOptionsExample {
  private readonly dialogService = inject(DialogService);

  // No header close button, and Escape and backdrop clicks are ignored: the only way out is a
  // control you render yourself. For a decision the user must actually make.
  protected openNonClosable(): void {
    this.dialogService.open({
      title: 'Confirm before closing',
      component: DialogOptionsBodyComponent,
      closable: false,
    });
  }

  // No backdrop and no focus trap — the page behind stays usable.
  protected openNonModal(): void {
    this.dialogService.open({
      title: 'Non-modal',
      component: DialogOptionsBodyComponent,
      modal: false,
    });
  }

  protected openWide(): void {
    this.dialogService.open({
      title: 'Wide dialog',
      component: DialogOptionsBodyComponent,
      width: '720px',
    });
  }
}
