import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonComponent, GogTooltipDirective, TagComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, GogTooltipDirective, TagComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipContentExample {
  protected readonly longText =
    'A tooltip taller than --gog-tooltip-max-height scrolls inside an internal gog-scroll, ' +
    'using the same themeable scrollbar as every other overflowing panel in this library. ' +
    'Move the pointer onto the bubble and the pending hide is cancelled rather than raced, ' +
    'so you can actually read it — that is WCAG 2.1 SC 1.4.13. Content under the cap renders ' +
    'at exactly its own height, so a short tooltip is never padded out to a fixed box.';
}
