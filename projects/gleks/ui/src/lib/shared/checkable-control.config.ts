import { GogSize } from './types';

export interface GogCheckableControlSizeConfig {
  readonly boxSize: string;
  readonly labelSize: string;
  readonly indicatorSize: string;
}

export const GOG_CHECKABLE_CONTROL_PADDING = 'var(--gog-control-checkbox-padding, 6px)';

export const GOG_CHECKABLE_CONTROL_SIZE_MAP = {
  xsm: {
    boxSize: 'var(--gog-control-checkbox-box-size-xsm, 12px)',
    labelSize: 'var(--gog-control-checkbox-label-size-xsm, 0.6875rem)',
    indicatorSize: 'var(--gog-control-checkbox-icon-size-xsm, 10px)',
  },
  sm: {
    boxSize: 'var(--gog-control-checkbox-box-size-sm, 18px)',
    labelSize: 'var(--gog-control-checkbox-label-size-sm, 0.8125rem)',
    indicatorSize: 'var(--gog-control-checkbox-icon-size-sm, 12px)',
  },
  md: {
    boxSize: 'var(--gog-control-checkbox-box-size-md, 24px)',
    labelSize: 'var(--gog-control-checkbox-label-size-md, 0.9375rem)',
    indicatorSize: 'var(--gog-control-checkbox-icon-size-md, 14px)',
  },
  lg: {
    boxSize: 'var(--gog-control-checkbox-box-size-lg, 32px)',
    labelSize: 'var(--gog-control-checkbox-label-size-lg, 1.0625rem)',
    indicatorSize: 'var(--gog-control-checkbox-icon-size-lg, 18px)',
  },
  slg: {
    boxSize: 'var(--gog-control-checkbox-box-size-slg, 40px)',
    labelSize: 'var(--gog-control-checkbox-label-size-slg, 1.1875rem)',
    indicatorSize: 'var(--gog-control-checkbox-icon-size-slg, 22px)',
  },
} as const satisfies Record<GogSize, GogCheckableControlSizeConfig>;
