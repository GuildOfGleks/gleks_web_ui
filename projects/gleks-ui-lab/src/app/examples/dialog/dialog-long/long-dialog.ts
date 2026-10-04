import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ButtonComponent } from '@guildofgleks/ui';
import { DIALOG_REF } from '@guildofgleks/ui/dialog';

@Component({
  selector: 'app-long-dialog',
  imports: [ButtonComponent],
  templateUrl: './long-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LongDialog {
  protected readonly ref = inject(DIALOG_REF);
  protected readonly paragraphs = Array.from(
    { length: 24 },
    (_, index) => `Paragraph ${index + 1}`,
  );
}
