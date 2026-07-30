import { GogSize } from './types';

export interface GogCheckableControlSizeConfig {
  readonly boxSize: string;
  readonly labelSize: string;
  readonly indicatorSize: string;
}

export const GOG_CHECKABLE_CONTROL_PADDING = 'var(--control-checkbox-padding, 6px)';

export const GOG_CHECKABLE_CONTROL_SIZE_MAP = {
  sm: {
    boxSize: 'var(--control-checkbox-box-size-sm, 12px)',
    labelSize: 'var(--control-checkbox-label-size-sm, 0.6875rem)',
    indicatorSize: 'var(--control-checkbox-icon-size-sm, 10px)',
  },
  md: {
    boxSize: 'var(--control-checkbox-box-size-md, 18px)',
    labelSize: 'var(--control-checkbox-label-size-md, 0.8125rem)',
    indicatorSize: 'var(--control-checkbox-icon-size-md, 12px)',
  },
  lg: {
    boxSize: 'var(--control-checkbox-box-size-lg, 24px)',
    labelSize: 'var(--control-checkbox-label-size-lg, 0.9375rem)',
    indicatorSize: 'var(--control-checkbox-icon-size-lg, 14px)',
  },
} as const satisfies Record<GogSize, GogCheckableControlSizeConfig>;
