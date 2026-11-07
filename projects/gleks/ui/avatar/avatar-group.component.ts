import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Renderer2,
  computed,
  contentChildren,
  effect,
  inject,
  input,
} from '@angular/core';

import { AvatarComponent } from './avatar.component';
import { GOG_CONFIG, GogSize } from '@guildofgleks/ui/shared';

/** Built-in default, used when `GOG_CONFIG.labels.moreAvatars` is unset. */
const DEFAULT_MORE_LABEL = (count: number): string => `${count} more`;

/** Beyond this the `+N` avatar draws `99+`, the way `gogBadge` caps its count; its name stays exact. */
const MORE_TEXT_MAX = 99;

/** The class an avatar beyond `max` carries. Global, in utilities.css, like the rest of the group. */
const OVERFLOWED_CLASS = 'gog-avatar-group__overflowed';

/**
 * A row of `gog-avatar`s that overlap, with a `+N` for the ones past `max`.
 *
 * The avatars are projected rather than passed as data, so each keeps every input it has. The
 * group reaches them in two ways that need no input on the avatar: **size** through
 * `--gog-avatar-size`, the avatar's own instance override, which the group sets on itself and its
 * children inherit — so inside a group an avatar's `size` is the group's; and **overlap and ring**
 * through rules in `utilities.css`, because a scoped stylesheet cannot reach projected content
 * (`gog-collapsible`'s classes live there for the same reason).
 *
 * **`max` counts the `+N` avatar.** `max="4"` with seven avatars draws three and `+4`, so the
 * group's width is known from `max` alone. The ones not drawn are `display: none`, which takes them
 * out of the accessibility tree too; the `+N` avatar is named for them ("4 more").
 */
@Component({
  selector: 'gog-avatar-group',
  imports: [AvatarComponent],
  templateUrl: './avatar-group.component.html',
  styleUrl: './avatar-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'gog-avatar-group',
    role: 'group',
    '[attr.aria-label]': 'ariaLabel() || null',
    '[style.--gog-avatar-size]': 'sizeToken()',
  },
})
export class AvatarGroupComponent {
  /** The most avatars drawn, the `+N` one included. Unset, every avatar is drawn. */
  readonly max = input<number | null>(null);
  /** One size for the whole row; an avatar's own `size` does not apply inside a group. */
  readonly size = input<GogSize>('md');
  /** Names the group — "Assignees", "Shared with". */
  readonly ariaLabel = input<string | undefined>(undefined);

  private readonly globalConfig = inject(GOG_CONFIG);
  private readonly renderer = inject(Renderer2);
  private readonly avatars = contentChildren(AvatarComponent, { read: ElementRef });

  /** How many projected avatars are drawn. With an overflow, one slot goes to the `+N`. */
  private readonly shownCount = computed(() => {
    const total = this.avatars().length;
    const max = this.max();
    if (max === null || total <= max) return total;
    return Math.max(0, Math.floor(max) - 1);
  });
  protected readonly hiddenCount = computed(() => this.avatars().length - this.shownCount());

  protected readonly moreText = computed(() => {
    const count = this.hiddenCount();
    return count > MORE_TEXT_MAX ? `${MORE_TEXT_MAX}+` : `+${count}`;
  });
  protected readonly moreName = computed(() =>
    (this.globalConfig.labels?.moreAvatars ?? DEFAULT_MORE_LABEL)(this.hiddenCount()),
  );

  protected readonly sizeToken = computed(() => `var(--gog-avatar-${this.size()}-size)`);

  constructor() {
    effect(() => {
      const shown = this.shownCount();
      this.avatars().forEach((avatar, index) => {
        const element = avatar.nativeElement as HTMLElement;
        if (index < shown) this.renderer.removeClass(element, OVERFLOWED_CLASS);
        else this.renderer.addClass(element, OVERFLOWED_CLASS);
      });
    });
  }
}
