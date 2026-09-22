import { SliderComponent } from '@guildofgleks/ui';

import type { DocApi } from '../../doc/doc-api';

export const SLIDER_API: readonly DocApi[] = [
  {
    type: SliderComponent,
    inputs: [
      { name: 'label', type: 'string', default: "''" },
      { name: 'ariaLabel', type: 'string', default: "'' ('Slider' with no label)" },
      { name: 'min', type: 'number', default: '0' },
      { name: 'max', type: 'number', default: '100' },
      { name: 'step', type: 'number', default: '1' },
      { name: 'value', type: 'number (model)', default: '0' },
      { name: 'showValue', type: 'boolean', default: 'true' },
      { name: 'showThumb', type: 'boolean', default: 'true' },
      { name: 'disabled', type: 'boolean', default: 'false' },
      { name: 'fullWidth', type: 'boolean', default: 'true' },
      { name: 'orientation', type: 'GogSliderOrientation', default: "'horizontal'" },
      { name: 'range', type: 'boolean', default: 'false' },
      { name: 'rangeValue', type: 'GogSliderRange (model)', default: '{ start: 0, end: 100 }' },
      { name: 'startAriaLabel', type: 'string', default: "'' ('Minimum')" },
      { name: 'endAriaLabel', type: 'string', default: "'' ('Maximum')" },
      { name: 'startDisabled', type: 'boolean', default: 'false' },
      { name: 'endDisabled', type: 'boolean', default: 'false' },
      { name: 'errorMessage', type: 'string', default: "''" },
      {
        name: 'errorDisplay',
        type: 'GogErrorDisplay | undefined',
        default: "'manual'",
        config: 'GOG_CONFIG.control.errorDisplay',
      },
    ],
    outputs: [
      { name: 'valueChange', payload: 'number' },
      { name: 'rangeValueChange', payload: 'GogSliderRange' },
    ],
  },
];
