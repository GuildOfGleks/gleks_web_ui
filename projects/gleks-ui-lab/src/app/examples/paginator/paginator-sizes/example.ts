import { Component, signal } from '@angular/core';
import { GogSize, PaginatorComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [PaginatorComponent],
})
export class PaginatorSizesExample {
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
  protected readonly page = signal(2);
}
