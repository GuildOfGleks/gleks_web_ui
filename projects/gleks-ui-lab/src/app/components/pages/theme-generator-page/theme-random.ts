import { classifyToken } from '../../shared/token-value';
import { FOUNDATION_TOKEN_NAMES, FONT_TOKEN_NAMES } from './foundation-tokens';

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randInt(min: number, max: number): number {
  return Math.round(rand(min, max));
}

function pick<T>(items: readonly T[]): T {
  return items[randInt(0, items.length - 1)];
}

/** HSL (0-360, 0-100, 0-100) → `#rrggbb` — every color control here is a native
 * `<input type="color">`, which only accepts hex, so generation stays in HSL (easier to
 * reason about "random but coherent") and only converts to hex at the very end. */
function hslToHex(h: number, s: number, l: number): string {
  const sNorm = s / 100;
  const lNorm = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sNorm * Math.min(lNorm, 1 - lNorm);
  const f = (n: number) => lNorm - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x: number) =>
    Math.round(255 * x)
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

const HEADING_FONTS = [
  "Georgia, 'Times New Roman', serif",
  "'Trebuchet MS', 'Segoe UI', sans-serif",
  'Verdana, Geneva, sans-serif',
  "'Courier New', Consolas, monospace",
  "'Palatino Linotype', 'Book Antiqua', Palatino, serif",
  "Impact, 'Arial Narrow', sans-serif",
  'system-ui, -apple-system, sans-serif',
  'Garamond, Baskerville, serif',
  "'Franklin Gothic Medium', Arial, sans-serif",
];
const BODY_FONTS = [
  "system-ui, -apple-system, 'Segoe UI', sans-serif",
  'Verdana, Geneva, sans-serif',
  "Tahoma, 'Segoe UI', sans-serif",
  "'Trebuchet MS', sans-serif",
  'Georgia, serif',
  "'Century Gothic', Futura, sans-serif",
  "'Lucida Sans Unicode', 'Lucida Grande', sans-serif",
];
const MONO_FONTS = [
  "ui-monospace, 'Cascadia Code', monospace",
  "Consolas, 'Courier New', monospace",
  "'Lucida Console', Monaco, monospace",
  "'Courier New', monospace",
];

/**
 * One random hue drives the whole palette (background/surface/border/accent all share it, at
 * different saturation/lightness), so the result reads as "a theme" rather than 17 unrelated
 * colors. Semantic colors (success/danger/warning/info) get their own random hue but stay
 * inside their recognizable range — a random "danger" that isn't red-ish would be actively
 * confusing, not a fun surprise.
 */
function randomPalette(dark: boolean): Record<string, string> {
  const hue = randInt(0, 359);
  const secondaryHue = (hue + randInt(40, 140)) % 360;
  const successHue = randInt(95, 150);
  const dangerHue = Math.random() < 0.5 ? randInt(0, 12) : randInt(348, 360);
  const warningHue = randInt(28, 52);
  const infoHue = randInt(190, 225);
  const accentSat = randInt(55, 85);

  return {
    '--gog-background-color': hslToHex(hue, randInt(6, 16), dark ? randInt(4, 9) : randInt(94, 98)),
    '--gog-surface-color': hslToHex(hue, randInt(6, 16), dark ? randInt(10, 16) : randInt(98, 100)),
    '--gog-hover-color': hslToHex(hue, randInt(8, 18), dark ? randInt(16, 24) : randInt(89, 95)),
    '--gog-border-color': hslToHex(hue, randInt(8, 20), dark ? randInt(24, 34) : randInt(76, 87)),
    '--gog-text-color': hslToHex(hue, randInt(4, 12), dark ? randInt(90, 97) : randInt(10, 18)),
    '--gog-accent-text-color': dark ? '#0b0f14' : '#ffffff',
    '--gog-muted-text-color': hslToHex(
      hue,
      randInt(4, 14),
      dark ? randInt(55, 68) : randInt(38, 52),
    ),
    '--gog-primary-color': hslToHex(hue, randInt(4, 12), dark ? randInt(90, 97) : randInt(10, 18)),
    '--gog-accent-color': hslToHex(hue, accentSat, dark ? randInt(50, 62) : randInt(38, 50)),
    '--gog-accent-bright': hslToHex(hue, accentSat, dark ? randInt(64, 74) : randInt(52, 62)),
    '--gog-accent-dim': hslToHex(hue, accentSat, dark ? randInt(34, 44) : randInt(26, 36)),
    '--gog-accent-pale': hslToHex(hue, randInt(35, 55), dark ? randInt(18, 26) : randInt(88, 94)),
    '--gog-secondary-color': hslToHex(
      secondaryHue,
      randInt(40, 65),
      dark ? randInt(55, 66) : randInt(35, 48),
    ),
    '--gog-success-color': hslToHex(successHue, randInt(45, 70), randInt(38, 50)),
    '--gog-danger-color': hslToHex(dangerHue, randInt(55, 78), randInt(45, 56)),
    '--gog-warning-color': hslToHex(warningHue, randInt(60, 85), randInt(46, 58)),
    '--gog-info-color': hslToHex(infoHue, randInt(50, 75), randInt(46, 58)),
  };
}

/** Nudges a range-classified token's current value by up to ~35% of its slider span. */
function jitterNumeric(currentValue: string): string | undefined {
  const control = classifyToken(currentValue);
  if (control.kind !== 'range') return undefined;

  const span = control.max - control.min;
  const jitterAmount = Math.max(span * 0.35, control.step * 2);
  const next = control.numericValue + rand(-jitterAmount, jitterAmount);
  const clamped = Math.min(control.max, Math.max(control.min, next));
  const rounded =
    control.step >= 1 ? Math.round(clamped) : Math.round(clamped / control.step) * control.step;
  return `${Number(rounded.toFixed(3))}${control.unit}`;
}

// Jittering every step of a scale *independently* can invert it — a random draw where
// `--gog-text-sm` comes out larger than `--gog-text-md` doesn't read as "random", it reads as
// broken. Scaling the whole ladder by one shared factor keeps every step's relative order
// intact (multiplying a strictly-increasing sequence by the same positive number is still
// strictly increasing) while still producing real variation between randomizations.
const TYPE_SCALE_NAMES = [
  '--gog-text-xs',
  '--gog-text-sm',
  '--gog-text-md',
  '--gog-text-lg',
  '--gog-text-xl',
  '--gog-text-2xl',
  '--gog-text-3xl',
];
const SPACE_SCALE_NAMES = [
  '--gog-space-xs',
  '--gog-space-sm',
  '--gog-space-md',
  '--gog-space-lg',
  '--gog-space-2xl',
];

function scaleLadder(
  names: readonly string[],
  currentValue: (name: string) => string,
  factor: number,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const name of names) {
    const control = classifyToken(currentValue(name));
    if (control.kind !== 'range') continue;
    const scaled = control.numericValue * factor;
    const rounded =
      control.step >= 1 ? Math.round(scaled) : Math.round(scaled / control.step) * control.step;
    result[name] = `${Number(rounded.toFixed(3))}${control.unit}`;
  }
  return result;
}

/**
 * A full random foundation theme: a coherent palette, random font stacks, the type scale and
 * spacing scale each resized by one shared factor (order-preserving), and a gentle independent
 * jitter on every remaining radius/motion/focus/control-metric token — those don't have a
 * relative-order relationship with each other to protect. `currentValue` should return each
 * token's live current value, so jitter starts from wherever it already is rather than always
 * the shipped default.
 */
export function randomizeFoundation(
  currentValue: (name: string) => string,
): Record<string, string> {
  const dark = Math.random() < 0.5;
  const result: Record<string, string> = { ...randomPalette(dark) };

  result['--gog-font-heading'] = pick(HEADING_FONTS);
  result['--gog-font-body'] = pick(BODY_FONTS);
  result['--gog-font-mono'] = pick(MONO_FONTS);

  Object.assign(result, scaleLadder(TYPE_SCALE_NAMES, currentValue, rand(0.85, 1.3)));
  Object.assign(result, scaleLadder(SPACE_SCALE_NAMES, currentValue, rand(0.75, 1.4)));

  // A plain 0–1 decimal (no unit) doesn't match classifyToken's range detection, so it's
  // handled by hand here rather than through the generic jitter loop below.
  result['--gog-disabled-opacity'] = Number(rand(0.25, 0.6).toFixed(2)).toString();

  const handled = new Set([...Object.keys(result), ...(FONT_TOKEN_NAMES as readonly string[])]);
  for (const name of FOUNDATION_TOKEN_NAMES) {
    if (handled.has(name)) continue;
    const jittered = jitterNumeric(currentValue(name));
    if (jittered !== undefined) result[name] = jittered;
  }

  return result;
}
