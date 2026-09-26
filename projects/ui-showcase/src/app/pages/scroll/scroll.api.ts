import { ScrollComponent } from '@guildofgleks/ui';

import type { DocApi } from '../../doc/doc-api';

export const SCROLL_API: readonly DocApi[] = [
  {
    type: ScrollComponent,
    inputs: [
      { name: 'axis', type: 'GogScrollAxis', default: "'vertical'" },
      {
        name: 'size',
        type: 'GogScrollSize | undefined',
        default: "'normal'",
        config: 'GOG_CONFIG.scroll.size',
      },
      {
        name: 'autoHide',
        type: 'boolean | undefined',
        default: 'true',
        config: 'GOG_CONFIG.scroll.autoHide',
      },
      {
        name: 'hideDelay',
        type: 'number | undefined',
        default: '800',
        config: 'GOG_CONFIG.scroll.hideDelay',
      },
      { name: 'reachThreshold', type: 'number', default: '0' },
      { name: 'focusable', type: 'boolean', default: 'true' },
      { name: 'ariaLabel', type: 'string', default: "''" },
      {
        name: 'overscrollBehavior',
        type: 'GogScrollOverscrollBehavior | undefined',
        default: "'auto'",
        config: 'GOG_CONFIG.scroll.overscrollBehavior',
      },
      {
        name: 'showTrack',
        type: 'boolean | undefined',
        default: 'true',
        config: 'GOG_CONFIG.scroll.showTrack',
      },
      {
        name: 'horizontalWheel',
        type: 'boolean | undefined',
        default: 'false',
        config: 'GOG_CONFIG.scroll.horizontalWheel',
      },
    ],
    outputs: [
      { name: 'gogScroll', payload: 'GogScrollMetrics' },
      { name: 'gogReachStart', payload: "'vertical' | 'horizontal'" },
      { name: 'gogReachEnd', payload: "'vertical' | 'horizontal'" },
    ],
  },
];
