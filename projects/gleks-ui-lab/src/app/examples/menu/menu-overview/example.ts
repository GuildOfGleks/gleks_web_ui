import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  ButtonComponent,
  GogMenuItemDirective,
  GogMenuTriggerDirective,
  IconComponent,
  MenuComponent,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [
    ButtonComponent,
    MenuComponent,
    GogMenuTriggerDirective,
    GogMenuItemDirective,
    IconComponent,
  ],
  templateUrl: './example.html',
  styleUrl: './example.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuOverviewExample {
  protected readonly lastAction = signal('—');
  protected readonly closes = signal(0);

  protected run(action: string): void {
    this.lastAction.set(action);
  }
}
