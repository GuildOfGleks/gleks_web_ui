#!/usr/bin/env node
// Enforces L7 — optical centring — over the built-in icon registry.
//
//   L7. OPTICAL CENTRING  A glyph's ink is centred in its own viewBox, so that centring the box
//                         centres the mark. Where the mark is *solid*, it is its area that must be
//                         centred, not its outline: a filled triangle's centroid sits W/6 from its
//                         bounding-box centre, which is the miscentring this law exists for.
//
// **It is L7 and not "law 6"** because `styling.instructions.md` still states five standing laws
// and this is not one of them. The plan's candidate numbering (L6 to L12) is the one that has an
// entry for it, so that is the number it is reported under, here and in the docs. L6 — optical
// area — was decided (D2) and has not been applied to a component yet, so renumbering this into
// the standing set would have claimed a law that does not exist.
//
// It runs as the second half of `npm run check:geometry`, and it is a separate script rather than
// a section of `check-geometry.mjs` for one reason: that script's contract is that it reads token
// values and never a rendered anything. Its input is `theme.css`; this one's input is path data.
// Sharing a process would have meant one of the two lying about what it reads.
//
// ── What the audit found, and why the gate is on the box ─────────────────────────────────────
//
// `docs/component-geometry.md` planned this law against the mass centroid, and measuring all 41
// glyphs turned that around. Every glyph's ink box is already centred to within 0.01 units
// horizontally and 0.50 vertically, while the *mass* runs as far as 2.05 units off horizontally
// (`arrow-left`/`arrow-right`) and 3.47 vertically (`download`).
//
// Those are not defects, and correcting them would be one. A directional glyph is supposed to
// carry its mass off-centre — `arrow-right` is a shaft with a head on one end — and re-centring
// it by mass would pull the shaft's tail off the left edge of the box while the head stopped
// short of the right. What the eye tracks in a monoline set is the extent, because every stroke
// is the same width and no part is denser than another.
//
// So the law bites on a mark whose ink genuinely tapers, which in SVG means a *filled* shape.
// The registry has exactly one (`star-filled`), and it is checked on its area centroid, which is
// the branch a play triangle would land in the day one is added.
//
// ── The tolerance is derived, not fitted ─────────────────────────────────────────────────────
//
// One unit on the 24 grid. That is a quarter of `W/6 = 4 units`, the smallest correction the law
// itself would ever prescribe, so the gate cannot pass a real instance of what it checks for. It
// is not a number chosen after seeing the spread: the largest offset in the registry is 0.51,
// which leaves it with a factor of two in hand, and a threshold set at 0.6 to "just fit" would
// have been a threshold that had stopped checking.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { measureGlyph } from './svg-ink.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const iconsPath = path.join(root, 'projects/gleks/ui/shared/icons.ts');

/** Units of the 24-grid a glyph's ink centre may sit from the box centre. See the header. */
const TOLERANCE = 1;

/**
 * Glyphs that are deliberately off-centre, each with the reason.
 *
 * Empty, and an entry is a real argument rather than a way past a red build: it has to say what
 * the glyph is doing that makes a centred box the wrong answer for it. A directional mark is not
 * such an argument — those already pass, because they are checked on their extent.
 *
 * @type {Map<string, string>}
 */
const OFF_CENTRE = new Map();

const source = await fs.readFile(iconsPath, 'utf8');

// The union is the roster; ICON_DEFS is the payload. Reading both and comparing is what keeps a
// glyph from going unmeasured because the payload regex did not match its quoting.
const unionBlock = source.slice(
  source.indexOf('export type GogBuiltinIconName'),
  source.indexOf('export type GogIconName'),
);
const names = [...unionBlock.matchAll(/\|\s*'([a-z0-9-]+)'/g)].map((m) => m[1]);

const defsBlock = source.slice(source.indexOf('export const ICON_DEFS'));
const defs = new Map(
  [...defsBlock.matchAll(/^\s*'?([a-z0-9-]+)'?:\s*`(<svg[\s\S]*?)`,/gm)].map((m) => [m[1], m[2]]),
);
// Every value in ICON_DEFS opens with a backtick, so counting those counts the entries however
// their keys are spelled. Both readers above are key regexes, and a key they cannot match is a
// glyph that would go unmeasured while the summary line still reported a healthy number.
const declared = (defsBlock.match(/`<svg/g) ?? []).length;

const findings = [];

if (declared !== defs.size) {
  findings.push(
    `ICON_DEFS holds ${declared} glyph(s) and ${defs.size} key(s) could be read — a key spelling` +
      ` this script does not parse. Widen the key pattern rather than the count.`,
  );
}

if (names.length === 0) {
  findings.push('could not read GogBuiltinIconName — the union moved, and nothing was measured');
}
for (const name of names) {
  if (!defs.has(name))
    findings.push(`${name}: named in GogBuiltinIconName but not read from ICON_DEFS`);
}
for (const name of defs.keys()) {
  if (!names.includes(name)) findings.push(`${name}: in ICON_DEFS but not in GogBuiltinIconName`);
}

let measured = 0;
for (const [name, svg] of defs) {
  const viewBox = /viewBox="([\d.\s-]+)"/.exec(svg);
  if (!viewBox) {
    findings.push(`${name}: no viewBox — there is no box to be centred in`);
    continue;
  }
  const [minX, minY, width, height] = viewBox[1].trim().split(/\s+/).map(Number);
  const centre = [minX + width / 2, minY + height / 2];

  let glyph;
  try {
    glyph = measureGlyph(svg);
  } catch (error) {
    // A glyph that cannot be parsed is a glyph nobody checked. It fails; it is never skipped.
    findings.push(`${name}: unreadable — ${error.message}`);
    continue;
  }
  measured++;

  const reason = OFF_CENTRE.get(name);
  // The area centroid is the law's own statistic and takes over wherever a fill makes it mean
  // something; a purely stroked glyph is read on its extent. See the header.
  const [what, point] = glyph.areaCentre
    ? ['area centre', glyph.areaCentre]
    : ['ink box', glyph.boxCentre];
  const dx = point[0] - centre[0];
  const dy = point[1] - centre[1];

  if (Math.abs(dx) > TOLERANCE || Math.abs(dy) > TOLERANCE) {
    if (reason) continue;
    findings.push(
      `${name}: ${what} at (${point[0].toFixed(2)}, ${point[1].toFixed(2)}), ` +
        `${dx >= 0 ? '+' : ''}${dx.toFixed(2)} / ${dy >= 0 ? '+' : ''}${dy.toFixed(2)} ` +
        `from the box centre (${centre.join(', ')}); tolerance is ${TOLERANCE}`,
    );
  } else if (reason) {
    // An exception that no longer excuses anything is a note that has outlived its finding.
    findings.push(`${name}: listed in OFF_CENTRE ("${reason}") but centred — remove the entry`);
  }
}

if (findings.length > 0) {
  console.error(`Icon geometry check FAILED — ${findings.length} finding(s):\n`);
  for (const finding of findings) console.error(`  [L7] ${finding}`);
  console.error(
    `\n${measured} glyph(s) measured. A glyph centres its ink in its own viewBox; where the mark` +
      ` is filled, it is the area that centres. docs/component-geometry.md, L7.`,
  );
  process.exit(1);
}

const exceptions = OFF_CENTRE.size > 0 ? `, ${OFF_CENTRE.size} deliberate exception(s)` : '';
console.log(`Icon geometry check passed — L7 across ${measured} glyph(s)${exceptions}.`);
