import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  GogButtonDirective,
  CardComponent,
  EmptyStateComponent,
  GogCardHeaderDirective,
  GogEmptyStateActionsDirective,
  GogEmptyStateMediaDirective,
  InputfieldComponent,
  type GogSize,
} from '@guildofgleks/ui';

import { DocAttrs } from '../../doc/doc-attrs';
import { DocCell, DocMatrix } from '../../doc/doc-matrix';
import { DocPage } from '../../doc/doc-page';
import { DocSection } from '../../doc/doc-section';

const INVOICES = ['INV-1041 Acme', 'INV-1042 Globex', 'INV-1043 Initech', 'INV-1044 Umbrella'];

@Component({
  selector: 'app-empty-state-page',
  imports: [
    GogButtonDirective,
    CardComponent,
    EmptyStateComponent,
    GogCardHeaderDirective,
    GogEmptyStateActionsDirective,
    GogEmptyStateMediaDirective,
    InputfieldComponent,
    DocAttrs,
    DocCell,
    DocMatrix,
    DocPage,
    DocSection,
  ],
  templateUrl: './empty-state-page.html',
  styleUrl: './empty-state-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStatePage {
  protected readonly sizes: readonly GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
  protected readonly column = ['empty state'] as const;

  protected readonly query = signal('');
  protected readonly matches = computed(() => {
    const query = this.query().trim().toLowerCase();
    return INVOICES.filter((invoice) => invoice.toLowerCase().includes(query));
  });

  protected readonly projects = signal<string[]>(['Website refresh']);
  protected addProject(): void {
    this.projects.update((list) => [...list, `Project ${list.length + 1}`]);
  }
  protected removeProject(index: number): void {
    this.projects.update((list) => list.filter((_, i) => i !== index));
  }
}
