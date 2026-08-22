import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DemoComponent } from '../../shared/demo/demo';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';

import { RTL_EXAMPLES } from '../../../examples/rtl/sources.generated';
import { RtlOverviewExample } from '../../../examples/rtl/rtl-overview/example';

interface PropertyRow {
  readonly name: string;
  readonly ltr: string;
  readonly rtl: string;
  readonly description: string;
}

/**
 * The three custom properties the library declares for the handful of CSS properties that have
 * no logical form. Everything else mirrors through logical properties and needs nothing.
 */
const DIRECTION_PROPERTIES: readonly PropertyRow[] = [
  {
    name: '--gog-inline-start-side',
    ltr: 'left',
    rtl: 'right',
    description:
      'The left/right keyword for the inline start edge — for transform-origin and anything else that only takes physical keywords.',
  },
  {
    name: '--gog-inline-end-side',
    ltr: 'right',
    rtl: 'left',
    description: 'The same for the inline end edge.',
  },
  {
    name: '--gog-direction-sign',
    ltr: '1',
    rtl: '-1',
    description:
      'Multiplier for a translate that has to run along the inline axis. Multiply your offset by it and the movement follows the direction.',
  },
];

const MIRRORED: readonly { area: string; what: string }[] = [
  {
    area: 'Every stylesheet',
    what: 'Physical left/right declarations became logical properties across 16 stylesheets — padding, margin, border, inset, text-align and float all follow the writing direction.',
  },
  {
    area: 'Portaled panels',
    what: "The select/multiselect panel and the tooltip bubble copy a scoped dir onto their portaled host, so an RTL region inside an LTR page renders its overlays correctly rather than taking the document's direction.",
  },
  {
    area: 'Tooltip',
    what: 'position="auto" prefers the mirrored horizontal side.',
  },
  { area: 'Calendar', what: 'The month and year arrows turn around.' },
  {
    area: 'Slider, toast progress, indeterminate progressbar',
    what: 'All three run from the inline start rather than from the left.',
  },
];

const PHYSICAL: readonly { api: string; values: string; why: string }[] = [
  {
    api: 'gogTooltipPosition',
    values: "'left' | 'right'",
    why: "They are physical words in the API. Naming a side means that side; use 'auto' when you want the direction-aware choice.",
  },
  {
    api: 'ToastConfig.position',
    values: "'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'",
    why: 'A toast corner is a deliberate placement decision, so it is not mirrored for you.',
  },
];

@Component({
  selector: 'app-rtl-page',
  imports: [DemoComponent, MarkdownComponent, RouterLink, SinceBadgeComponent],
  templateUrl: './rtl-page.html',
  styleUrl: './rtl-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RtlPage {
  protected readonly directionProperties = DIRECTION_PROPERTIES;
  protected readonly mirrored = MIRRORED;
  protected readonly physical = PHYSICAL;

  protected readonly sources = RTL_EXAMPLES;
  protected readonly examples = { overview: RtlOverviewExample };

  protected readonly htmlSnippet = [
    '```html',
    '<!-- the whole app -->',
    '<html dir="rtl" data-theme="dark">',
    '',
    '<!-- …or one region of it -->',
    '<section dir="rtl">',
    '  <gog-inputfield label="بحث" iconStart="search" />',
    '</section>',
    '```',
  ].join('\n');

  protected readonly signSnippet = [
    '```css',
    '/* A nudge that has to follow the writing direction. In LTR the sign is 1 and this moves',
    '   right; in RTL it is -1 and the same rule moves left — one declaration, both directions. */',
    '.my-badge {',
    '  translate: calc(6px * var(--gog-direction-sign)) 0;',
    '  transform-origin: var(--gog-inline-start-side) center;',
    '}',
    '```',
  ].join('\n');
}
