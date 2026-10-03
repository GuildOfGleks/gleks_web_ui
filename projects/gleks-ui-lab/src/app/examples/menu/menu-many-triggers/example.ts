import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  GogButtonDirective,
  GogMenuItemDirective,
  GogMenuTriggerDirective,
  IconComponent,
  MenuComponent,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [
    GogButtonDirective,
    MenuComponent,
    GogMenuTriggerDirective,
    GogMenuItemDirective,
    IconComponent,
  ],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuManyTriggersExample {
  protected readonly files = ['report.pdf', 'budget.xlsx', 'notes.md'];
  protected readonly target = signal('');
  protected readonly lastAction = signal('—');

  protected run(action: string): void {
    this.lastAction.set(`${action} ${this.target()}`);
  }
}
