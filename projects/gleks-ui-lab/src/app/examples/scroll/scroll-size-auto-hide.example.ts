import { Component, signal } from '@angular/core';
import { ScrollComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ScrollComponent],
  template: `<gog-scroll [size]="size()" [autoHide]="autoHide()" style="height: 160px"
    >…</gog-scroll
  >`,
})
export class ScrollSizeAutoHideExample {
  protected readonly size = signal<'normal' | 'thin'>('normal');
  protected readonly autoHide = signal(true);
}
