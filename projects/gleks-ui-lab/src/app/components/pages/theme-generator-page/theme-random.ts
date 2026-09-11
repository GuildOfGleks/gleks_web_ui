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
function randomPalette(dark: boolean, hue: number): Record<string, string> {
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
    // The control boundary is generated rather than left at its shipped default, and it is
    // generated *apart* from the decorative border above: a random theme that moved the hairline
    // and left the boundary behind would be a theme whose chips and switches are invisible in it,
    // which is the exact defect 21.12.0 split the two tokens to end. The lightness bands are
    // picked so the worst draw still clears 3:1 (WCAG SC 1.4.11) against both the surface and the
    // page — measured across every hue and saturation this function can produce, worst case 3.07.
    '--gog-control-boundary-color': hslToHex(
      hue,
      randInt(8, 20),
      dark ? randInt(56, 66) : randInt(38, 46),
    ),
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

/** `#rrggbb` → the unwrapped `r g b` triple the elevation family composites its alphas against. */
function hexToTriple(hex: string): string {
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  return `${r} ${g} ${b}`;
}

/**
 * The elevation family, generated as one *style* rather than as ten independent numbers.
 *
 * It has to be handled here rather than left to the generic jitter loop below, and the reason is
 * worth stating: `--gog-elevation-ring-width` ships at `0px`, and `classifyToken`'s px range opens
 * at a 0–64 span regardless of the current value, so a random draw puts a twenty-pixel ring around
 * every overlay in the gallery. `--gog-elevation-contact-blur` goes the same way.
 *
 * They are not independent anyway. The three multipliers are a style axis, and the three styles
 * the library's own presets use are soft (drop the key straight down), hard offset (`bevel`,
 * `ledger` — a fraction of x and y, no blur) and glow (`terminal` — no y, all blur). Picking one
 * and filling it in coherently is both safer than jitter and a better demonstration of what the
 * family is for.
 */
function randomElevation(hue: number, dark: boolean): Record<string, string> {
  const style = pick(['soft', 'soft', 'hard', 'glow'] as const);
  const keyAlpha = dark ? rand(0.45, 0.65) : rand(0.06, 0.12);

  return {
    // A dark theme's shadow is the absence of light, so it stays neutral black; a light theme's
    // reads better tinted toward its own hue, which is what the shipped light palette does.
    '--gog-elevation-ink': dark
      ? '0 0 0'
      : hexToTriple(hslToHex(hue, randInt(30, 50), randInt(6, 12))),
    '--gog-elevation-key-alpha': Number(keyAlpha.toFixed(2)).toString(),
    // Half the key — the ratio the shipped light theme's own two-layer panel already held.
    '--gog-elevation-ambient-alpha': Number((keyAlpha / 2).toFixed(2)).toString(),
    '--gog-elevation-contact-blur': `${randInt(2, 4)}px`,
    '--gog-elevation-key-x': style === 'hard' ? Number(rand(0.2, 0.5).toFixed(2)).toString() : '0',
    '--gog-elevation-key-y':
      style === 'glow'
        ? '0'
        : style === 'hard'
          ? Number(rand(0.2, 0.5).toFixed(2)).toString()
          : '1',
    '--gog-elevation-key-blur':
      style === 'hard'
        ? '0'
        : style === 'glow'
          ? randInt(4, 7).toString()
          : randInt(2, 4).toString(),
    // On a near-black page a black blur reads as smudge rather than lift, so a dark draw carries
    // the ring and the top-edge catch light that actually mark the surface. Both stay inert on a
    // light one, where the shadow alone is enough.
    '--gog-elevation-ring-width': dark ? '1px' : '0px',
    '--gog-elevation-highlight-ink': '255 255 255',
    '--gog-elevation-highlight-alpha': dark ? Number(rand(0.05, 0.1).toFixed(2)).toString() : '0',
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
// Every step, in order — including `--gog-text-2xs` (21.11.0) and `--gog-text-slg`, both of which
// were missing here. A step left out of the shared factor keeps its shipped value while its
// neighbours move, which is precisely the inversion this list exists to prevent: at the top of the
// factor's range, `slg`'s untouched 1.25rem came out *smaller* than the `lg` it sits above.
const TYPE_SCALE_NAMES = [
  '--gog-text-2xs',
  '--gog-text-xs',
  '--gog-text-sm',
  '--gog-text-md',
  '--gog-text-lg',
  '--gog-text-slg',
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
  const hue = randInt(0, 359);
  const result: Record<string, string> = {
    ...randomPalette(dark, hue),
    ...randomElevation(hue, dark),
  };

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
