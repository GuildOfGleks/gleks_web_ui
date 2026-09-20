import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  AutocompleteComponent,
  GogDropdownChevronDirective,
  GogDropdownOptionDirective,
  IconComponent,
  MultiselectComponent,
  SelectComponent,
  type GogDropdownOption,
} from '@guildofgleks/ui';

import { DocAttrs } from '../../doc/doc-attrs';
import { DocCell, DocMatrix } from '../../doc/doc-matrix';
import { DocPage } from '../../doc/doc-page';
import { DocSection } from '../../doc/doc-section';

/** A DTO with no `id`/`name` at all — the shape a real API returns. */
interface Member {
  readonly uuid: string;
  readonly profile: { readonly fullName: string; readonly role: string };
  readonly suspended: boolean;
}

@Component({
  selector: 'app-dropdown-templates-page',
  imports: [
    AutocompleteComponent,
    GogDropdownChevronDirective,
    GogDropdownOptionDirective,
    IconComponent,
    MultiselectComponent,
    SelectComponent,
    DocAttrs,
    DocCell,
    DocMatrix,
    DocPage,
    DocSection,
  ],
  templateUrl: './dropdown-templates-page.html',
  styleUrl: './dropdown-templates-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownTemplatesPage {
  protected readonly frameworks: GogDropdownOption[] = [
    { id: 'angular', name: 'Angular' },
    { id: 'react', name: 'React' },
    { id: 'vue', name: 'Vue' },
    { id: 'svelte', name: 'Svelte (deprecated here)', disabled: true },
  ];

  protected readonly members: Member[] = [
    { uuid: 'u1', profile: { fullName: 'Ada Lovelace', role: 'Maintainer' }, suspended: false },
    { uuid: 'u2', profile: { fullName: 'Alan Turing', role: 'Reviewer' }, suspended: false },
    { uuid: 'u3', profile: { fullName: 'Grace Hopper', role: 'Admin' }, suspended: true },
  ];
  protected readonly memberLabel = (member: Member) => member.profile.fullName;

  /** The two axes of the "where each one works" matrix. */
  protected readonly slots = ['gogDropdownOption', 'gogDropdownChevron'] as const;
  protected readonly hosts = ['gog-select', 'gog-multiselect', 'gog-autocomplete'] as const;

  /** The single column of a matrix whose rows are the only axis. */
  protected readonly controlColumn = ['control'] as const;

  protected readonly a11yRows = [
    'default row',
    'gogDropdownOption row',
    'the chevron slot',
  ] as const;

  protected readonly framework = signal<string | number | null>('angular');
  protected readonly picked = signal<Member | null>(null);
  protected readonly many = signal<(string | number)[]>(['angular', 'vue']);

  protected name(member: Member | null): string {
    return member?.profile.fullName ?? 'none';
  }
}
