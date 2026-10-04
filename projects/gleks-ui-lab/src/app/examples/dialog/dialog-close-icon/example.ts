import { ChangeDetectionStrategy, Component, TemplateRef, inject, viewChild } from '@angular/core';
import { ButtonComponent, IconComponent } from '@guildofgleks/ui';
import {
  ConfirmationDialogComponent,
  DialogService,
  type ConfirmDialogData,
} from '@guildofgleks/ui/dialog';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, IconComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogCloseIconExample {
  private readonly dialogs = inject(DialogService);
  private readonly closeGlyph = viewChild.required<TemplateRef<unknown>>('closeGlyph');

  protected open(kind: 'name' | 'template'): void {
    this.dialogs.open<boolean, ConfirmDialogData>({
      title: kind === 'name' ? "closeIconName: 'arrow-left'" : 'closeIconTemplate',
      component: ConfirmationDialogComponent,
      ...(kind === 'name'
        ? { closeIconName: 'arrow-left' }
        : { closeIconTemplate: this.closeGlyph() }),
      data: {
        title: 'A different close glyph',
        description: 'Only the look changes: the button keeps its name, its focus ring and Escape.',
        confirmText: 'OK',
        cancelText: 'Cancel',
      },
    });
  }
}
