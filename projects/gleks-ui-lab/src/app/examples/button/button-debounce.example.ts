import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Leading-edge throttle: the first click fires immediately, the rest are dropped until
         "debounce" ms have passed. Default is 300; 1000 here to make it obvious. -->
    <gog-button variant="primary" [debounce]="1000" (gogClick)="accepted.set(accepted() + 1)">
      Click me fast
    </gog-button>
    <p>Accepted clicks: {{ accepted() }}</p>
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
    }
  `,
})
export class ButtonDebounceExample {
  protected readonly accepted = signal(0);
}
