import { Component, signal } from '@angular/core';
import { PaginatorComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [PaginatorComponent],
})
export class PaginatorWindowModeExample {
  protected readonly page = signal(10);
  protected readonly totalPages = signal(20);
}
