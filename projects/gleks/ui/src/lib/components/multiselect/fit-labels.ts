/**
 * The trigger's one-line summary of a multiselect's selection.
 *
 * Its own file rather than a member of `multiselect.component.ts`, because `public-api.ts`
 * re-exports that module wholesale — a helper exported there becomes public API nobody decided
 * to support (see docs/hardening-21.5.0.md's backlog on incidental exports). Here it stays
 * internal and still testable.
 */
/** What the trigger shows: the labels that fit on one line, and how many did not. */

export interface GogMultiselectSummary {
  text: string;

  hidden: number;
}

/**

 * The greedy fit itself, split out of `summary` so it can be tested without a layout engine:

 * jsdom measures no text, so exercising this through the component would only ever hit the

 * "everything fits" early return above.

 *

 * `measure` is the text measurer — `canvas.measureText` in the browser, anything in a test.

 */

export function fitLabels(
  labels: string[],

  width: number,

  measure: (text: string) => number,
): GogMultiselectSummary {
  // Room the "+N" badge will need; reserved up front so adding it can't cause a second overflow.

  const reserve = labels.length > 1 ? measure(` +${labels.length}`) : 0;

  let text = '';

  let fitted = 0;

  for (const label of labels) {
    const next = fitted === 0 ? label : `${text}, ${label}`;

    const budget = fitted === labels.length - 1 ? width : width - reserve;

    if (fitted > 0 && measure(next) > budget) break;

    text = next;

    fitted += 1;
  }

  // Always show at least one label, even if it has to be ellipsised by CSS.

  if (fitted === 0) return { text: labels[0], hidden: labels.length - 1 };

  return { text, hidden: labels.length - fitted };
}
