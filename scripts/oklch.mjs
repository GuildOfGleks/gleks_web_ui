/**
 * sRGB ↔ OKLCH, and a solver that walks lightness until a contrast ratio clears.
 *
 * ## Why this exists
 *
 * `check:contrast` says "2.77:1, need 4.5". That leaves the fixing to taste, and taste is the one
 * thing this project has decided it does not have — the whole argument in `docs/backlog.md` is
 * that the right colours get found by computing them. Every palette fix made here by hand
 * (`slate`'s sky-500 → sky-700, `light`'s gold, `one-dark`'s comment grey) was this walk done
 * manually, one guess at a time.
 *
 * ## Why OKLCH and not "make it darker"
 *
 * WCAG's ratio is a luminance formula. Darkening in sRGB moves hue and chroma as a side effect —
 * a gold that needs one more step of contrast comes back browner, and a blue comes back purple.
 * OKLCH separates the three: hold hue and chroma, move L alone, and the colour that comes out is
 * the same colour at a different lightness. That is the difference between "a fix" and "a new
 * palette decision nobody signed off".
 *
 * No dependency: sRGB → linear → OKLab → OKLCH and back is about forty lines of arithmetic, and
 * the bisection is ten more. The conversion follows Björn Ottosson's published matrices.
 *
 * ## The gamut caveat, which is why `solve` reports rather than asserts
 *
 * Not every request has an answer. A saturated amber cannot reach 4.5:1 against white at any
 * lightness while keeping its chroma — the walk runs to L=0 and still falls short. When that
 * happens the solver says so and reports the best it reached, instead of returning a colour that
 * silently misses. It also reduces chroma only when asked (`allowChromaLoss`), because giving up
 * saturation is a design decision and not the solver's to make quietly.
 */

const clamp01 = (x) => Math.min(1, Math.max(0, x));

function srgbToLinear(c) {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(c) {
  const s = c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055;
  return Math.round(clamp01(s) * 255);
}

/** { r, g, b } in 0–255 → OKLab. */
export function rgbToOklab({ r, g, b }) {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);

  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);

  return {
    L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  };
}

/** OKLab → { r, g, b } in 0–255, clipped to gamut. */
export function oklabToRgb({ L, a, b }) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;

  return {
    r: linearToSrgb(+4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g: linearToSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    b: linearToSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  };
}

export function rgbToOklch(rgb) {
  const { L, a, b } = rgbToOklab(rgb);
  return {
    L,
    C: Math.hypot(a, b),
    // Hue is meaningless at zero chroma; report 0 rather than an artefact of rounding.
    h: Math.hypot(a, b) < 1e-6 ? 0 : (Math.atan2(b, a) * 180) / Math.PI,
  };
}

export function oklchToRgb({ L, C, h }) {
  const rad = (h * Math.PI) / 180;
  return oklabToRgb({ L, a: C * Math.cos(rad), b: C * Math.sin(rad) });
}

const relLum = ({ r, g, b }) =>
  0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);

export function contrastRatio(a, b) {
  const la = relLum(a);
  const lb = relLum(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export const toHex = ({ r, g, b }) =>
  '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');

export function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  const n = parseInt(full.slice(0, 6), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/**
 * The nearest colour to `ink` that clears `target` against `ground`, holding hue and chroma and
 * moving lightness only.
 *
 * Direction is decided rather than guessed: whichever way the ground is *not*. A dark ground gets
 * a lighter ink and a light ground a darker one, which is the same choice a person makes and the
 * one that keeps the result recognisable as the colour it started as.
 *
 * Returns `{ ok, hex, ratio, steps, note }`. `ok: false` with the best reachable ratio is a real
 * answer — it means no lightness satisfies the request at this chroma, and the caller has to
 * decide between losing saturation and changing the ground.
 */
export function solve(inkHex, groundHex, target, { allowChromaLoss = false } = {}) {
  const ink = hexToRgb(inkHex);
  const ground = hexToRgb(groundHex);
  const start = contrastRatio(ink, ground);
  if (start >= target) {
    return { ok: true, hex: inkHex, ratio: start, steps: 0, note: 'already passes' };
  }

  const { C, h } = rgbToOklch(ink);
  // Move away from the ground: if the ground is light, go dark, and the other way round.
  const groundIsLight = relLum(ground) > 0.18;
  const bound = groundIsLight ? 0 : 1;

  const L0 = rgbToOklch(ink).L;

  /**
   * The nearest passing lightness at a given chroma, or null.
   *
   * Contrast is monotonic in L on each side of the ground, so this is a plain bisection between
   * the starting lightness (which fails, or we would not be here) and the extreme (which is the
   * most contrast this hue can give). `passes` is checked at the extreme first: if even that
   * falls short, no amount of halving will find anything, and the loop would otherwise return the
   * midpoint of two failures.
   *
   * Every candidate is verified by measuring it rather than by trusting the search — `oklchToRgb`
   * clips out-of-gamut combinations, which can put a small kink in the curve, and a solver that
   * returns a colour it never measured is the same failing-open bug as a checker that matches
   * nothing.
   */
  const attempt = (chroma) => {
    const at = (L) => {
      const rgb = oklchToRgb({ L, C: chroma, h });
      return { rgb, ratio: contrastRatio(rgb, ground) };
    };
    const extreme = at(bound);
    if (extreme.ratio < target) return null;

    // `fail` is the end we know misses, `pass` the end we know clears. Halve toward `fail` so the
    // answer stays as close to the original lightness as the target allows.
    let fail = L0;
    let pass = bound;
    let best = extreme;
    for (let i = 0; i < 24; i++) {
      const mid = (fail + pass) / 2;
      const candidate = at(mid);
      if (candidate.ratio >= target) {
        best = candidate;
        pass = mid;
      } else {
        fail = mid;
      }
    }
    return { hex: toHex(best.rgb), ratio: best.ratio };
  };

  let best = attempt(C);
  let note = 'hue and chroma held';
  if (!best && allowChromaLoss) {
    // Only when the caller has said saturation may go. Ten steps down the chroma axis is enough
    // to tell "possible with less colour" from "not possible at this hue".
    for (let step = 1; step <= 10 && !best; step++) {
      best = attempt((C * (10 - step)) / 10);
      if (best) note = `chroma reduced to ${(((10 - step) / 10) * 100).toFixed(0)}% to reach it`;
    }
  }

  if (!best) {
    // Report the best the axis can do, so the caller sees how far off it is.
    const extreme = oklchToRgb({ L: bound, C, h });
    return {
      ok: false,
      hex: toHex(extreme),
      ratio: contrastRatio(extreme, ground),
      steps: 24,
      note:
        `no lightness reaches ${target}:1 at this hue and chroma` +
        (allowChromaLoss ? ', even with chroma removed' : ' — retry with --allow-chroma-loss'),
    };
  }
  return { ok: true, hex: best.hex, ratio: best.ratio, steps: 24, note };
}
