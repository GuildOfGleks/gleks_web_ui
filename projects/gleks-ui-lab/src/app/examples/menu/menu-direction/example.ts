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
export class MenuDirectionExample {
  protected readonly picked = signal('—');
}
