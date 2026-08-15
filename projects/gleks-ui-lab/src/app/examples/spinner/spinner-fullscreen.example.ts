import { Component, OnDestroy, signal } from '@angular/core';
import { ButtonComponent, SpinnerComponent } from '@guildofgleks/ui';

/** Long enough to see it, short enough that it always gives the page back. */
const PREVIEW_DURATION_MS = 1500;

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, SpinnerComponent],
  template: `
    <gog-button size="sm" variant="outline" (gogClick)="preview()">Show for 1.5s</gog-button>

    <!-- Behind a trigger, not [loading]="true": overlay covers the whole viewport and swallows
         every click, so an always-on one would take the page hostage. In a real app the same
         signal is your request's in-flight flag, which ends on its own for the same reason. -->
    @if (loading()) {
      <gog-spinner [overlay]="true" size="lg" ariaLabel="Loading page" />
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
    }
  `,
})
export class SpinnerFullscreenExample implements OnDestroy {
  protected readonly loading = signal(false);
  private timer: ReturnType<typeof setTimeout> | null = null;

  protected preview(): void {
    if (this.timer) clearTimeout(this.timer);

    this.loading.set(true);
    this.timer = setTimeout(() => {
      this.loading.set(false);
      this.timer = null;
    }, PREVIEW_DURATION_MS);
  }

  ngOnDestroy(): void {
    if (this.timer) clearTimeout(this.timer);
  }
}
