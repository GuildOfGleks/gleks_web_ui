import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FileUploadComponent, type GogFileRejection } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [FileUploadComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploadValidationExample {
  protected readonly files = signal<File[]>([]);
  protected readonly rejected = signal<GogFileRejection[]>([]);
}
