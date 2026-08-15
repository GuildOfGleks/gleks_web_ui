import { Component } from '@angular/core';
import { ScrollComponent, provideGogConfig } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [ScrollComponent],
  // In an app this goes in `appConfig.providers` and applies everywhere. Provided on the
  // component here so the defaults are scoped to this example — that scoping is itself the
  // point: a lazy feature can set its own without touching the rest of the app.
  providers: [
    provideGogConfig({
      scroll: { size: 'thin', hideDelay: 1200, overscrollBehavior: 'contain' },
    }),
  ],
})
export class ScrollConfigExample {
  protected readonly rows = Array.from({ length: 30 }, (_, index) => `Row ${index + 1}`);
}
