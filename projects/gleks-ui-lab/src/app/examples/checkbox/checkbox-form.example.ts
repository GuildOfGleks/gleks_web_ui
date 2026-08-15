import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CheckboxComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [CheckboxComponent, ReactiveFormsModule],
  template: `<gog-checkbox label="Subscribe" [formControl]="control" />`,
})
export class CheckboxFormExample {
  protected readonly control = new FormControl(false, { nonNullable: true });
}
