import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonComponent, GogVariant } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonDisabledExample {
  protected readonly variants: GogVariant[] = ['primary', 'secondary', 'outline', 'ghost'];
}
