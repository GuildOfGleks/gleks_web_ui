import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonNativeTypeExample {
  protected readonly submits = signal({ unset: 0, submit: 0, loading: 0 });
  protected readonly resets = signal(0);

  protected submit(event: Event, key: 'unset' | 'submit' | 'loading'): void {
    event.preventDefault();
    this.submits.update((submits) => ({ ...submits, [key]: submits[key] + 1 }));
  }
}
