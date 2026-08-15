import { Component } from '@angular/core';
import { GogSpinnerVariant, SpinnerComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [SpinnerComponent],
})
export class SpinnerVariantsExample {
  protected readonly variants: GogSpinnerVariant[] = ['runic', 'ring'];
}
