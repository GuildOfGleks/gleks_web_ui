import { Component } from '@angular/core';
import { DividerComponent, GogDividerVariant } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [DividerComponent],
})
export class DividerVariantsExample {
  protected readonly variants: GogDividerVariant[] = ['solid', 'dashed', 'dotted'];
}
