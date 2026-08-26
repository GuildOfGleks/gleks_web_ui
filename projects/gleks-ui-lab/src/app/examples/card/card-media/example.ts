import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CardComponent, GogCardHeaderDirective, GogCardMediaDirective } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [CardComponent, GogCardHeaderDirective, GogCardMediaDirective],
  templateUrl: './example.html',
  styleUrl: './example.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardMediaExample {
  /** Inline SVG so the full-bleed geometry can be judged without depending on an asset. */
  protected readonly mediaSrc =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 200">
         <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
           <stop offset="0" stop-color="#d4b483"/><stop offset="1" stop-color="#7a5c2e"/>
         </linearGradient></defs>
         <rect width="480" height="200" fill="url(#g)"/>
       </svg>`,
    );
}
