import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonComponent, GogBadgeDirective, GogTagVariant } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, GogBadgeDirective],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeContentExample {
  protected readonly variants: GogTagVariant[] = ['danger', 'warning', 'success', 'info'];
  protected readonly contents: { label: string; value: string | number | null; dot: boolean }[] = [
    { label: 'gogBadge="3"', value: 3, dot: false },
    { label: 'gogBadge="42"', value: 42, dot: false },
    { label: 'gogBadge="150"', value: 150, dot: false },
    { label: 'gogBadge="NEW"', value: 'NEW', dot: false },
    { label: 'badgeDot', value: null, dot: true },
  ];
}
