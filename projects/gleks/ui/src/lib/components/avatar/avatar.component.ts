import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  computed,
  input,
  linkedSignal,
  viewChild,
  booleanAttribute,
} from '@angular/core';

import { IconComponent, type GogIconName } from '../icon/icon.component';
import { GogAvatarShape, GogSize } from '@guildofgleks/ui/shared';

/**
 * The first grapheme of the first word and of the last, upper-cased: "Ada King Lovelace" is `AL`,
 * "Plato" is `P`. Per grapheme rather than per UTF-16 unit, so a name that starts with an emoji or
 * a letter and its combining mark is not cut in half.
 */
export function gogAvatarInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  const first = firstGrapheme(words[0]);
  const last = words.length > 1 ? firstGrapheme(words[words.length - 1]) : '';
  return (first + last).toLocaleUpperCase();
}

function firstGrapheme(word: string): string {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segments = new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(word);
    for (const { segment } of segments) return segment;
    return '';
  }
  return Array.from(word)[0] ?? '';
}

/**
 * A person or an entity, as a picture with a fallback: picture → initials → icon.
 *
 * `docs/avatar.md` has the argument for why this is a component rather than an `<img>` with a
 * class. The short version is the fallback chain: a picture of a person is the image on a page most
 * likely to be missing, and a bare `<img>` shows the broken-image glyph every time it is.
 *
 * **The fallback is drawn under the picture until the picture loads**, rather than swapped for it,
 * so a slow image shows the initials first and nothing moves when it arrives. It is removed once
 * the picture has loaded, so a transparent PNG does not show letters through it.
 *
 * **An image that fails before hydration** has already fired its `error` event by the time the
 * listener exists — a server-rendered `<img>` starts loading with the HTML. So the first browser
 * render reads the image's own state (`complete` with no natural width) instead of waiting for an
 * event that will never come.
 */
@Component({
  selector: 'gog-avatar',
  imports: [IconComponent],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
    '[attr.role]': 'isNamed() ? "img" : null',
    '[attr.aria-label]': 'isNamed() ? name() : null',
    '[attr.aria-hidden]': 'isNamed() ? null : "true"',
  },
})
export class AvatarComponent {
  /** The picture. Falls back to the initials when unset, and when it fails to load. */
  readonly src = input<string | null>(null);
  /** Whose avatar: its accessible name, and the source of the initials. */
  readonly name = input('');
  /** Overrides the initials derived from `name` — an organisation's own short form. */
  readonly initials = input<string | undefined>(undefined);
  /** The last fallback, when there is neither a picture nor any initials. */
  readonly iconName = input<GogIconName>('user');
  readonly size = input<GogSize>('md');
  readonly shape = input<GogAvatarShape>('circle');
  /**
   * Hides the avatar from assistive tech, for one that sits beside the name it would announce.
   * An avatar with no `name` is decorative whatever this says: there is nothing true to announce.
   */
  readonly decorative = input(false, { transform: booleanAttribute });

  private readonly image = viewChild<ElementRef<HTMLImageElement>>('image');

  /** Reset whenever `src` changes, so a new picture gets its own chance. */
  protected readonly failed = linkedSignal({ source: this.src, computation: () => false });
  protected readonly loaded = linkedSignal({ source: this.src, computation: () => false });

  protected readonly resolvedInitials = computed(
    () => this.initials() ?? gogAvatarInitials(this.name()),
  );
  protected readonly showImage = computed(() => !!this.src() && !this.failed());
  protected readonly isNamed = computed(() => !this.decorative() && this.name().trim() !== '');

  protected readonly hostClasses = computed(() =>
    ['gog-avatar', `gog-avatar--${this.size()}`, `gog-avatar--${this.shape()}`].join(' '),
  );

  constructor() {
    afterNextRender(() => {
      const image = this.image()?.nativeElement;
      if (!image?.complete) return;
      if (image.naturalWidth === 0) this.failed.set(true);
      else this.loaded.set(true);
    });
  }

  protected onError(): void {
    this.failed.set(true);
  }

  protected onLoad(): void {
    this.loaded.set(true);
  }
}
