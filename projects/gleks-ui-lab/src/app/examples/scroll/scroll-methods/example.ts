import { Component, viewChild } from '@angular/core';
import { ButtonComponent, ScrollComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [ButtonComponent, ScrollComponent],
})
export class ScrollMethodsExample {
  // Located by type rather than by name: one `gog-scroll` in the template, so there is nothing
  // to disambiguate, and the reference is typed without a generic.
  protected readonly scroller = viewChild.required(ScrollComponent);

  protected readonly rows = Array.from({ length: 30 }, (_, index) => `Row ${index + 1}`);
}
