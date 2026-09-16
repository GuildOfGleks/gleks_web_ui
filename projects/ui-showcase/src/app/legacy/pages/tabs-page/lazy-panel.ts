import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Stamps the moment it was constructed, so the tabs page can show that a `gogTabContent`
 * subtree is built once on first activation and then kept alive — the timestamp stays put when
 * you leave the tab and come back.
 */
@Component({
  selector: 'app-lazy-panel',
  imports: [],
  template: `
    <p>
      This subtree was built at <strong>{{ builtAt }}</strong
      >.
    </p>
    <p class="hint">
      Leave this tab and return: the time does not change, because a lazy tab pays its build cost
      once and then behaves like an eager one.
    </p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LazyPanel {
  protected readonly builtAt = new Date().toLocaleTimeString();
}
