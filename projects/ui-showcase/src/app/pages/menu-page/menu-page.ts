import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  ButtonComponent,
  GogButtonDirective,
  GogColumn,
  GogColumnBodyDirective,
  GogMenuItemDirective,
  GogMenuTriggerDirective,
  GogPanelHeaderDirective,
  IconComponent,
  MenuComponent,
  PanelComponent,
  TableComponent,
  ToggleComponent,
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
    GogPanelHeaderDirective,
    IconComponent,
    MenuComponent,
    PanelComponent,
    TableComponent,
    ToggleComponent,
  ],
  templateUrl: './menu-page.html',
  styleUrl: './menu-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuPage {
  protected readonly lastAction = signal('—');
  protected readonly closes = signal(0);
  /** Drives the bound-disabled demo: one toggle, two items that follow it. */
  protected readonly isLocked = signal(true);

  /** Long enough to overflow --gog-menu-max-height, which is what the scroller demo needs. */
  /*
   * Long enough to actually pass `--gog-menu-max-height` (320px by default, about ten items).
   * The list was ten, so the card claiming "a long menu scrolls itself" demonstrated a panel
   * that fitted — which is also why nobody noticed the token was doing nothing until 21.5.1.
   */
  protected readonly branches: string[] = [
    'main',
    'develop',
    'release/21.5.0',
    'release/21.4.4',
    'release/21.4.3',
    'release/21.3.2',
    'feature/menu',
    'feature/rtl',
    'feature/tokens',
    'feature/panel',
    'feature/ripple',
    'hotfix/scroll-clipping',
    'hotfix/input-rtl-padding',
    'experiment/virtualisation',
    'experiment/entry-points',
    'archive/2025',
    'archive/2024',
    'sandbox/roman',
  ];

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
