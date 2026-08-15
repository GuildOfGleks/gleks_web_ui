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
  styles: `
    :host {
      display: grid;
      gap: 12px;
      max-width: 420px;
    }
    .profile-card__header {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .profile-card__header-text {
      display: grid;
      gap: 8px;
      flex: 1 1 auto;
      min-width: 0;
    }
  `,
})
export class SkeletonProfileExample {
  protected readonly loading = signal(true);
}
