import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TextareaComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [TextareaComponent, ReactiveFormsModule],
  template: `
    <gog-textarea
      label="Comment"
      [formControl]="commentControl"
      errorMessage="At least 10 characters"
      errorDisplay="auto"
    />
  `,
})
export class TextareaFormExample {
  protected readonly commentControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(10)],
  });
}
