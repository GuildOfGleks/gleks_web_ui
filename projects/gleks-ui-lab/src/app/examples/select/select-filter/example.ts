import { Component, signal } from '@angular/core';
import { SelectComponent } from '@guildofgleks/ui';

interface User {
  readonly id: number;
  readonly profile: { readonly fullName: string; readonly role: string };
}

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [SelectComponent],
})
export class SelectFilterExample {
  protected readonly users: User[] = [
    { id: 1, profile: { fullName: 'Ada Lovelace', role: 'Engineering' } },
    { id: 2, profile: { fullName: 'Grace Hopper', role: 'Engineering' } },
    { id: 3, profile: { fullName: 'Katherine Johnson', role: 'Research' } },
  ];
  protected readonly userId = signal<string | number | null>(null);

  // Searches a field the label never shows.
  protected readonly matchNameOrRole = (user: User, query: string): boolean => {
    const needle = query.toLowerCase();
    return (
      user.profile.fullName.toLowerCase().includes(needle) ||
      user.profile.role.toLowerCase().includes(needle)
    );
  };
}
