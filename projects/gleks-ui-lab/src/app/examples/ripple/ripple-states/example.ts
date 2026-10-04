import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GogRippleDirective } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [GogRippleDirective],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RippleStatesExample {
  // The wash is clipped to the host's own corners, whatever they are.
  protected readonly radii = ['var(--gog-radius)', '999px', '0'];
  protected readonly settings = [
    {
      name: 'gogRipple',
      centred: false,
      rippleDisabled: false,
      disabled: false,
      ariaDisabled: false,
    },
    {
      name: 'rippleCentred',
      centred: true,
      rippleDisabled: false,
      disabled: false,
      ariaDisabled: false,
    },
    {
      name: 'rippleDisabled',
      centred: false,
      rippleDisabled: true,
      disabled: false,
      ariaDisabled: false,
    },
    {
      name: 'disabled',
      centred: false,
      rippleDisabled: false,
      disabled: true,
      ariaDisabled: false,
    },
    {
      name: 'aria-disabled',
      centred: false,
      rippleDisabled: false,
      disabled: false,
      ariaDisabled: true,
    },
  ];
}
