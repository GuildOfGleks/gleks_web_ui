import { Component, signal } from '@angular/core';
import { SelectComponent } from '@guildofgleks/ui';

interface User {
  uuid: string;
  profile: { fullName: string; role: string };
  suspended: boolean;
}

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [SelectComponent],
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
