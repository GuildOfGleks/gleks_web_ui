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
export class SelectAccessorsExample {
  protected readonly users: User[] = [
    { uuid: 'u-1', profile: { fullName: 'Ada Lovelace', role: 'Engineering' }, suspended: false },
    { uuid: 'u-2', profile: { fullName: 'Grace Hopper', role: 'Engineering' }, suspended: false },
    { uuid: 'u-3', profile: { fullName: 'Katherine Johnson', role: 'Research' }, suspended: true },
  ];

  // An id…
  protected readonly userId = signal<string | number | null>(null);
  // …or the object itself, the same reference that went in.
  protected readonly userObject = signal<User | null>(null);
}
