import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ButtonComponent } from '@guildofgleks/ui';
import { DialogService } from '@guildofgleks/ui/dialog';
import { LongDialog } from './long-dialog';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogLongExample {
  private readonly dialogs = inject(DialogService);

  protected open(): void {
    this.dialogs.open({ title: 'Release notes', component: LongDialog, width: '32rem' });
  }
}
