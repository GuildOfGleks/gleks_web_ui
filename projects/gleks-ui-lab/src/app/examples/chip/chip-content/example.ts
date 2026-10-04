import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ChipComponent, GogSize } from '@guildofgleks/ui';

/** An initials avatar as a data URL, so the example needs no image files. */
function avatar(initials: string, fill: string): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' fill='${fill}'/><text x='32' y='40' text-anchor='middle' font-size='26' font-family='Arial' fill='%231a1208'>${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${svg}`;
}

@Component({
  selector: 'app-example',
  imports: [ChipComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipContentExample {
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
  protected readonly ada = avatar('AL', '%23c9b896');
  protected readonly alan = avatar('AT', '%23d4b483');
}
