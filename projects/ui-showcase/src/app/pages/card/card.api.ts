import {
  CardComponent,
  GogCardFooterDirective,
  GogCardHeaderDirective,
  GogCardLinkDirective,
  GogCardMediaDirective,
} from '@guildofgleks/ui';

import type { DocApi } from '../../doc/doc-api';

/**
 * The four directives mark where projected content goes and declare nothing a template binds;
 * what each one does is on the page, in Content and Behaviour.
 */
export const CARD_API: readonly DocApi[] = [
  {
    type: CardComponent,
    inputs: [
      { name: 'variant', type: 'GogSurfaceVariant', default: "'outlined'" },
      { name: 'size', type: 'GogSize', default: "'md'" },
      { name: 'disabled', type: 'boolean (booleanAttribute)', default: 'false' },
      { name: 'loading', type: 'boolean (booleanAttribute)', default: 'false' },
      { name: 'skeletonLines', type: 'number', default: '2' },
    ],
    outputs: [],
  },
  { type: GogCardHeaderDirective, inputs: [], outputs: [] },
  { type: GogCardMediaDirective, inputs: [], outputs: [] },
  { type: GogCardFooterDirective, inputs: [], outputs: [] },
  { type: GogCardLinkDirective, inputs: [], outputs: [] },
];
