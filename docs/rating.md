# `gog-rating` — a score out of a few stars, to give or to show

Target: the in-progress 21.18.0, beside `gog-breadcrumbs`, `gog-stepper` and `gog-file-upload` — a
minor can carry several components. The filename carries no version on purpose.

`docs/backlog.md`'s Gaps section lists `rating` next. It is additive.

---

## The question this plan exists to answer

**What does it own that a row of star icons and a class do not?** Three answers.

### 1. A row of stars is one choice out of five

A hand-built rating is five clickable icons: five tab stops, no name for any of them, nothing a
screen reader can say about which is chosen. What it _is_ is a radio group — one value out of
`max`, a single tab stop, arrow keys to move, "3 stars, 3 of 5" read out. The component renders
exactly that, from native radios under the drawn stars, so the keyboard and the announcement come
from the platform rather than from a key handler.

### 2. A displayed score is a picture with a number in it

A product's "4.7" is not a control. Read-only, the stars are one `role="img"` named in words
("Rated 4.7 out of 5", from `GOG_CONFIG.labels`), so a reader hears the number rather than five
unnamed glyphs. The stars draw to the nearest half — the precision an eye can read off a star — and
the name keeps the real value.

### 3. The fill follows the pointer, and can be taken back

Hovering previews the score a press would give, and with `clearable` a press on the chosen star (or
Space on it) clears the rating — the one thing native radios cannot do, and the reason a consumer
who wants it ends up with a bespoke key handler.

---

## What it is

```html
<gog-rating label="Your rating" [(value)]="score" clearable /> <gog-rating readonly [value]="4.7" />
```

| Input / model                  | Type                    | Default | Notes                                                       |
| ------------------------------ | ----------------------- | ------- | ----------------------------------------------------------- |
| `value`                        | `model<number \| null>` | `null`  | Two-way, and a `ControlValueAccessor`. `null` is not rated. |
| `max`                          | `number`                | `5`     | How many stars.                                             |
| `readonly`                     | `boolean`               | `false` | A picture of the score, not a control; may be fractional.   |
| `clearable`                    | `boolean`               | `false` | A press on the chosen star clears the rating.               |
| `label`, `ariaLabel`           | `string`                | `''`    | The group's name.                                           |
| `errorMessage`, `errorDisplay` | as every field          |         | `GogErrorState`, like the other controls.                   |
| `disabled`, `size`             | as every field          |         |                                                             |

Labels: `ratingStar(value, max)` names each star ("3 stars"), `ratingValue(value, max)` names the
read-only picture ("Rated 4.7 out of 5", "Not rated") — formatters, like `page`.

## What it is not

- **Not a slider.** A score out of a handful of whole steps is a choice; a continuous range is
  `gog-slider`.
- **Not a review widget.** No counts, no averages, no histogram — the app computes the number.
- **Not a set of arbitrary glyphs** in iteration 1: stars, the built-in `star` and `star-filled`.

---

## Iterations

| #   | What                                                                                                                                              | Status        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| 1   | `gog-rating`: radios under the stars, read-only picture with halves, hover preview, `clearable`, forms, sizes, RTL, tokens, specs, showcase, docs | ✅ 2026-10-04 |

## Geometry, colour and the gates

- **The star is an icon at a size step** (16 / 20 / 24 / 28 / 32), and its padding never lets the
  pressable box fall under 24x24 (law 5), whatever the density.
- **A half star** is the filled glyph clipped over the outline one, mirrored under `dir="rtl"`.
- **`check:contrast`**: the empty star's outline is what shows there is a star to press, so it is the
  control boundary colour at 3:1; the filled star is the accent at 3:1 — both on the page and a
  surface.

## Iteration 1, as it finished

Built as planned, with two things the plan did not foresee.

- **Space on the chosen star needs a handler.** The plan assumed `clearable` could live on the
  radio's `click`, since a press on an already-checked radio still clicks. With the pointer it does;
  with Space it does not — Chrome fires no `click` for Space on a checked radio, so the keyboard had
  no way to clear. `keydown.space` on the chosen star clears it and prevents the default, so a
  browser that _does_ click cannot clear and re-set it in one press. Space again chooses it back.
- **The pressable box is `max()`ed, not padded.** A fixed 4px around a 16px star is 24px at density
  1 and less under a compact theme; the padding is `max(--gog-rating-star-padding, (24px - star) /
2)`, so law 5 holds whatever `--gog-density` does to the star.

Measured in Chrome on the showcase: the group reads `radiogroup "Your rating"` with radios
"1 star" … "5 stars" in one tab stop; ArrowRight from 3 moves focus and value to 4; a press on the
chosen star keeps it, and with `clearable` a press or Space clears it and Space again sets it back;
the `xsm` star's box is 24x24 and `md`'s 32x32; read-only 3.5 is `role="img"` named "Rated 3.5 out
of 5", its half star clipped `inset(0 50% 0 0)` and `inset(0 0 0 50%)` under `dir="rtl"`.
`check:contrast` measures the empty outline and the fill against the page and a surface in all
eleven themes.
