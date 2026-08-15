import { Component, signal } from '@angular/core';
import { ButtonComponent, GogBadgeDirective } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, GogBadgeDirective],
  template: `
    <gog-button [gogBadge]="count()" (gogClick)="bump()"
      >Inbox — click to change the count</gog-button
    >
  `,
})
export class BadgeZeroExample {
  // Nothing renders while this is 0 — no @if needed at the call site.
  protected readonly count = signal(0);

  protected bump(): void {
    this.count.update((value) => (value + 1) % 3);
  }
}
