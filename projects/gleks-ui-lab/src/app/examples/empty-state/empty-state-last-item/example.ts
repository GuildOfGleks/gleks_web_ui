import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  EmptyStateComponent,
  GogEmptyStateActionsDirective,
  ButtonComponent,
  CardComponent,
  GogCardHeaderDirective,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [
    ButtonComponent,
    CardComponent,
    EmptyStateComponent,
    GogCardHeaderDirective,
    GogEmptyStateActionsDirective,
  ],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateLastItemExample {
  protected readonly projects = signal<string[]>(['Website refresh']);

  protected add(): void {
    this.projects.update((list) => [...list, `Project ${list.length + 1}`]);
  }

  protected remove(index: number): void {
    this.projects.update((list) => list.filter((_, i) => i !== index));
  }
}
