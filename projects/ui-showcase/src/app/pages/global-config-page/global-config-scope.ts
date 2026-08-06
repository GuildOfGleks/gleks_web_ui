import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  ButtonComponent,
  GogTooltipDirective,
  InputfieldComponent,
  ScrollComponent,
  provideGogConfig,
} from '@guildofgleks/ui';

/**
 * Everything under this component's own template reads `GOG_CONFIG` from an injector that
 * has `provideGogConfig(...)` in its `providers` — scoped to this subtree only, the rest of
 * the page (and the app) is untouched. This is the same call a real app makes once in
 * `app.config.ts` to set it for everything; putting it in a component's own `providers`
 * here is only so this page can show the "before" and "after" side by side without two
 * separate apps.
 */
@Component({
  selector: 'app-global-config-scope',
  imports: [ButtonComponent, GogTooltipDirective, InputfieldComponent, ScrollComponent],
  templateUrl: './global-config-scope.html',
  styleUrl: './global-config-scope.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideGogConfig({
      button: { debounce: 1500 },
      scroll: { autoHide: false },
      tooltip: { showDelay: 800, hideDelay: 400, position: 'bottom' },
      floatLabel: { variant: 'in' },
    }),
  ],
})
export class GlobalConfigScopeComponent {
  protected readonly clickCount = signal(0);
  protected readonly emailValue = signal('');
  protected readonly paragraphs = Array.from(
    { length: 8 },
    (_, i) => `Configured paragraph ${i + 1} — this scrollbar never auto-hides.`,
  );

  protected onClick(): void {
    this.clickCount.update((count) => count + 1);
  }

  protected reset(): void {
    this.clickCount.set(0);
  }
}
