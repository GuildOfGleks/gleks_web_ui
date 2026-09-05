import { ChangeDetectionStrategy, Component, OnDestroy, signal } from '@angular/core';
import { ButtonComponent, SpinnerComponent, provideGogConfig } from '@guildofgleks/ui';

/**
 * A stand-in for the loading indicator an app already owns — three bars, no library involvement.
 * It fills the wrapper it is handed rather than sizing itself, which is what lets one component
 * serve every `size` the library asks for.
 */
@Component({
  selector: 'app-house-loader',
  template: `
    <span class="house-loader" aria-hidden="true">
      <i></i>
      <i></i>
      <i></i>
    </span>
  `,
  styles: `
    :host {
      display: block;
      inline-size: 100%;
      block-size: 100%;
    }

    .house-loader {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12%;
      inline-size: 100%;
      block-size: 100%;
    }

    .house-loader i {
      inline-size: 18%;
      block-size: 100%;
      border-radius: var(--gog-radius);
      background: var(--gog-spinner-color, var(--gog-accent-color));
      animation: house-loader-pulse 1s var(--gog-easing) infinite;
    }

    .house-loader i:nth-child(2) {
      animation-delay: 0.15s;
    }

    .house-loader i:nth-child(3) {
      animation-delay: 0.3s;
    }

    @keyframes house-loader-pulse {
      0%,
      100% {
        block-size: 35%;
        opacity: 0.45;
      }
      50% {
        block-size: 100%;
        opacity: 1;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .house-loader i {
        animation: none;
        block-size: 70%;
        opacity: 0.75;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HouseLoaderComponent {}

/**
 * `GOG_CONFIG.spinner.component` in a demo that can live on a page: the provider sits on this
 * component rather than in `app.config.ts`, so the house loader reaches the spinners *inside*
 * this card and nothing else on the site. That is the same mechanism a route uses — a nested
 * `provideGogConfig` layers onto the parent's config instead of replacing it, so the lab's own
 * `ripple.enabled` still applies to the button below.
 */
@Component({
  selector: 'app-house-spinner-demo',
  imports: [SpinnerComponent, ButtonComponent],
  providers: [provideGogConfig({ spinner: { component: HouseLoaderComponent } })],
  template: `
    <div class="house-demo">
      <div class="house-demo__tile">
        <gog-spinner size="lg" ariaLabel="Loading" />
        <span class="house-demo__meta">gog-spinner</span>
      </div>
      <div class="house-demo__tile">
        <gog-button variant="primary" [loading]="saving()" (gogClick)="save()">Save</gog-button>
        <span class="house-demo__meta">gog-button, no spinner input at all</span>
      </div>
    </div>
  `,
  styles: `
    .house-demo {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--gog-space-6);
    }

    .house-demo__tile {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--gog-space-2);
    }

    .house-demo__meta {
      color: var(--gog-muted-text-color);
      font-size: var(--gog-text-xs);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HouseSpinnerDemo implements OnDestroy {
  protected readonly saving = signal(false);
  private timer: ReturnType<typeof setTimeout> | null = null;

  protected save(): void {
    this.saving.set(true);
    this.timer = setTimeout(() => this.saving.set(false), 2200);
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
}
