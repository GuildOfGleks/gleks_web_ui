import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  ButtonComponent,
  GogMenuItemDirective,
  GogMenuTriggerDirective,
  MenuComponent,
  ToggleComponent,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [
    ButtonComponent,
    MenuComponent,
    GogMenuTriggerDirective,
    GogMenuItemDirective,
    ToggleComponent,
  ],
  templateUrl: './example.html',
  styleUrl: './example.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuDisabledExample {
  protected readonly isLocked = signal(true);
  protected readonly lastAction = signal('—');

  protected run(action: string): void {
    this.lastAction.set(action);
  }
}
