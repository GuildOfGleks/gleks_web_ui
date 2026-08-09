// Classifies a resolved `--gog-*` token value into the editor control it should render as, and
// separately whether a value is paintable as a swatch (used by both the theme generator's
// editor and the Token Reference table on the Theming page).

const HEX_COLOR_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const COLOR_FUNCTION_RE = /^(rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color-mix)\(/i;
const NAMED_COLOR_RE = /^[a-z]+$/i;
// A conservative allowlist rather than every CSS named color — good enough to catch the ones a
// theme actually uses (mostly `transparent`/`currentColor`), without false-positiving on plain
// keywords like `solid` or `normal` that also happen to be bare words.
const KNOWN_NAMED_COLORS = new Set(['transparent', 'currentcolor', 'black', 'white']);

/** Whether `value` (a trimmed, resolved CSS value) can be painted as a color swatch. */
export function isColorValue(value: string): boolean {
  if (HEX_COLOR_RE.test(value) || COLOR_FUNCTION_RE.test(value)) return true;
  return NAMED_COLOR_RE.test(value) && KNOWN_NAMED_COLORS.has(value.toLowerCase());
}

const UNIT_RE = /^(-?\d+(?:\.\d+)?)(px|rem|em|%|deg|ms|s)$/;

interface RangeBounds {
  readonly min: number;
  readonly max: number;
  readonly step: number;
}

/** A UI-sane slider range around `value`, scaled per unit rather than one fixed span for all. */
function rangeBoundsFor(unit: string, value: number): RangeBounds {
  switch (unit) {
    case 'px':
      return { min: 0, max: Math.max(value * 4, 64), step: 1 };
    case 'rem':
    case 'em':
      return { min: 0, max: Math.max(value * 4, 4), step: 0.05 };
    case '%':
      return { min: 0, max: 100, step: 1 };
    case 'deg':
      return { min: 0, max: 360, step: 1 };
    case 's':
      return { min: 0, max: Math.max(value * 4, 2), step: 0.05 };
    case 'ms':
      return { min: 0, max: Math.max(value * 4, 2000), step: 10 };
    default:
      return { min: 0, max: Math.max(value * 4, 10), step: 1 };
  }
}

export interface ColorControl {
  readonly kind: 'color';
}

export interface RangeControl extends RangeBounds {
  readonly kind: 'range';
  readonly unit: string;
  readonly numericValue: number;
}

export interface TextControl {
  readonly kind: 'text';
}

export type TokenControl = ColorControl | RangeControl | TextControl;

/** Picks the editor control a token's current value calls for — color picker, slider, or text. */
export function classifyToken(value: string): TokenControl {
  const trimmed = value.trim();
  if (isColorValue(trimmed)) return { kind: 'color' };

  const unitMatch = UNIT_RE.exec(trimmed);
  if (unitMatch) {
    const numericValue = Number.parseFloat(unitMatch[1]);
    const unit = unitMatch[2];
    return { kind: 'range', unit, numericValue, ...rangeBoundsFor(unit, numericValue) };
  }

  return { kind: 'text' };
}
