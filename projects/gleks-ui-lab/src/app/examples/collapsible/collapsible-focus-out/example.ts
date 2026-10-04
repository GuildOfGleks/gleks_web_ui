import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  CollapsibleComponent,
  GogButtonDirective,
  GogCollapsibleContentDirective,
  GogCollapsibleTriggerDirective,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [
    CollapsibleComponent,
    GogButtonDirective,
    GogCollapsibleContentDirective,
    GogCollapsibleTriggerDirective,
  ],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollapsibleFocusOutExample {
  protected readonly open = signal(false);
  protected readonly closes = signal(0);

  protected onOpenChange(open: boolean): void {
    if (!open && this.open()) this.closes.update((count) => count + 1);
    this.open.set(open);
  }
}
