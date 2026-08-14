import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  computed,
  input,
  inject,
  isDevMode,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { GogIconName, ICON_DEFS } from '../../shared/icons';
import { GOG_ICONS } from '../../shared/icon-registry';

export type { GogIconName, GogBuiltinIconName } from '../../shared/icons';

/**
 * Names already warned about, so a missing icon rendered in a `@for` logs once rather than once
 * per row. Module-level because the point is one message per name per page, not per component.
 */
const warnedNames = new Set<string>();

@Component({
  selector: 'gog-icon',
  imports: [NgTemplateOutlet],
  template: `
    @if (template(); as iconTpl) {
      <ng-container *ngTemplateOutlet="iconTpl" />
    } @else if (iconSvg(); as svg) {
      <span [innerHTML]="svg"></span>
    }
  `,
  styleUrl: './icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'gog-icon',
    '[attr.aria-hidden]': 'ariaHidden() ? "true" : null',
    '[attr.aria-label]': 'ariaHidden() ? null : ariaLabel()',
  },
})
export class IconComponent {
  private readonly sanitizer = inject(DomSanitizer);
  /** App-registered icons; overrides a built-in of the same name. See `provideGogIcons`. */
  private readonly registered = inject(GOG_ICONS);

  /** A built-in name, or one registered through `provideGogIcons(...)`. */
  readonly name = input<GogIconName>('close');
  readonly template = input<TemplateRef<unknown> | null>(null);
  readonly title = input('');
  readonly ariaHidden = input(true);

  protected readonly ariaLabel = computed(() =>
    this.ariaHidden() ? null : this.title() || this.name(),
  );

  /**
   * The markup to render, or `null` when the name resolves to nothing.
   *
   * An unknown name renders **nothing** and warns in dev mode — it never throws. An icon is
   * decoration: taking an app down mid-render over a typo in a glyph name would be a far worse
   * failure than the missing glyph, and the warning is what gets the typo fixed.
   */
  protected readonly iconSvg = computed(() => {
    const name = this.name();
    const markup = this.registered[name] ?? ICON_DEFS[name as keyof typeof ICON_DEFS];

    if (!markup) {
      if (isDevMode() && !warnedNames.has(name)) {
        warnedNames.add(name);
        console.warn(
          `[gog-icon] No icon named "${name}". Register it with provideGogIcons({ '${name}': '<svg…>' }), or use one of the built-ins.`,
        );
      }
      return null;
    }

    return this.sanitizer.bypassSecurityTrustHtml(markup);
  });
}
