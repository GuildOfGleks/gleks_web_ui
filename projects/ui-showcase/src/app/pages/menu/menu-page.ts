import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  GogButtonDirective,
  GogMenuItemDirective,
  GogMenuTriggerDirective,
  IconComponent,
  MenuComponent,
} from '@guildofgleks/ui';

import { DocAttrs } from '../../doc/doc-attrs';
import { DocCell, DocMatrix } from '../../doc/doc-matrix';
import { DocPage } from '../../doc/doc-page';
import { DocSection } from '../../doc/doc-section';

@Component({
  selector: 'app-menu-page',
  imports: [
    GogButtonDirective,
    GogMenuItemDirective,
    GogMenuTriggerDirective,
    IconComponent,
    MenuComponent,
    DocAttrs,
    DocCell,
    DocMatrix,
    DocPage,
    DocSection,
  ],
  templateUrl: './menu-page.html',
  styleUrl: './menu-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuPage {
  protected readonly branches = Array.from({ length: 24 }, (_, index) => `release/21.${index}`);
  protected readonly files = ['report.pdf', 'budget.xlsx', 'notes.md'];

  /** The single column of a matrix whose rows are the only axis. */
  protected readonly controlColumn = ['trigger'] as const;
  protected readonly a11yRows = ['closed'] as const;

  protected readonly lastAction = signal('none yet');
  protected readonly closedCount = signal(0);
  protected readonly locked = signal(true);

  protected act(action: string): void {
    this.lastAction.set(action);
  }
}
