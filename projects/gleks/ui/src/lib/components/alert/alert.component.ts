import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  TemplateRef,
  computed,
  contentChild,
  inject,
  input,
  output,
} from '@angular/core';

import { ButtonComponent } from '../button/button.component';
import { IconComponent, type GogIconName } from '../icon/icon.component';
import { GOG_CONFIG, resolveConfigured } from '../../shared/config';
import { GogSeverity } from '../../shared/types';

/**
 * Custom markup for the alert's leading icon:
 *
 * ```html
 * <ng-template gogAlertIcon><my-icon /></ng-template>
 * ```
 */
@Directive({ selector: '[gogAlertIcon]' })
export class GogAlertIconDirective {
  readonly templateRef = inject<TemplateRef<unknown>>(TemplateRef);
}

/** Built-in default, used when `GOG_CONFIG.labels.closeAlert` is unset. */
const DEFAULT_CLOSE_LABEL = 'Dismiss message';

/**
 * The icon each severity shows when `iconName` is unset. `'accent'` carries no claim, so it
 * borrows `info`'s glyph rather than having one of its own — there is no icon for "this is a
 * message", and inventing one would say something the severity does not.
 */
const SEVERITY_ICONS: Record<GogSeverity, GogIconName> = {
  accent: 'info',
  success: 'success',
  danger: 'error',
  warning: 'warning',
  info: 'info',
};

/**
 * A persistent, in-flow message — the thing `gog-toast` is not.
 *
 * A toast is transient, queued and portalled to a corner; this renders where it is written and
 * stays until something removes it. `docs/alert.md` has the argument for why it is a component
 * rather than a class, and the short version is that it owns semantics a class cannot express:
 * the live-region role, and the ordering problem underneath it.
 *
 * **Iteration 1 is the visible half only.** It sets no `role` and no `aria-live` yet, which is
 * deliberate and is recorded in the plan: getting that wrong is worse than not having it, because
 * a live region created together with its own text announces nothing while looking correct — the
 * trap `gog-toast-container` already exists to work around. What ships here is complete and
 * honest on its own; the announcement is additive.
 */
@Component({
  selector: 'gog-alert',
  imports: [ButtonComponent, IconComponent],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
  },
})
export class AlertComponent {
  /**
   * What the message *means*. Shared with `gog-button`, `gog-progressbar` and `gogBadge`, so an
   * alert matches the rest of an app for free. `'accent'` is the library's own colour and claims
   * nothing, which is the right default for a notice that is neither good news nor bad.
   */
  readonly severity = input<GogSeverity>('accent');

  /** Optional title, above the projected body. */
  readonly heading = input<string>();

  /** Shows the close button and enables `dismissed`. The alert never removes itself. */
  readonly dismissible = input(false);

  /**
   * Overrides the severity's own glyph. `null` suppresses the icon entirely — for an alert whose
   * body already carries its meaning in words, and where a second signal is noise.
   */
  readonly iconName = input<GogIconName | null | undefined>(undefined);

  /** Projected `gogAlertIcon` template, shown in place of `iconName`. */
  protected readonly iconSlot = contentChild(GogAlertIconDirective);

  /**
   * Pressed, not dismissed: the alert stays in the DOM and the consumer decides what happens.
   * A component that removed itself would take the focused element with it — see `docs/alert.md`
   * §3, which is iteration 2's work.
   */
  readonly dismissed = output<void>();

  private readonly globalConfig = inject(GOG_CONFIG);
  protected readonly closeLabel = computed(() =>
    resolveConfigured(undefined, this.globalConfig.labels?.closeAlert, DEFAULT_CLOSE_LABEL),
  );

  protected readonly hasIcon = computed(() => !!this.iconSlot() || this.iconName() !== null);

  protected readonly resolvedIconName = computed(
    () => this.iconName() ?? SEVERITY_ICONS[this.severity()],
  );

  protected readonly hostClasses = computed(() =>
    ['gog-alert', `gog-alert--${this.severity()}`, this.hasIcon() ? 'gog-alert--has-icon' : null]
      .filter((className): className is string => className !== null)
      .join(' '),
  );

  protected onDismiss(): void {
    this.dismissed.emit();
  }
}
