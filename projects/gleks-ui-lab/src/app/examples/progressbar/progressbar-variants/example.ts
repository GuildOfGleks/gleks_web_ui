import { Component } from '@angular/core';
import { GogProgressbarVariant, ProgressbarComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [ProgressbarComponent],
})
export class ProgressbarVariantsExample {
  protected readonly variants: GogProgressbarVariant[] = [
    'accent',
    'success',
    'danger',
    'warning',
    'info',
  ];
}
