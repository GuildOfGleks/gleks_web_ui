import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, Type, computed, inject, input } from '@angular/core';

import { CodeTabsComponent } from '../code-tabs/code-tabs';
import { EXAMPLE_SOURCES, ExampleSource } from '../example-sources';

const MISSING: ExampleSource = { html: '', ts: '', css: '' };

/**
 * Renders one documentation example: the component itself, live, and its own source underneath.
 *
 * **The point is that the code shown is the code that ran.** Before this, a page carried the demo
 * in its template and the code as a hand-written string beside it — two copies of one example, of
 * which only the template was ever compiled. Here the page names the example once; its three
 * files are looked up from the folder's generated map (see `example-sources.ts`), so a renamed
 * library input breaks the build instead of the prose.
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

  protected readonly source = computed(() => this.sources.get(this.component()) ?? MISSING);
}
