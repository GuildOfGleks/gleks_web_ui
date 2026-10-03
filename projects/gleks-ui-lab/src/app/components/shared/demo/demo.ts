import { ChangeDetectionStrategy, Component, Type, input } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { CodeTabsComponent } from '../code-tabs/code-tabs';
import type { ExampleSource } from '../example-source';

/**
 * How the preview arranges what the example renders. The lab's layout, not the example's: an
 * example carries no stylesheet (`docs/lab-component-pages.md`, D3), so the arrangement a reader
 * should not copy lives here, once.
 *
 * - `block` — the example as it renders, full width.
 * - `row` — its top-level elements in a wrapping, centred row: buttons, chips, toggles.
 * - `rows` — its top-level elements stacked, each one a wrapping row; a leading `<span>` in a row
 *   is drawn as that row's label.
 * - `stack` — its top-level elements stacked and centred: a control and the line reporting it.
 * - `frame` — a narrow dashed box, for an example whose point is how it fills its container.
 *
 * A new arrangement is added here, never as CSS in an example.
 */
export type DemoLayout = 'block' | 'row' | 'rows' | 'stack' | 'frame';

/**
 * One documentation example: the live component, then its three files behind the tab strip.
 *
 * The card's heading and prose stay in the page — they are documentation about the example, not
 * part of it. This owns only the pair that has to agree with itself: what is rendered, and the
 * source shown underneath it. Both come from the same folder, so they cannot describe different
 * things.
 *
 * **Rendered through `NgComponentOutlet` rather than as a tag**, because every example component
 * carries `selector: 'app-example'` — that is the selector a generated StackBlitz project mounts
 * as its root, so it is part of the contract with that project rather than a free choice. Six
 * components sharing one selector cannot all be imported into one template; an outlet takes the
 * class directly and never looks at the selector at all.
 */
@Component({
  selector: 'app-demo',
  imports: [NgComponentOutlet, CodeTabsComponent],
  templateUrl: './demo.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoComponent {
  /** Absent for an example with nothing to render — a `provideGogConfig` snippet. */
  readonly component = input<Type<unknown> | null>(null);
  readonly source = input.required<ExampleSource>();
  readonly layout = input<DemoLayout>('block');
}
