import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  GogButtonDirective,
  GogColumn,
  GogColumnBodyDirective,
  GogMenuItemDirective,
  GogMenuTriggerDirective,
  IconComponent,
  MenuComponent,
  TableComponent,
} from '@guildofgleks/ui';

interface DocumentRow {
  readonly id: number;
  readonly name: string;
  readonly owner: string;
}

@Component({
  selector: 'app-example',
  imports: [
    TableComponent,
    GogColumn,
    GogColumnBodyDirective,
    GogButtonDirective,
    MenuComponent,
    GogMenuTriggerDirective,
    GogMenuItemDirective,
    IconComponent,
  ],
  templateUrl: './example.html',
  styleUrl: './example.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuRowActionsExample {
  // gog-table's `value` takes a mutable T[], so this is not `readonly Document[]`.
  protected readonly documents: DocumentRow[] = [
    { id: 1, name: 'Q3 roadmap', owner: 'Ada' },
    { id: 2, name: 'Design tokens', owner: 'Grace' },
    { id: 3, name: 'Release notes', owner: 'Linus' },
  ];

  protected readonly lastAction = signal('—');

  protected run(action: string): void {
    this.lastAction.set(action);
  }
}
