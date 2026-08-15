import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, Type, computed, inject, input } from '@angular/core';

import { CodeTabsComponent } from '../code-tabs/code-tabs';
import { EXAMPLE_SOURCES } from '../example-sources';

/**
 * Renders one documentation example: the component itself, live, and its own source underneath.
 *
 * **The point is that both come from the same file.** Before this, a page carried the demo in its
 * template and the code as a hand-written string beside it — two copies of one example, of which
 * only the template was ever compiled. Here the page names the example once; the source is looked
 * up from the folder's generated map (see `example-sources.ts`), so the code on screen is the
 * code that ran, and a renamed library input breaks the build instead of the prose.
 *
 * Anything projected into it is rendered between the title and the demo — a sentence of context,
 * a caveat, a link.
 */
@Component({
  selector: 'app-demo',
  imports: [NgComponentOutlet, CodeTabsComponent],
  templateUrl: './example-host.html',
  styleUrl: './example-host.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleHostComponent {
  private readonly sources = inject(EXAMPLE_SOURCES);

  readonly component = input.required<Type<unknown>>();
  /** Heading above the demo. Also names the StackBlitz project the example opens in. */
  readonly title = input<string | null>(null);

  protected readonly source = computed(() => this.sources.get(this.component()) ?? '');
}
