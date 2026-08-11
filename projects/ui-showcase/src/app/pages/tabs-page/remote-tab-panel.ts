import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  inject,
  input,
  signal,
} from '@angular/core';
import { SpinnerComponent } from '@guildofgleks/ui';

/**
 * Stands in for a tab whose *content*, not just the tab list itself, comes from the backend:
 * built once on first activation (same `gogTabContent` latch as `LazyPanel`), then fetches its
 * own data and shows a spinner until it lands.
 */
@Component({
  selector: 'app-remote-tab-panel',
  imports: [SpinnerComponent],
  template: `
    @if (loading()) {
      <p class="remote-panel__loading">
        <gog-spinner size="sm" ariaLabel="Loading" />
        Loading section…
      </p>
    } @else {
      <p>{{ body() }}</p>
      <p class="hint">
        Fetched at {{ loadedAt() }} — this subtree was built once, on first activation, and stays
        alive after that.
      </p>
    }
  `,
  styles: `
    .remote-panel__loading {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RemoteTabPanel {
  readonly sectionId = input.required<number>();
  readonly body = input.required<string>();

  protected readonly loading = signal(true);
  protected readonly loadedAt = signal('');

  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      // A per-tab fetch: each panel's own delay, independent of the others and of the delay
      // that loaded the tab list itself.
      const timer = setTimeout(
        () => {
          this.loading.set(false);
          this.loadedAt.set(new Date().toLocaleTimeString());
        },
        400 + this.sectionId() * 150,
      );
      this.destroyRef.onDestroy(() => clearTimeout(timer));
    });
  }
}
