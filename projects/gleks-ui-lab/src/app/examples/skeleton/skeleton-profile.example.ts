import { Component, signal } from '@angular/core';
import { SkeletonComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [SkeletonComponent],
  template: `
    @if (loading()) {
      <div class="profile-card__header">
        <gog-skeleton shape="circle" size="lg" ariaLabel="Loading profile" />
        <div class="profile-card__header-text">
          <gog-skeleton shape="text" width="65%" />
          <gog-skeleton shape="text" width="40%" size="sm" />
        </div>
      </div>
      <gog-skeleton shape="rect" size="md" />
      <gog-skeleton shape="text" [lines]="3" />
    } @else {
      <!-- real avatar, name, banner, bio -->
    }
  `,
})
export class SkeletonProfileExample {
  protected readonly loading = signal(true);
}
