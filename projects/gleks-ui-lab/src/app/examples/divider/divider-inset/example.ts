import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DividerComponent, GogIconName, IconComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [DividerComponent, IconComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DividerInsetExample {
  protected readonly steps: { icon: GogIconName; label: string }[] = [
    { icon: 'success', label: 'Order placed' },
    { icon: 'clock', label: 'Awaiting payment' },
    { icon: 'info', label: 'Preparing shipment' },
  ];
}
