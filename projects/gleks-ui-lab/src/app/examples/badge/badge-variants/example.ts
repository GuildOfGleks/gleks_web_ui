import { Component } from '@angular/core';
import { ButtonComponent, GogBadgeDirective, GogTagVariant } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [ButtonComponent, GogBadgeDirective],
})
export class BadgeVariantsExample {
  protected readonly variants: GogTagVariant[] = ['success', 'danger', 'warning', 'info'];
}
