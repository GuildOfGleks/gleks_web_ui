import { Component, signal } from '@angular/core';
import { SelectComponent } from '@guildofgleks/ui';

interface User {
  uuid: string;
  profile: { fullName: string; role: string };
  suspended: boolean;
}

@Component({
  selector: 'app-example',
  imports: [SelectComponent],
  template: `
    <gog-select
      label="Assignee"
      optionLabel="profile.fullName"
      optionValue="uuid"
      optionDisabled="suspended"
      [options]="users"
      [(value)]="userId"
    />

    <gog-select
      label="Assignee (object)"
      optionLabel="profile.fullName"
      [optionValue]="null"
      [options]="users"
      [(value)]="userObject"
    />
  `,
})
export class SelectAccessorsExample {
  protected readonly users: User[] = [/* straight from the API */];

  // An id…
  protected readonly userId = signal<string | number | null>(null);
  // …or the object itself, the same reference that went in.
  protected readonly userObject = signal<User | null>(null);
}
