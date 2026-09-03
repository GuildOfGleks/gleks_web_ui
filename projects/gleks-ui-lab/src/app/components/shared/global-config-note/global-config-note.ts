import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GLOBAL_CONFIG_BY_COMPONENT } from '../global-config-data';
import { RipplePreference } from '../ripple-preference';

/**
 * The "Global Configuration" section every component doc page renders — `docs/feedback-triage.md`
 * item 8. One component instead of 34 copies of the same markup: each page passes its own slug
 * (`components/<slug>` in `nav-data.ts`), and this looks up `global-config-data.ts`, which holds
 * the per-component view of `GOG_CONFIG` that the library's own `config.ts` cannot give — that
 * file is organised by key, this page needs it by component.
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

  /**
   * This site sets `ripple.enabled: true` app-wide (`app.config.ts`) so the demos actually show
   * the press feedback; the library's own default is `false`. Every page that lists the key says
   * so, rather than leaving a reader to infer a default from what they see here — which is the
   * mistake that produced a "the ripple does not work" report against a ripple nobody had
   * switched on (`docs/feedback-triage.md`, finding 3).
   */
  protected readonly deviatesOnRipple = computed(() =>
    this.entries().some((entry) => entry.key === 'ripple.enabled'),
  );

  /**
   * The note names the current state rather than only the site's default, because the header's
   * ripple toggle can change it: a reader who has switched the ripple off should not be told by
   * this paragraph that the demos above are showing it.
   */
  protected readonly rippleOn = inject(RipplePreference).enabled;
}
