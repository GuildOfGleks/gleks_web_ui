import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FileUploadComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [FileUploadComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploadStatesExample {}
