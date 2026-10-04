import { ChangeDetectionStrategy, Component, Type, input } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { CodeTabsComponent } from '../code-tabs/code-tabs';
import type { ExampleSource } from '../example-source';

/**
 * How the preview arranges what the example renders. The lab's layout, not the example's: an
 * example carries no stylesheet (`docs/lab-component-pages.md`, D3), so the arrangement a reader
 * should not copy lives here, once.
 *
 * - `block` — each top-level element centred on its own line (the default); a `<div>` stacks its
 *   contents, left-aligned — a group read top to bottom.
 * - `row` — its top-level elements in one wrapping, centred row: buttons, chips, toggles; a `<p>`
 *   among them takes a line of its own, and a `<div>` is a captioned cell, top-aligned.
 * - `rows` — each top-level element a wrapping row, the rows centred as one block; a leading
 *   `<span>` in a row is drawn as that row's label.
 * - `fields` — form fields in centred rows of equal cells; a `<div>` cell stacks a field with
 *   the line under it.
 * - `wide` — each top-level element as wide as the card (centred if it caps itself), for an
 *   example about filling a block container; a `<div>` is a centred row of the controls that
 *   drive it.
 * - `overhang` — `row` with twice the spacing, for a decoration drawn outside its host's box (a
 *   badge); a `<div>` is a row of its own, with a leading `<span>` as its label.
 * - `frame` — a narrow dashed box, for an example whose point is how it fills its container.
 *
 * A new arrangement is added here, never as CSS in an example.
 */
export type DemoLayout = 'block' | 'row' | 'rows' | 'fields' | 'wide' | 'overhang' | 'frame';

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
