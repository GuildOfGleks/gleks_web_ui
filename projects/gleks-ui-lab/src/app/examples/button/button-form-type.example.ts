import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- "type" is forwarded to the native <button>, so the form's own submit and reset
         behaviour works without a click handler. -->
    <form (submit)="onSubmit($event)" (reset)="result.set('Form reset.')">
      <gog-button variant="primary" type="submit">Submit</gog-button>
      <gog-button variant="outline" type="reset">Reset</gog-button>
    </form>
    <p>{{ result() }}</p>
  `,
  styles: `
    form {
      display: flex;
      gap: 12px;
    }
  `,
})
export class ButtonFormTypeExample {
  protected readonly result = signal('Neither button pressed yet.');

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.result.set('Form submitted.');
  }
}
