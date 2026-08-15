import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonFormTypeExample {
  protected readonly result = signal('Neither button pressed yet.');

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.result.set('Form submitted.');
  }
}
