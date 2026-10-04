import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ButtonComponent } from '@guildofgleks/ui';
import {
  ConfirmationDialogComponent,
  DialogService,
  type ConfirmDialogData,
  type DialogConfig,
} from '@guildofgleks/ui/dialog';

interface Row {
  readonly name: string;
  readonly config: Omit<DialogConfig, 'component'>;
}

@Component({
  selector: 'app-example',
  imports: [ButtonComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogWidthExample {
  private readonly dialogs = inject(DialogService);

  protected readonly rows: Row[] = [
    { name: 'width unset', config: { title: 'Width' } },
    { name: "width: '24rem'", config: { title: 'Width', width: '24rem' } },
    {
      name: "width: '60rem', maxWidth: '36rem'",
      config: { title: 'Width', width: '60rem', maxWidth: '36rem' },
    },
  ];

  protected open(row: Row): void {
    this.dialogs.open<boolean, ConfirmDialogData>({
      ...row.config,
      component: ConfirmationDialogComponent,
      data: {
        title: row.name,
        description:
          'Both are CSS lengths written onto the panel; maxWidth wins when they disagree.',
        confirmText: 'OK',
        cancelText: 'Cancel',
      },
    });
  }
}
