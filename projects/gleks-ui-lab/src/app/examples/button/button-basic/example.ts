import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonBasicExample {
  protected readonly status = signal('No click yet.');

  protected onClick(): void {
    this.status.set(`Clicked at ${new Date().toLocaleTimeString()}`);
  }
}
