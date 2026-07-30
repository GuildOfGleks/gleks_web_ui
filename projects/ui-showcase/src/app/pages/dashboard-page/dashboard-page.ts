import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  ButtonComponent,
  Column,
  ConfirmationDialogComponent,
  DialogComponent,
  DialogService,
  GogMultiselectOption,
  GogSelectOption,
  GogTagVariant,
  InputfieldComponent,
  MultiselectComponent,
  SelectComponent,
  TableComponent,
  TagComponent,
  TemplateDirective,
  ToastContainerComponent,
  ToastService,
} from '@guildofgleks/ui';

type MemberStatus = 'active' | 'invited' | 'suspended';

interface Member {
  id: number;
  name: string;
  role: string;
  status: MemberStatus;
  teams: string[];
}

const STATUS_VARIANTS: Record<MemberStatus, GogTagVariant> = {
  active: 'success',
  invited: 'info',
  suspended: 'danger',
};

const SEED_MEMBERS: Member[] = [
  { id: 1, name: 'Ada Lovelace', role: 'admin', status: 'active', teams: ['engineering'] },
  { id: 2, name: 'Grace Hopper', role: 'editor', status: 'active', teams: ['engineering', 'design'] },
  { id: 3, name: 'Alan Turing', role: 'admin', status: 'active', teams: ['engineering'] },
  { id: 4, name: 'Margaret Hamilton', role: 'editor', status: 'invited', teams: ['engineering', 'qa'] },
  { id: 5, name: 'Katherine Johnson', role: 'viewer', status: 'active', teams: ['sales'] },
  { id: 6, name: 'Hedy Lamarr', role: 'viewer', status: 'suspended', teams: ['sales', 'design'] },
  { id: 7, name: 'Radia Perlman', role: 'editor', status: 'active', teams: ['engineering'] },
  { id: 8, name: 'Mary Keller', role: 'viewer', status: 'invited', teams: ['qa'] },
];

@Component({
  selector: 'app-dashboard-page',
  imports: [
    ButtonComponent,
    Column,
    DialogComponent,
    InputfieldComponent,
    MultiselectComponent,
    SelectComponent,
    TableComponent,
    TagComponent,
    TemplateDirective,
    ToastContainerComponent,
  ],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  private readonly dialogService = inject(DialogService);
  private readonly toastService = inject(ToastService);

  protected readonly members = signal<Member[]>(SEED_MEMBERS);

  protected readonly search = signal('');
  protected readonly roleFilter = signal<string | number | null>(null);
  protected readonly teamFilter = signal<(string | number)[]>([]);

  protected readonly roleOptions: GogSelectOption[] = [
    { id: 'admin', name: 'Admin' },
    { id: 'editor', name: 'Editor' },
    { id: 'viewer', name: 'Viewer' },
  ];

  protected readonly teamOptions: GogMultiselectOption[] = [
    { id: 'engineering', name: 'Engineering' },
    { id: 'design', name: 'Design' },
    { id: 'sales', name: 'Sales' },
    { id: 'qa', name: 'QA' },
  ];

  protected readonly filteredMembers = computed(() => {
    const search = this.search().trim().toLowerCase();
    const role = this.roleFilter();
    const teams = this.teamFilter();

    return this.members().filter((member) => {
      if (search && !member.name.toLowerCase().includes(search)) return false;
      if (role && member.role !== role) return false;
      if (teams.length > 0 && !teams.some((team) => member.teams.includes(String(team)))) return false;
      return true;
    });
  });

  protected statusVariant(status: MemberStatus): GogTagVariant {
    return STATUS_VARIANTS[status];
  }

  protected teamLabel(id: string): string {
    return this.teamOptions.find((option) => option.id === id)?.name ?? id;
  }

  protected removeMember(member: Member): void {
    const ref = this.dialogService.open<boolean>({
      title: 'Remove team member?',
      component: ConfirmationDialogComponent,
      role: 'alertdialog',
      data: {
        title: 'Remove team member?',
        description: `${member.name} will lose access immediately. This can't be undone.`,
        confirmText: 'Remove',
        cancelText: 'Cancel',
      },
    });

    ref.afterClosed.then((confirmed) => {
      if (!confirmed) return;

      this.members.update((list) => list.filter((entry) => entry.id !== member.id));
      this.toastService.success(`${member.name} removed from the team`);
    });
  }
}
