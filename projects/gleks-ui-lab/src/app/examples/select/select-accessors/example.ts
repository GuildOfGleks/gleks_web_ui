import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { GogDropdownOptionDirective, SelectComponent } from '@guildofgleks/ui';

/** A DTO with no `id` or `name` — the shape a real API returns. */
interface Member {
  readonly uuid: string;
  readonly profile: { readonly fullName: string; readonly role: string };
  readonly suspended: boolean;
}

@Component({
  selector: 'app-example',
  imports: [GogDropdownOptionDirective, SelectComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectAccessorsExample {
  protected readonly members: readonly Member[] = [
    { uuid: 'u1', profile: { fullName: 'Ada Lovelace', role: 'Maintainer' }, suspended: false },
    { uuid: 'u2', profile: { fullName: 'Alan Turing', role: 'Reviewer' }, suspended: false },
    { uuid: 'u3', profile: { fullName: 'Grace Hopper', role: 'Admin' }, suspended: true },
  ];
  protected readonly fullName = (member: Member) => member.profile.fullName;
  protected readonly memberId = signal<string | null>('u1');
  protected readonly member = signal<Member | null>(null);
}
