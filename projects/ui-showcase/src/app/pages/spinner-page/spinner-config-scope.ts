import { ChangeDetectionStrategy, Component, OnDestroy, signal } from '@angular/core';
import {
  AutocompleteComponent,
  ButtonComponent,
  GogColumn,
  SpinnerComponent,
  SpinnerOverlayComponent,
  TableComponent,
  provideGogConfig,
} from '@guildofgleks/ui';

/** A stand-in for the loading indicator an app already owns — three bars, nothing from here. */
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

interface Row {
  id: number;
  name: string;
}

/**
 * `GOG_CONFIG.spinner.component` over every surface that draws a spinner, scoped to this subtree
 * so the rest of the showcase keeps the built-in look. A real app makes the same call once in
 * `app.config.ts`; the same shape as `ripple-scope` and `global-config-scope`, and for the same
 * reason — "before" and "after" side by side otherwise takes two applications.
 *
 * The overlay is the one worth watching. Until 21.9.2 it forwarded its own `variant` down with a
 * `'runic'` default, which the spinner inside read as an instance overruling the config — so this
 * panel would have shown the house loader in three places and the built-in in the fourth, on a
 * key documented as reaching all of them.
 */
@Component({
  selector: 'app-spinner-config-scope',
  imports: [
    AutocompleteComponent,
    ButtonComponent,
    GogColumn,
    SpinnerComponent,
    SpinnerOverlayComponent,
    TableComponent,
  ],
  providers: [provideGogConfig({ spinner: { component: HouseLoaderComponent } })],
  template: `
    <div class="spinner-config-scope">
      <div class="spinner-config-scope__tile">
        <gog-spinner size="lg" ariaLabel="Loading" />
        <span class="meta">gog-spinner</span>
      </div>

      <div class="spinner-config-scope__tile">
        <gog-button variant="primary" [loading]="busy()" (gogClick)="run()">Save</gog-button>
        <span class="meta">gog-button, no spinner input</span>
      </div>

      <div class="spinner-config-scope__tile">
        <gog-autocomplete
          [options]="[]"
          [loading]="busy()"
          label="Search"
          placeholder="Type to search"
        />
        <span class="meta">gog-autocomplete, while it searches</span>
      </div>

      <div class="spinner-config-scope__tile">
        <gog-table [value]="rows" [loading]="busy()">
          <gog-column field="name" header="Name" />
          <gog-column field="id" header="Id" />
        </gog-table>
        <span class="meta">gog-table, in place of its rows</span>
      </div>

      <div class="spinner-config-scope__tile spinner-config-scope__tile--wide">
        <gog-spinner-overlay [loading]="busy()" size="lg" ariaLabel="Loading region">
          <p class="meta">A region that loads. This is the one 21.9.2 fixed.</p>
        </gog-spinner-overlay>
        <span class="meta">gog-spinner-overlay</span>
      </div>

      <div class="spinner-config-scope__actions">
        <gog-button variant="outline" (gogClick)="run()">Load everything for 4s</gog-button>
      </div>
    </div>
  `,
  styles: `
    .spinner-config-scope {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      gap: var(--gog-space-6);
    }

    .spinner-config-scope__tile {
      display: flex;
      flex-direction: column;
      gap: var(--gog-space-2);
      min-inline-size: 200px;
    }

    .spinner-config-scope__tile--wide {
      flex: 1 1 260px;
    }

    .spinner-config-scope__actions {
      flex-basis: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinnerConfigScope implements OnDestroy {
  protected readonly busy = signal(true);
  protected readonly rows: Row[] = [{ id: 1, name: 'Only visible once loading ends' }];

  private timer: ReturnType<typeof setTimeout> | null = null;

  protected run(): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.busy.set(true);
    this.timer = setTimeout(() => this.busy.set(false), 4000);
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
}
