import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonNativeTypeExample {
  protected readonly result = signal('Neither button pressed yet.');

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.result.set('Submitted via type="submit".');
  }

  protected onReset(): void {
    this.result.set('Reset via type="reset".');
  }
}
