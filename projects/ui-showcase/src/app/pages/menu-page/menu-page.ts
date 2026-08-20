import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  ButtonComponent,
  GogButtonDirective,
  GogColumn,
  GogColumnBodyDirective,
  GogMenuItemDirective,
  GogMenuTriggerDirective,
  IconComponent,
  MenuComponent,
  ScrollComponent,
  TableComponent,
} from '@guildofgleks/ui';

interface Document {
  id: number;
  name: string;
  owner: string;
}

@Component({
  selector: 'app-menu-page',
  imports: [
    ButtonComponent,
    GogButtonDirective,
    GogColumn,
    GogColumnBodyDirective,
    GogMenuItemDirective,
    GogMenuTriggerDirective,
    IconComponent,
    MenuComponent,
    ScrollComponent,
    TableComponent,
  ],
  templateUrl: './menu-page.html',
  styleUrl: './menu-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuPage {
  protected readonly lastAction = signal('—');
  protected readonly closes = signal(0);

  protected readonly documents: Document[] = [
    { id: 1, name: 'Q3 roadmap', owner: 'Ada Lovelace' },
    { id: 2, name: 'Runbook', owner: 'Grace Hopper' },
    { id: 3, name: 'Incident 41', owner: 'Alan Turing' },
  ];

  protected run(action: string): void {
    this.lastAction.set(action);
  }

  protected onClosed(): void {
    this.closes.update((count) => count + 1);
  }
}
