import { GogSize } from './types';

export interface GogCheckableControlSizeConfig {
  readonly boxSize: string;
  readonly labelSize: string;
  readonly indicatorSize: string;
}

export const GOG_CHECKABLE_CONTROL_PADDING = '6px';

export const GOG_CHECKABLE_CONTROL_SIZE_MAP = {
  sm: {
    boxSize: '18px',
    labelSize: '0.8125rem',
    indicatorSize: '12px',
  },
  md: {
    boxSize: '24px',
    labelSize: '0.9375rem',
    indicatorSize: '14px',
  },
  lg: {
    boxSize: '32px',
    labelSize: '1.0625rem',
    indicatorSize: '18px',
  },
} as const satisfies Record<GogSize, GogCheckableControlSizeConfig>;
