import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MultiselectComponent, GogDropdownOptionDirective } from '@guildofgleks/ui';

interface Member {
  readonly uuid: string;
  readonly profile: { readonly fullName: string; readonly role: string };
  readonly suspended: boolean;
}

@Component({
  selector: 'app-example',
  imports: [MultiselectComponent, GogDropdownOptionDirective],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiselectAccessorsExample {
  protected readonly members: readonly Member[] = [
    { uuid: 'u1', profile: { fullName: 'Ada Lovelace', role: 'Maintainer' }, suspended: false },
    { uuid: 'u2', profile: { fullName: 'Alan Turing', role: 'Reviewer' }, suspended: false },
    { uuid: 'u3', profile: { fullName: 'Grace Hopper', role: 'Admin' }, suspended: true },
  ];
  protected readonly fullName = (member: Member) => member.profile.fullName;
  protected readonly memberIds = signal<string[]>(['u1']);
  protected readonly selected = signal<Member[]>([]);
}
