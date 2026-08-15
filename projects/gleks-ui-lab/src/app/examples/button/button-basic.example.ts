import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <gog-button variant="primary" (gogClick)="onClick()">Click me</gog-button>
    <p>{{ status() }}</p>
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
export class ButtonBasicExample {
  protected readonly status = signal('No click yet.');

  protected onClick(): void {
    this.status.set(`Clicked at ${new Date().toLocaleTimeString()}`);
  }
}
