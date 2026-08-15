import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { GogDropdownOption, MultiselectComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [MultiselectComponent, ReactiveFormsModule],
  template: `
    <gog-multiselect
      label="Permissions"
      placeholder="Pick at least one..."
      [options]="permissionsWithDisabled"
      [formControl]="permissionsFormControl"
      errorMessage="Pick at least one permission."
      errorDisplay="auto"
    />
  `,
})
export class MultiselectFormExample {
  protected readonly permissionsWithDisabled = [
    { id: 'read', name: 'Read' },
    { id: 'write', name: 'Write' },
    { id: 'admin', name: 'Admin (owner only)', disabled: true },
  ];

  protected readonly permissionsFormControl = new FormControl<(string | number)[]>([], {
    nonNullable: true,
    validators: Validators.required,
  });
}
