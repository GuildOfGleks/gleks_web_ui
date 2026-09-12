import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  TemplateRef,
  afterNextRender,
  computed,
  contentChild,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

import { ButtonComponent } from '../button/button.component';
import { IconComponent, type GogIconName } from '../icon/icon.component';
import { GOG_CONFIG, resolveConfigured } from '../../shared/config';
import { GogAlertLive, GogSeverity } from '../../shared/types';

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

/** Severities whose default announcement interrupts. See `GogAlertLive`. */
const ASSERTIVE_SEVERITIES: readonly GogSeverity[] = ['danger', 'warning'];

/**
 * A persistent, in-flow message — the thing `gog-toast` is not.
 *
 * A toast is transient, queued and portalled to a corner; this renders where it is written and
 * stays until something removes it. `docs/alert.md` has the argument for why it is a component
 * rather than a class, and the short version is that it owns semantics a class cannot express.
 *
 * **How it announces, and why the region is a separate hidden element.** A live region has to be
 * in the DOM *before* the text it announces lands inside it. An alert written as
 * `@if (error()) { <gog-alert>…</gog-alert> }` arrives with its own text in one insertion, and a
 * screen reader routinely skips that — the exact trap `gog-toast-container` exists to work
 * around, and the reason its regions are permanently mounted. So the visible alert renders
 * normally and a visually-hidden region beside it, empty at first, takes a copy of the text one
 * render later. The mutation inside an existing region is what gets announced.
 *
 * That is also why the copy is read off the DOM rather than from an input: the body is projected
 * content, and the component has no other way to know what it says.
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
   * How this message reaches a screen reader. **Defaults from `severity`** — `danger` and
   * `warning` interrupt, the rest wait — which is the less wrong default, since an unannounced
   * error costs more than an over-announced notice.
   *
   * **Set `'off'` for an alert that is on the page when it loads.** That is the commonest case and
   * the one the default gets wrong: a reader arriving at a page does not need it interrupted about
   * a message that was already there. The component cannot tell the two apart — see `GogAlertLive`
   * for what was measured before this was left to you.
   */
  readonly live = input<GogAlertLive | undefined>(undefined);

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

  protected readonly resolvedLive = computed<GogAlertLive>(
    () => this.live() ?? (ASSERTIVE_SEVERITIES.includes(this.severity()) ? 'assertive' : 'polite'),
  );

  /** `role` and `aria-live` both, because support for either alone is uneven. */
  protected readonly liveRole = computed(() =>
    this.resolvedLive() === 'assertive'
      ? 'alert'
      : this.resolvedLive() === 'polite'
        ? 'status'
        : null,
  );

  private readonly contentEl = viewChild<ElementRef<HTMLElement>>('content');
  /**
   * Empty until after the first render, which is the whole mechanism: the region exists, then the
   * text arrives inside it. Filling it during the first render would announce nothing.
   */
  protected readonly announcement = signal('');

  constructor() {
    afterNextRender(() => {
      if (this.resolvedLive() === 'off') return;
      const text = this.contentEl()?.nativeElement.textContent?.trim() ?? '';
      if (text) this.announcement.set(text);
    });
  }

  protected readonly hostClasses = computed(() =>
    ['gog-alert', `gog-alert--${this.severity()}`, this.hasIcon() ? 'gog-alert--has-icon' : null]
      .filter((className): className is string => className !== null)
      .join(' '),
  );

  protected onDismiss(): void {
    this.dismissed.emit();
  }
}
