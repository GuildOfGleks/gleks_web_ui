import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  AvatarComponent,
  AvatarGroupComponent,
  GogBadgeDirective,
  SkeletonComponent,
  type GogAvatarShape,
  type GogSize,
} from '@guildofgleks/ui';

import { DocAttrs } from '../../doc/doc-attrs';
import { DocCell, DocMatrix } from '../../doc/doc-matrix';
import { DocPage } from '../../doc/doc-page';
import { DocSection } from '../../doc/doc-section';

/** A picture as a data URL, so the page needs no image files: a portrait-ish gradient, no letters. */
function portrait(from: string, to: string): string {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>` +
    `<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>` +
    `<stop offset='0' stop-color='${from}'/><stop offset='1' stop-color='${to}'/></linearGradient></defs>` +
    `<rect width='64' height='64' fill='url(%23g)'/>` +
    `<circle cx='32' cy='26' r='12' fill='%23ffffff' fill-opacity='0.75'/>` +
    `<path d='M10 64c2-14 12-22 22-22s20 8 22 22z' fill='%23ffffff' fill-opacity='0.75'/></svg>`;
  return `data:image/svg+xml;utf8,${svg}`;
}

interface Fallback {
  readonly name: string;
  readonly value: { readonly src: string | null; readonly person: string };
}

@Component({
  selector: 'app-avatar-page',
  imports: [
    AvatarComponent,
    AvatarGroupComponent,
    GogBadgeDirective,
    SkeletonComponent,
    DocAttrs,
    DocCell,
    DocMatrix,
    DocPage,
    DocSection,
  ],
  templateUrl: './avatar-page.html',
  styleUrl: './avatar-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarPage {
  protected readonly sizes: readonly GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
  protected readonly shapes: readonly GogAvatarShape[] = ['circle', 'rounded'];
  protected readonly ada = portrait('%23c9a227', '%237a4f1d');
  protected readonly grace = portrait('%233b6ea8', '%231d2f4f');

  protected readonly fallbacks: readonly Fallback[] = [
    { name: 'picture', value: { src: this.ada, person: 'Ada Lovelace' } },
    { name: 'no src: initials', value: { src: null, person: 'Ada Lovelace' } },
    { name: 'src fails: initials', value: { src: '/no-such-avatar.png', person: 'Ada Lovelace' } },
    { name: 'no name either: icon', value: { src: null, person: '' } },
  ];

  protected readonly names: readonly string[] = [
    'Ada King Lovelace',
    'grace hopper',
    'Plato',
    'Émilie du Châtelet',
    '🦊 Fox',
    'Øystein Ødegård',
  ];

  /** Swapping `src` after a failure: the new picture gets its own chance. */
  protected readonly swapSrc = signal<string | null>('/no-such-avatar.png');

  protected toggleSrc(): void {
    this.swapSrc.update((src) => (src === this.grace ? '/no-such-avatar.png' : this.grace));
  }

  protected readonly loading = signal(true);

  protected readonly team: readonly { readonly name: string; readonly src: string | null }[] = [
    { name: 'Ada Lovelace', src: this.ada },
    { name: 'Grace Hopper', src: null },
    { name: 'Alan Turing', src: this.grace },
    { name: 'Edsger Dijkstra', src: null },
    { name: 'Barbara Liskov', src: null },
    { name: 'Donald Knuth', src: '/no-such-avatar.png' },
    { name: 'Margaret Hamilton', src: null },
  ];
  protected readonly maxes: readonly (number | null)[] = [null, 5, 3];
  protected readonly crowd = Array.from({ length: 140 }, (_, i) => `Member ${i + 1}`);
}
