import { Component, inject } from '@angular/core';
import {
  ButtonComponent,
  DIALOG_DATA,
  DIALOG_REF,
  DialogRef,
  DialogService,
} from '@guildofgleks/ui';

interface StackedData {
  readonly message: string;
}

@Component({
  selector: 'app-stacked-body',
  imports: [ButtonComponent],
  template: `
    <p>{{ data.message }}</p>
    <gog-button size="sm" (gogClick)="openAnother()">Open another on top</gog-button>
    <gog-button size="sm" variant="outline" (gogClick)="ref.close()">Close</gog-button>
  `,
})
export class StackedBodyComponent {
  private readonly dialogService = inject(DialogService);
  protected readonly data = inject<StackedData>(DIALOG_DATA);
  protected readonly ref = inject<DialogRef<void>>(DIALOG_REF);

  // The body is an ordinary component, so it can inject DialogService and open another.
  protected openAnother(): void {
    this.dialogService.open({
      title: 'Stacked dialog',
      component: StackedBodyComponent,
      data: { message: 'Each open() call stacks on top with an increasing z-index.' },
    });
  }
}

@Component({
  selector: 'app-example',
  imports: [ButtonComponent],
  template: `<gog-button (gogClick)="open()">Open the first one</gog-button>`,
})
export class DialogStackedExample {
  private readonly dialogService = inject(DialogService);

  protected open(): void {
    this.dialogService.open({
      title: 'Stacked dialog',
      component: StackedBodyComponent,
      data: { message: 'Open another from inside this one — they stack.' },
    });
  }
}
