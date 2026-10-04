import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FileUploadComponent, type GogSize } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [FileUploadComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploadSizesExample {
  protected readonly sizes: readonly GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
}
