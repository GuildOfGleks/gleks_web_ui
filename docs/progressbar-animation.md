# `gog-progressbar`'s `animation` — stripes and a shimmer

Target: the in-progress 21.20.0. The filename carries no version on purpose.

`docs/backlog.md`'s Features section, item 7, asked for "more `gog-progressbar` variants
(animations)" and called it the smallest of the features. `variant` already means the severity
colour, so the new axis is its own input.

---

## The decision — taken by the owner on 2026-10-18

Two animations, out of four offered: **stripes** and **shimmer**. `pulse` and a segmented track
were declined.

```html
<gog-progressbar [value]="62" animation="stripes" ariaLabel="Uploading" />
<gog-progressbar [value]="62" animation="shimmer" ariaLabel="Uploading" />
```

| Input       | Type                                                       | Default  |
| ----------- | ---------------------------------------------------------- | -------- |
| `animation` | `GogProgressbarAnimation` (`'none'\|'stripes'\|'shimmer'`) | `'none'` |

The name is `gog-skeleton`'s: that component already has an `animation` input for the same idea.

## What it owns

- **Motion on a fill that reports a value.** A determinate bar whose number holds still between
  updates looks stalled; motion says "still working" without claiming a position, which is the
  job the indeterminate sweep does for a bar with no number.
- **Ignored in `'indeterminate'` mode**, which already moves. Two motions at once on one fill read
  as a glitch, so the component does not set the class there rather than leaving it to CSS order.
- **In `'buffer'` mode it animates the fill only**, never the buffered tier.

## Reduced motion

`styling.instructions.md`: reduced motion removes the animation, not the information. Neither
animation carries information — the fill's width states the value, and `aria-valuenow` says it —
so: **the stripes stay and stop** (the pattern is harmless and keeps the look), and **the shimmer
goes**, since it is nothing but motion.

## Geometry and tokens

- **The stripe tile is derived, not chosen.** The stripes reuse `--gog-progressbar-stripe-size` and
  `-stripe-color`, the pattern the indeterminate sweep already falls back to under reduced motion.
  `--gog-progressbar-stripes-tile` is a square holding two stripe periods along its diagonal —
  `stripe-size × 2√2` — so it repeats seamlessly at any fill width and the moving stripes have the
  same width as the static ones. The animation slides it one tile, toward the inline end, mirrored
  under `dir="rtl"` through `--gog-direction-sign`.
- **The shimmer is a `::after` layer over the fill**, clipped to it (`overflow: hidden` on the fill
  in that mode only), so the highlight never spills onto the track.
- **The highlight is translucent white, not a palette colour.** The first version reused the stripe
  colour, which is the surface at 45% — and on a dark theme the surface is dark, so the "highlight"
  was a shadow sweeping across the fill. Found in the showcase, not by a check: every fill is a
  mid-tone colour, so only a colour lighter than all of them reads as a highlight in every theme.
- Five new tokens: `--gog-progressbar-stripes-tile`, `-stripes-duration` (1s), `-shimmer-color`
  (translucent white), `-shimmer-duration` (2s), `-shimmer-easing`.

## Iterations

| #   | What                                                                        | Status        |
| --- | --------------------------------------------------------------------------- | ------------- |
| 1   | `animation` input, `GogProgressbarAnimation`, tokens, specs, showcase, docs | ✅ 2026-10-18 |

## Iteration 1, as it finished

`check:tokens`, `check:geometry`, `check:contrast` and the rest stay green; the showcase's
Progressbar page has `animation × mode` and `animation × variant` matrices.
