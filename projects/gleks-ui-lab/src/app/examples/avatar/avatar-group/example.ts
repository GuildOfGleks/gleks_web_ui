import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AvatarComponent, AvatarGroupComponent } from '@guildofgleks/ui';

/** A picture as a data URL, so the example needs no image file. */
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

@Component({
  selector: 'app-example',
  imports: [AvatarComponent, AvatarGroupComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarGroupExample {
  protected readonly maxes: readonly (number | null)[] = [null, 5, 3];
  protected readonly team: readonly { name: string; src: string | null }[] = [
    { name: 'Ada Lovelace', src: portrait('%23c9a227', '%237a4f1d') },
    { name: 'Grace Hopper', src: null },
    { name: 'Alan Turing', src: portrait('%233b6ea8', '%231d2f4f') },
    { name: 'Edsger Dijkstra', src: null },
    { name: 'Barbara Liskov', src: null },
    { name: 'Donald Knuth', src: null },
    { name: 'Margaret Hamilton', src: null },
  ];
}
