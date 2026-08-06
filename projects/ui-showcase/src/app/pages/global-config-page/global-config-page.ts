import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  ButtonComponent,
  GogTooltipDirective,
  InputfieldComponent,
  ScrollComponent,
} from '@guildofgleks/ui';

import { GlobalConfigScopeComponent } from './global-config-scope';

@Component({
  selector: 'app-global-config-page',
  imports: [
    ButtonComponent,
    GogTooltipDirective,
    InputfieldComponent,
    ScrollComponent,
    GlobalConfigScopeComponent,
  ],
  templateUrl: './global-config-page.html',
  styleUrl: './global-config-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlobalConfigPage {
  protected readonly defaultClickCount = signal(0);
  protected readonly defaultEmailValue = signal('');
  protected readonly paragraphs = Array.from(
    { length: 8 },
    (_, i) => `Default paragraph ${i + 1} — this scrollbar fades after ~800ms.`,
  );

  protected onDefaultClick(): void {
    this.defaultClickCount.update((count) => count + 1);
  }

  protected resetDefault(): void {
    this.defaultClickCount.set(0);
  }
}
