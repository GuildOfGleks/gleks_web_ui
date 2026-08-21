import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  ButtonComponent,
  GogMenuItemDirective,
  GogMenuTriggerDirective,
  MenuComponent,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, MenuComponent, GogMenuTriggerDirective, GogMenuItemDirective],
  templateUrl: './example.html',
  styleUrl: './example.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuLongExample {
  protected readonly branches = Array.from({ length: 24 }, (_, i) => `release/21.${i}.x`);
  protected readonly moved = signal('—');
}
