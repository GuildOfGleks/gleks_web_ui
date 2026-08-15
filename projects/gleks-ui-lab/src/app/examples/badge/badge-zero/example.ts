import { Component, signal } from '@angular/core';
import { ButtonComponent, GogBadgeDirective } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [ButtonComponent, GogBadgeDirective],
})
export class BadgeZeroExample {
  // Nothing renders while this is 0 — no @if needed at the call site.
  protected readonly count = signal(0);

  protected bump(): void {
    this.count.update((value) => (value + 1) % 3);
  }
}
