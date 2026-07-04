import { GogSize } from './types';

export interface GogCheckableControlSizeConfig {
  readonly boxSize: string;
  readonly labelSize: string;
  readonly indicatorSize: string;
}

export const GOG_CHECKABLE_CONTROL_PADDING = 'var(--control-checkbox-padding, 6px)';

export const GOG_CHECKABLE_CONTROL_SIZE_MAP = {
  sm: {
    boxSize: 'var(--control-checkbox-box-size-sm, 18px)',
    labelSize: 'var(--control-checkbox-label-size-sm, 0.8125rem)',
    indicatorSize: 'var(--control-checkbox-icon-size-sm, 12px)',
  },
  md: {
    boxSize: 'var(--control-checkbox-box-size-md, 24px)',
    labelSize: 'var(--control-checkbox-label-size-md, 0.9375rem)',
    indicatorSize: 'var(--control-checkbox-icon-size-md, 14px)',
  },
  lg: {
    boxSize: 'var(--control-checkbox-box-size-lg, 32px)',
    labelSize: 'var(--control-checkbox-label-size-lg, 1.0625rem)',
    indicatorSize: 'var(--control-checkbox-icon-size-lg, 18px)',
  },
} as const satisfies Record<GogSize, GogCheckableControlSizeConfig>;
