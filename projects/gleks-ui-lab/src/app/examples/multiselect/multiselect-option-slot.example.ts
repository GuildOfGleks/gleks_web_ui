import { Component, signal } from '@angular/core';
import { GogDropdownOptionDirective, MultiselectComponent } from '@guildofgleks/ui';

interface User {
  readonly id: number;
  readonly profile: { readonly fullName: string; readonly role: string };
}

@Component({
  selector: 'app-example',
  imports: [MultiselectComponent, GogDropdownOptionDirective],
  template: `
    <gog-multiselect optionLabel="profile.fullName" [options]="users" [(value)]="reviewerIds">
      <ng-template gogDropdownOption let-user let-label="label">
        <strong>{{ label }}</strong>
        <small>{{ asUser(user).profile.role }}</small>
      </ng-template>
    </gog-multiselect>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
      max-width: 420px;
    }
  `,
})
export class MultiselectOptionSlotExample {
  protected readonly users: User[] = [
    { id: 1, profile: { fullName: 'Ada Lovelace', role: 'Engineering' } },
    { id: 2, profile: { fullName: 'Grace Hopper', role: 'Engineering' } },
    { id: 3, profile: { fullName: 'Katherine Johnson', role: 'Research' } },
  ];
  protected readonly reviewerIds = signal<(string | number)[]>([]);

  // The slot hands the option back as `unknown`, so narrow it once here.
  protected asUser(option: unknown): User {
    return option as User;
  }
}
