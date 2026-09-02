import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GLOBAL_CONFIG_BY_COMPONENT } from '../global-config-data';

/**
 * The "Global Configuration" section every component doc page renders — `docs/feedback-triage.md`
 * item 8. One component instead of 34 copies of the same markup: each page passes its own slug
 * (`components/<slug>` in `nav-data.ts`), and this looks up `global-config-data.ts`, the table
 * that resolves the gap in `@guildofgleks/ui`'s own `config.ts` JSDoc (`docs/backlog.md`).
 */
@Component({
  selector: 'app-global-config-note',
  imports: [RouterLink],
  templateUrl: './global-config-note.html',
  styleUrl: './global-config-note.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlobalConfigNote {
  readonly component = input.required<string>();

  protected readonly entries = computed(() => GLOBAL_CONFIG_BY_COMPONENT[this.component()] ?? []);
}
