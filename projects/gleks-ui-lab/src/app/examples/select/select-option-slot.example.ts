import { Component, signal } from '@angular/core';
import { GogDropdownOptionDirective, SelectComponent } from '@guildofgleks/ui';

interface User {
  readonly id: number;
  readonly profile: { readonly fullName: string; readonly role: string };
}

@Component({
  selector: 'app-example',
  imports: [SelectComponent, GogDropdownOptionDirective],
  template: `
    <gog-select optionLabel="profile.fullName" [options]="users" [(value)]="userId">
      <ng-template gogDropdownOption let-user let-label="label">
        <strong>{{ label }}</strong>
        <small>{{ asUser(user).profile.role }}</small>
      </ng-template>
    </gog-select>
  `,
})
export class SelectOptionSlotExample {
  protected readonly users: User[] = [
    { id: 1, profile: { fullName: 'Ada Lovelace', role: 'Engineering' } },
    { id: 2, profile: { fullName: 'Grace Hopper', role: 'Engineering' } },
    { id: 3, profile: { fullName: 'Katherine Johnson', role: 'Research' } },
  ];
  protected readonly userId = signal<string | number | null>(null);

  // The slot hands the option back as `unknown`, so narrow it once here.
  protected asUser(option: unknown): User {
    return option as User;
  }
}
