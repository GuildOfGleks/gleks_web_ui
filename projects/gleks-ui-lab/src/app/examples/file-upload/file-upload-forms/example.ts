import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FileUploadComponent, ButtonComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, FileUploadComponent, ReactiveFormsModule],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploadFormsExample {
  protected readonly contract = new FormControl<File[]>([], {
    nonNullable: true,
    validators: Validators.required,
  });
}
