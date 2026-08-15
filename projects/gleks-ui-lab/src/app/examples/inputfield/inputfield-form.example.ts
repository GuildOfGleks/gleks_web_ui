import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputfieldComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [InputfieldComponent, ReactiveFormsModule],
  template: `
    <gog-inputfield
      label="Email"
      [formControl]="emailControl"
      errorMessage="Enter a valid email"
      errorDisplay="auto"
    />
  `,
})
export class InputfieldFormExample {
  protected readonly emailControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.email],
  });
}
