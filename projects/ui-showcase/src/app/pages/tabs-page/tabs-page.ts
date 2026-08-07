import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  ButtonComponent,
  GogTabContentDirective,
  GogTabHeaderDirective,
  GogTabsAlign,
  TabComponent,
  TabsComponent,
  TagComponent,
} from '@guildofgleks/ui';

import { LazyPanel } from './lazy-panel';

@Component({
  selector: 'app-tabs-page',
  imports: [
    ButtonComponent,
    GogTabContentDirective,
    GogTabHeaderDirective,
    LazyPanel,
    TabComponent,
    TabsComponent,
    TagComponent,
  ],
  templateUrl: './tabs-page.html',
  styleUrl: './tabs-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsPage {
  protected readonly aligns: GogTabsAlign[] = ['start', 'center', 'end', 'stretch'];
  protected readonly manyTabs = Array.from({ length: 12 }, (_, i) => `Section ${i + 1}`);

  protected readonly index = signal(0);
  protected readonly archiveDisabled = signal(true);
  protected readonly lastChange = signal<number | null>(null);

  protected toggleArchive(): void {
    this.archiveDisabled.update((value) => !value);
  }
}
