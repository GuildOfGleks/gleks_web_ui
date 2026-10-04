# `gog-avatar` — a person or an entity, as a picture with a fallback

Target: the next minor after 21.16.0. The filename carries no version on purpose; a plan named for
a release is a plan that becomes a lie when the release ships without it.

`docs/backlog.md`'s Gaps section lists the missing components "in rough order of how often a real
site wants them", and `avatar` leads what is left. It is also the first component built under the
semantic-versioning rule 21.16.0 adopted: it is purely additive, so it is a minor.

---

## The question this plan exists to answer

**What does it own that a `<div>` and a class do not?** (`docs/panel-card.md`'s rule, repeated for
every unbuilt component.) An `<img class="avatar">` is the whole of what most sites ship, and it is
what `gog-chip`'s `avatarUrl` renders today. Three answers, and the first is the load-bearing one.

### 1. The fallback chain, which is behaviour and not a look

A picture of a person is the one image on a page most likely to be missing: the user never
uploaded one, the URL expired, the CDN is down, the request was blocked. A bare `<img>` shows the
browser's broken-image glyph in every one of those cases — `gog-chip` does exactly that with a bad
`avatarUrl`. The component owns the chain **picture → initials → icon**:

- **No `src`**: the initials, derived from `name`.
- **`src` that fails**: the same initials, after the `error` event.
- **No `name` either**: the `user` glyph.
- **While a slow `src` loads**: the initials, under the picture, so nothing shifts when it lands.

**The failure the plan must not ship: an image that fails before hydration.** On a server-rendered
page the `<img>` is in the HTML and starts loading before Angular is running; if it fails then, the
`error` event has already fired by the time the listener is attached, and the broken glyph stays
for good. The component checks, once it renders in the browser, whether its image is already
`complete` with no natural width — a check a class has nowhere to live.

### 2. The accessible name, which is a decision

An avatar beside the person's name says the name twice; a standalone avatar in a header says
nothing unless it is named. The component takes the decision as an input and defaults it from what
it was given:

- With a `name`: `role="img"`, named by it. The `<img>` inside is `alt=""`, and the initials are
  `aria-hidden`, so a screen reader hears the name once — not "Ada Lovelace, A L".
- `decorative`: `aria-hidden="true"`, for an avatar that repeats the text beside it.
- **With no `name`, it is decorative automatically**: there is nothing true to say, and an unnamed
  `role="img"` is a lint failure in every accessibility checker.

### 3. One size scale shared with its own placeholder

`gog-skeleton`'s `circle` already exists to stand in for an avatar while data loads, at 24, 32, 48,
64 and 96px across the five size steps. The avatar's sizes **are** those tokens rather than a
second scale beside them, so a skeleton swapped for an avatar at the same `size` does not move the
layout. That is the shape-matching placeholder rule the accordion's skeleton already follows.

Under the bar, but true: initials derived per grapheme rather than per UTF-16 unit (a name that
starts with an emoji or a combining mark is not cut in half), upper-cased in the page's locale.

---

## What it is

```html
<gog-avatar name="Ada Lovelace" src="/people/ada.jpg" />
<gog-avatar name="Grace Hopper" size="lg" />
<gog-avatar name="Acme Inc." shape="rounded" initials="AC" />
<gog-avatar name="Ada Lovelace" decorative /> Ada Lovelace
```

| Input        | Type                  | Default    | Notes                                                                  |
| ------------ | --------------------- | ---------- | ---------------------------------------------------------------------- |
| `src`        | `string \| null`      | `null`     | The picture. Falls back to the initials when unset or when it fails.   |
| `name`       | `string`              | `''`       | Whose avatar: the accessible name and the source of the initials.      |
| `initials`   | `string \| undefined` | derived    | Overrides the derived initials — an organisation's own short form.     |
| `iconName`   | `GogIconName`         | `'user'`   | The last fallback, when there is neither a picture nor a name.         |
| `size`       | `GogSize`             | `'md'`     | The skeleton circle's five steps.                                      |
| `shape`      | `GogAvatarShape`      | `'circle'` | `'circle'` for a person, `'rounded'` for an organisation or a product. |
| `decorative` | `boolean`             | `false`    | Hides it from assistive tech, for an avatar beside its own name.       |

No outputs. A load failure is the component's to handle, not the app's.

**Initials** are the first grapheme of the first word and of the last word, so "Ada King Lovelace"
is `AL` and "Plato" is `P`.

## What it is not

- **Not a chip.** A chip is a pressable or removable label that may carry an avatar; `gog-chip`'s
  `avatarUrl` stays as it is. Whether the chip should render a `gog-avatar` inside, and gain the
  fallback, is a separate decision recorded in `docs/backlog.md` once this ships.
- **Not a status indicator.** "Online" is `gogBadge` on the avatar's host, which already exists and
  already overflows its host on purpose. No `status` input.
- **Not a button.** An avatar that opens a menu is a `gog-button` or `gogMenuTrigger` with the
  avatar inside it; the name then belongs to the button, and the avatar is `decorative`.

---

## Iterations

| #   | What                                                                                                                                                                     | Status        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- |
| 1   | `gog-avatar`: the fallback chain including the pre-hydration failure, the name rule, sizes, shapes, tokens, specs, showcase page, `AGENTS.md`/`README.md`/`CHANGELOG.md` | ✅ 2026-10-04 |
| 2   | `gog-avatar-group`: overlap, a ring in the surface colour, `max` with a `+N` that is named ("3 more")                                                                    | open          |

Iteration 2 is separate because it answers a different question — how a row of avatars overlaps
and what the overflow says — and iteration 1 is complete without it.

## Geometry, colour and the gates

- **Sizes** alias `--gog-skeleton-circle-size-*` (§3); nothing new is chosen.
- **Initials** are drawn at a ratio of the box: two capitals must sit inside the circle's inscribed
  square (side `d/√2`), measured in a browser on the widest pair the fallback can produce.
- **The icon** follows `styling.instructions.md`'s rule for a mark in a box: one declaration sizes
  the glyph's basis, and the box is the avatar.
- **`check:contrast`** gets the initials/icon colour against the avatar's fill, at 4.5:1 — the
  initials at `xsm` are under 10px, so they are body text, not large text.
- **`check:radii`**: `rounded` is a root radius, not nested in anything; the picture takes the host's
  own corner (`border-radius: inherit`) rather than a radius of its own — the host does not clip,
  because `gogBadge` on an avatar has to draw outside it.
- **Not a target.** Nothing about an avatar is pressable, so law 5 does not apply; a pressable
  avatar is a button that contains one.

## Iteration 1, as it finished

**Two things the plan did not see, both about `gogBadge`, and both found by putting a badge on an
avatar in the showcase rather than by reading code.**

- **The badge was silent.** A named avatar is `role="img"`, and a screen reader reads an image by
  its name alone — Chrome's accessibility tree showed the avatar with the badge's `3` gone. The
  badge already knew how to describe a focusable element inside its host; it now describes a
  `role="img"` host the same way, and the tree reads `image "Ada Lovelace"`, description `3`.
- **The badge floated in the corner.** It anchors at the host's box corner, which for a circle is
  empty space — the status dot sat at 1.18 of the radius from the centre, visibly off the avatar.
  Two tokens, inert by default: `--gog-badge-host-inset` (the anchor, which a round avatar sets to
  where the circle crosses the diagonal, `(1 - 1/sqrt(2)) / 2` of the diameter) and
  `--gog-badge-dot-offset` (half the dot, so its centre lands on that point). Measured after: the
  dot's centre at 1.00r, the count's at 0.88r, and every badge on the Badge page still 8px out from
  its host's corner.

**And the plan's own geometry note was wrong once.** It had the host clip the picture with
`overflow: hidden`; that would have cut the badge off, since it draws outside the host on purpose.
The picture takes the host's corner with `border-radius: inherit` instead.

Measured in Chrome: the five sizes are 24/32/48/64/96px, equal to the skeleton circle at every
step; "AL" at 0.4 of the diameter is 0.49d wide, inside the inscribed square's 0.71d; the
`src fails` row of the showcase, a URL that 404s on a server-rendered page, shows initials and no
broken image. `check:contrast` measures the initials on the fill in all eleven themes (22 pairs,
all passing).
