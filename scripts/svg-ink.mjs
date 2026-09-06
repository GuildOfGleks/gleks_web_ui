// Measures where a glyph's ink actually sits inside its viewBox, for L7 (optical centring).
//
// Two numbers come out of it, and the difference between them is the whole point:
//
//   * **the ink box** — the extent of everything drawn. This is what the eye reads as "the icon"
//     for a monoline set, where every stroke is the same width and no part of the mark is denser
//     than another.
//   * **the mass centroid** — the ink's centre of gravity, weighted by stroke length. This is the
//     statistic L7 is written against, and it is the right one only for a *solid tapering* mark,
//     where one end genuinely carries more ink than the other.
//
// `docs/component-geometry.md` records why the registry is checked on the first and not the
// second: a directional glyph is *supposed* to have its mass off-centre. `arrow-right` is a shaft
// with a head on one end, so its mass sits 2.05 units right of centre; shifting the path to fix
// that would pull the shaft's tail off the left edge to cure something nobody can see.
//
// **No geometry dependency, and none is needed.** The plan assumed a path centroid could not be
// computed "reliably for arbitrary curves without a geometry dependency" and fell back to a
// hand-maintained spec. Sampling each curve at a fixed number of points and summing segment
// midpoints by length is accurate to well under a hundredth of a unit here, which is two orders
// below the smallest correction the law would ever prescribe — so the check is a check.

/** Samples per curve or arc. 64 puts the sampling error three orders below the gate. */
const SAMPLES = 64;

const attrsOf = (tag) =>
  Object.fromEntries([...tag.matchAll(/([a-zA-Z0-9-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));

/** Appends `SAMPLES` points along a cubic Bezier, excluding the start (the run already has it). */
function sampleCubic(p0, p1, p2, p3, out) {
  for (let k = 1; k <= SAMPLES; k++) {
    const t = k / SAMPLES;
    const u = 1 - t;
    out.push([
      u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
    ]);
  }
}

/**
 * Appends `SAMPLES` points along an elliptical arc, via SVG's endpoint-to-centre parameterisation
 * (SVG 1.1, F.6.5). Endpoints alone are not enough: `lock`'s shackle is a single arc that bulges
 * 5 units above both of them, and reading only the ends puts a fifth of that glyph outside the
 * measured box.
 */
function sampleArc(p0, rx, ry, phiDeg, largeArc, sweep, p1, out) {
  if (rx === 0 || ry === 0) {
    out.push(p1);
    return;
  }
  rx = Math.abs(rx);
  ry = Math.abs(ry);
  const phi = (phiDeg * Math.PI) / 180;
  const cos = Math.cos(phi);
  const sin = Math.sin(phi);
  const dx = (p0[0] - p1[0]) / 2;
  const dy = (p0[1] - p1[1]) / 2;
  const x1 = cos * dx + sin * dy;
  const y1 = -sin * dx + cos * dy;

  // Radii too small to span the endpoints are scaled up, per F.6.6.
  const lambda = (x1 * x1) / (rx * rx) + (y1 * y1) / (ry * ry);
  if (lambda > 1) {
    const s = Math.sqrt(lambda);
    rx *= s;
    ry *= s;
  }

  const sign = largeArc === sweep ? -1 : 1;
  const numerator = rx * rx * ry * ry - rx * rx * y1 * y1 - ry * ry * x1 * x1;
  const denominator = rx * rx * y1 * y1 + ry * ry * x1 * x1;
  const coefficient = sign * Math.sqrt(Math.max(0, numerator / denominator));
  const cxPrime = (coefficient * rx * y1) / ry;
  const cyPrime = (-coefficient * ry * x1) / rx;
  const cx = cos * cxPrime - sin * cyPrime + (p0[0] + p1[0]) / 2;
  const cy = sin * cxPrime + cos * cyPrime + (p0[1] + p1[1]) / 2;

  const angle = (ux, uy, vx, vy) => {
    const dot = (ux * vx + uy * vy) / (Math.hypot(ux, uy) * Math.hypot(vx, vy));
    const a = Math.acos(Math.min(1, Math.max(-1, dot)));
    return ux * vy - uy * vx < 0 ? -a : a;
  };
  const theta = angle(1, 0, (x1 - cxPrime) / rx, (y1 - cyPrime) / ry);
  let sweepAngle = angle(
    (x1 - cxPrime) / rx,
    (y1 - cyPrime) / ry,
    (-x1 - cxPrime) / rx,
    (-y1 - cyPrime) / ry,
  );
  if (!sweep && sweepAngle > 0) sweepAngle -= 2 * Math.PI;
  if (sweep && sweepAngle < 0) sweepAngle += 2 * Math.PI;

  for (let k = 1; k <= SAMPLES; k++) {
    const t = theta + (sweepAngle * k) / SAMPLES;
    out.push([
      cos * rx * Math.cos(t) - sin * ry * Math.sin(t) + cx,
      sin * rx * Math.cos(t) + cos * ry * Math.sin(t) + cy,
    ]);
  }
}

/**
 * Every subpath of a `d` attribute, as a polyline.
 *
 * Subpaths are kept apart on purpose. A run is a stretch of ink; the jump from the end of one
 * subpath to the start of the next is not drawn, and folding both into one polyline would weigh
 * that empty move as if it were stroke — `close`, two crossing strokes, would gain a third.
 *
 * Throws on a command it does not implement. A parser that silently skips what it cannot read
 * reports a healthy number over a glyph it never measured, which is the failure `token-color.mjs`
 * paid for once already.
 */
export function pathRuns(d) {
  const runs = [];
  let run = null;
  const tokens = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e-?\d+)?/g) ?? [];
  let i = 0;
  let command = '';
  let x = 0;
  let y = 0;
  let startX = 0;
  let startY = 0;
  // The previous curve's second control point, for the reflection S/T take.
  let reflectX = null;
  let reflectY = null;
  const num = () => {
    const value = parseFloat(tokens[i++]);
    if (Number.isNaN(value)) throw new Error(`expected a number in path "${d}"`);
    return value;
  };

  while (i < tokens.length) {
    if (/[a-zA-Z]/.test(tokens[i])) command = tokens[i++];
    const relative = command === command.toLowerCase();
    const c = command.toUpperCase();
    const at = (dx, dy) => (relative ? [x + dx, y + dy] : [dx, dy]);

    if (c === 'M') {
      [x, y] = at(num(), num());
      startX = x;
      startY = y;
      run = [[x, y]];
      runs.push(run);
      reflectX = reflectY = null;
      // A second coordinate pair after M is an implicit lineto, per the grammar.
      command = relative ? 'l' : 'L';
      continue;
    }

    const out = [];
    if (c === 'L') {
      [x, y] = at(num(), num());
      out.push([x, y]);
      reflectX = reflectY = null;
    } else if (c === 'H') {
      x = relative ? x + num() : num();
      out.push([x, y]);
      reflectX = reflectY = null;
    } else if (c === 'V') {
      y = relative ? y + num() : num();
      out.push([x, y]);
      reflectX = reflectY = null;
    } else if (c === 'C' || c === 'S') {
      const c1 =
        c === 'C' ? at(num(), num()) : reflectX === null ? [x, y] : [2 * x - reflectX, 2 * y - reflectY];
      const c2 = at(num(), num());
      const end = at(num(), num());
      sampleCubic([x, y], c1, c2, end, out);
      [reflectX, reflectY] = c2;
      [x, y] = end;
    } else if (c === 'Q' || c === 'T') {
      const q =
        c === 'Q' ? at(num(), num()) : reflectX === null ? [x, y] : [2 * x - reflectX, 2 * y - reflectY];
      const end = at(num(), num());
      // A quadratic raised to a cubic, so one sampler serves both.
      sampleCubic(
        [x, y],
        [x + (2 / 3) * (q[0] - x), y + (2 / 3) * (q[1] - y)],
        [end[0] + (2 / 3) * (q[0] - end[0]), end[1] + (2 / 3) * (q[1] - end[1])],
        end,
        out,
      );
      [reflectX, reflectY] = q;
      [x, y] = end;
    } else if (c === 'A') {
      const rx = num();
      const ry = num();
      const rotation = num();
      const largeArc = num();
      const sweep = num();
      const end = at(num(), num());
      sampleArc([x, y], rx, ry, rotation, largeArc, sweep, end, out);
      [x, y] = end;
      reflectX = reflectY = null;
    } else if (c === 'Z') {
      x = startX;
      y = startY;
      out.push([x, y]);
      reflectX = reflectY = null;
    } else {
      throw new Error(`unhandled path command "${command}" in "${d}"`);
    }

    if (!run) throw new Error(`path "${d}" draws before its first moveto`);
    run.push(...out);
  }

  return runs;
}

/**
 * Every drawable in an SVG string as a run: its polyline, and whether it is filled.
 *
 * `filled` is what decides which centroid means anything. A stroked run's ink lies along a line
 * of constant width, so its mass is its length; a filled run's ink is its area, and the two
 * disagree exactly where L7 bites — a solid triangle's area centroid sits a sixth of the way off
 * the centre its outline would report.
 *
 * Throws on an element it does not know. The registry is 41 glyphs of one authored set; a shape
 * this cannot read is a shape nobody measured, and it should stop the build rather than shrink
 * the sample silently.
 */
export function svgRuns(svg) {
  const runs = [];
  for (const match of svg.matchAll(/<([a-z]+)\b([^>]*)>/g)) {
    const [, element, rawAttrs] = match;
    if (element === 'svg' || element === 'g' || element === 'title' || element === 'desc') continue;
    const a = attrsOf(rawAttrs);
    // The registry's root carries `fill="none"`; a shape opting into a fill says so on itself.
    const filled = a.fill !== undefined && a.fill !== 'none';
    const push = (points) => runs.push({ points, filled });

    if (element === 'path') {
      for (const run of pathRuns(a.d)) push(run);
    } else if (element === 'circle') {
      const [cx, cy, r] = [+a.cx, +a.cy, +a.r];
      const points = [];
      for (let k = 0; k <= 4 * SAMPLES; k++) {
        const t = (2 * Math.PI * k) / (4 * SAMPLES);
        points.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]);
      }
      push(points);
    } else if (element === 'rect') {
      const [rx, ry, w, h] = [+a.x, +a.y, +a.width, +a.height];
      push([
        [rx, ry],
        [rx + w, ry],
        [rx + w, ry + h],
        [rx, ry + h],
        [rx, ry],
      ]);
    } else if (element === 'line') {
      push([
        [+a.x1, +a.y1],
        [+a.x2, +a.y2],
      ]);
    } else if (element === 'polygon' || element === 'polyline') {
      const numbers = (a.points.match(/-?\d*\.?\d+/g) ?? []).map(Number);
      const points = [];
      for (let k = 0; k + 1 < numbers.length; k += 2) points.push([numbers[k], numbers[k + 1]]);
      if (element === 'polygon' && points.length > 0) points.push(points[0]);
      push(points);
    } else if (element === 'ellipse') {
      const [cx, cy, rx, ry] = [+a.cx, +a.cy, +a.rx, +a.ry];
      const points = [];
      for (let k = 0; k <= 4 * SAMPLES; k++) {
        const t = (2 * Math.PI * k) / (4 * SAMPLES);
        points.push([cx + rx * Math.cos(t), cy + ry * Math.sin(t)]);
      }
      push(points);
    } else {
      throw new Error(`unhandled SVG element "<${element}>"`);
    }
  }
  return runs;
}

/**
 * The ink box and the stroke-length centroid of one glyph.
 *
 * The measurement is of the path geometry, not of the stroked outline. That is deliberate and it
 * costs nothing: the whole set is one uniform `stroke-width` with round caps, so stroking grows
 * the box by half a stroke on all four sides and moves neither centre. A set mixing weights would
 * need the outline, and would also be a different problem — `icons.ts` says why it does not mix.
 */
export function measureGlyph(svg) {
  const runs = svgRuns(svg);
  const xs = [];
  const ys = [];
  let length = 0;
  let lengthMomentX = 0;
  let lengthMomentY = 0;
  let area = 0;
  let areaMomentX = 0;
  let areaMomentY = 0;

  for (const { points, filled } of runs) {
    for (const [x, y] of points) {
      xs.push(x);
      ys.push(y);
    }

    if (points.length === 1) {
      // A round cap with nowhere to go — `more-horizontal` is three of them. Unit mass at the dot.
      length += 1;
      lengthMomentX += points[0][0];
      lengthMomentY += points[0][1];
      continue;
    }

    for (let k = 1; k < points.length; k++) {
      const segment = Math.hypot(points[k][0] - points[k - 1][0], points[k][1] - points[k - 1][1]);
      if (segment === 0) continue;
      length += segment;
      lengthMomentX += (segment * (points[k][0] + points[k - 1][0])) / 2;
      lengthMomentY += (segment * (points[k][1] + points[k - 1][1])) / 2;
    }

    if (!filled) continue;
    // Shoelace over the closed run. Signed, so a hole drawn the other way subtracts itself.
    for (let k = 1; k < points.length; k++) {
      const [x0, y0] = points[k - 1];
      const [x1, y1] = points[k];
      const cross = x0 * y1 - x1 * y0;
      area += cross / 2;
      areaMomentX += ((x0 + x1) * cross) / 6;
      areaMomentY += ((y0 + y1) * cross) / 6;
    }
  }

  if (xs.length === 0) throw new Error('glyph draws nothing');

  const box = {
    x0: Math.min(...xs),
    x1: Math.max(...xs),
    y0: Math.min(...ys),
    y1: Math.max(...ys),
  };
  return {
    box,
    boxCentre: [(box.x0 + box.x1) / 2, (box.y0 + box.y1) / 2],
    /** Mass along the stroke. Meaningful for a monoline glyph; misleading for a solid one. */
    massCentre: [lengthMomentX / length, lengthMomentY / length],
    /** Mass by area, over the filled runs only — `null` when the glyph is purely stroked. */
    areaCentre: area === 0 ? null : [areaMomentX / area, areaMomentY / area],
    length,
    area,
  };
}
