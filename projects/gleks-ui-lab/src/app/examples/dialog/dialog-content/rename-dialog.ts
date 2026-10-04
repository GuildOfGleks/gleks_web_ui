import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ButtonComponent, InputfieldComponent, SelectComponent } from '@guildofgleks/ui';
import { DIALOG_DATA, DIALOG_REF, type DialogRef } from '@guildofgleks/ui/dialog';

export interface RenameData {
  readonly name: string;
}

export interface RenameResult {
  readonly name: string;
  readonly folder: string | number | null;
}

/** The dialog's body: reads DIALOG_DATA, and closes itself through DIALOG_REF. */
@Component({
  selector: 'app-rename-dialog',
  imports: [ButtonComponent, InputfieldComponent, SelectComponent],
  templateUrl: './rename-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RenameDialog {
  private readonly data = inject<RenameData>(DIALOG_DATA);
  protected readonly ref = inject<DialogRef<RenameResult>>(DIALOG_REF);

  protected readonly name = signal(this.data.name);
  protected readonly folder = signal<string | number | null>('reports');
  protected readonly folders = [
    { id: 'drafts', name: 'Drafts' },
    { id: 'reports', name: 'Reports' },
    { id: 'archive', name: 'Archive' },
  ];

  protected save(): void {
    this.ref.close({ name: this.name(), folder: this.folder() });
  }
}
