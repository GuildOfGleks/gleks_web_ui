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
  imports: [ButtonComponent],
  template: `
    <gog-button (gogClick)="openCustomContent()">Open custom dialog</gog-button>
    <!-- <gog-dialog /> is mounted once at the root of the app, not here — see the import
         snippet above. This page mounts it in its own root component, and the StackBlitz
         project this example opens in does the same. -->
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
    }
  `,
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
