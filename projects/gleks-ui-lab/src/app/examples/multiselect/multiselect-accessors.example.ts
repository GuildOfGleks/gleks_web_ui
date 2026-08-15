import { Component, signal } from '@angular/core';
import { MultiselectComponent } from '@guildofgleks/ui';

interface User {
  uuid: string;
  profile: { fullName: string; role: string };
  suspended: boolean;
}

@Component({
  selector: 'app-example',
  imports: [MultiselectComponent],
  template: `
    <gog-multiselect
      label="Reviewers"
      optionLabel="profile.fullName"
      optionValue="uuid"
      optionDisabled="suspended"
      [options]="users"
      [(value)]="reviewerIds"
    />
  `,
})
export class MultiselectAccessorsExample {
  protected readonly users: User[] = [/* straight from the API */];
  protected readonly reviewerIds = signal<(string | number)[]>([]);
}
