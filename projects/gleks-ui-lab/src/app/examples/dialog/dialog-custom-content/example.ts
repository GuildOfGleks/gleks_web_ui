import { Component, inject } from '@angular/core';
import {
  ButtonComponent,
  DIALOG_DATA,
  DIALOG_REF,
  DialogRef,
  DialogService,
} from '@guildofgleks/ui';

interface DemoDialogData {
  message: string;
}

@Component({
  selector: 'app-dialog-body',
  imports: [ButtonComponent],
  template: `
    <p>{{ data.message }}</p>
    <gog-button (gogClick)="ref.close('closed-from-body')">Close</gog-button>
  `,
})
export class DialogBodyComponent {
  protected readonly data = inject<DemoDialogData>(DIALOG_DATA);
  protected readonly ref = inject<DialogRef<string>>(DIALOG_REF);
}

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [ButtonComponent],
})
export class DialogCustomContentExample {
  private readonly dialogService = inject(DialogService);

  protected openCustomContent(): void {
    this.dialogService.open<string>({
      title: 'Custom content',
      component: DialogBodyComponent,
      data: { message: 'Any component can be the dialog body, with typed data passed in.' },
    });
  }
}
