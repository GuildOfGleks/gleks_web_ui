import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ButtonComponent,
  CardComponent,
  GogCardFooterDirective,
  GogCardHeaderDirective,
  GogCardLinkDirective,
  GogCardMediaDirective,
  GogSize,
  GogSurfaceVariant,
  TagComponent,
} from '@guildofgleks/ui';

interface Person {
  id: string;
  name: string;
  role: string;
  years: string;
}

@Component({
  selector: 'app-card-page',
  imports: [
    ButtonComponent,
    CardComponent,
    GogCardFooterDirective,
    GogCardHeaderDirective,
    GogCardLinkDirective,
    GogCardMediaDirective,
    RouterLink,
    TagComponent,
  ],
  templateUrl: './card-page.html',
  styleUrl: './card-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardPage {
  protected readonly variants: GogSurfaceVariant[] = ['outlined', 'elevated', 'filled'];
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];

  protected readonly loading = signal(true);
  protected readonly disabled = signal(false);

  protected readonly people: Person[] = [
    { id: 'ada', name: 'Ada Lovelace', role: 'Mathematician', years: '1815–1852' },
    { id: 'alan', name: 'Alan Turing', role: 'Logician', years: '1912–1954' },
    { id: 'grace', name: 'Grace Hopper', role: 'Rear Admiral', years: '1906–1992' },
  ];

  /** Counts clicks that reached the footer button rather than the card's own link. */
  protected readonly footerClicks = signal(0);

  /**
   * Stand-in cover art. A data URI rather than a file in `public/`, so the media slot's
   * full-bleed geometry can be judged without the page depending on an asset.
   */
  protected readonly mediaSrc =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 200">
         <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
           <stop offset="0%" stop-color="#b48310"/><stop offset="100%" stop-color="#735100"/>
         </linearGradient></defs>
         <rect width="480" height="200" fill="url(#g)"/>
       </svg>`,
    );
}
