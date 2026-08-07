import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  ButtonComponent,
  GogBadgeDirective,
  GogBadgePosition,
  GogTagVariant,
  IconComponent,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-badge-page',
  imports: [ButtonComponent, GogBadgeDirective, IconComponent],
  templateUrl: './badge-page.html',
  styleUrl: './badge-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgePage {
  protected readonly positions: GogBadgePosition[] = [
    'top-end',
    'top-start',
    'bottom-end',
    'bottom-start',
  ];
  protected readonly variants: GogTagVariant[] = ['success', 'danger', 'warning', 'info'];

  protected readonly count = signal(3);

  protected add(): void {
    this.count.update((value) => value + 1);
  }

  protected remove(): void {
    this.count.update((value) => Math.max(0, value - 1));
  }

  protected flood(): void {
    this.count.set(150);
  }
}
