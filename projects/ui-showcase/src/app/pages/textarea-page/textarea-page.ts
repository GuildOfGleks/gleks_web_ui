import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TextareaComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-textarea-page',
  imports: [TextareaComponent, ReactiveFormsModule],
  templateUrl: './textarea-page.html',
  styleUrl: './textarea-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextareaPage {
  protected readonly bio = signal(
    'Ada Lovelace wrote the first published algorithm intended for machine execution.',
  );
  protected readonly notes = signal('');
  protected readonly notesError = computed(() =>
    this.notes().length > 140 ? 'Keep it under 140 characters.' : '',
  );

  protected readonly disabledValue = signal('This field cannot be edited');

  /** Drives the `errorDisplay="auto"` demo — timing comes entirely from the control. */
  protected readonly feedbackControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(10)],
  });

  private readonly feedbackValue = toSignal(this.feedbackControl.valueChanges, {
    initialValue: this.feedbackControl.value,
  });

  protected readonly feedbackErrorMessage = computed(() => {
    // Re-read on every value change, not statusChanges — status stays 'INVALID' across the
    // required -> minlength transition, so statusChanges never re-emits there and the
    // message would go stale if it were the only trigger (see inputfield-page for the
    // same reasoning).
    this.feedbackValue();
    if (this.feedbackControl.hasError('required')) return 'Feedback is required.';
    if (this.feedbackControl.hasError('minlength'))
      return 'Please write at least 10 characters.';
    return '';
  });
}
