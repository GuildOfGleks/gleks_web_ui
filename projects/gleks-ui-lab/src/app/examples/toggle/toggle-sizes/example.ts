import { Component, signal } from '@angular/core';
import { GogSize, ToggleComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [ToggleComponent],
})
export class ToggleSizesExample {
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
  protected readonly sizeState = signal(true);
}
