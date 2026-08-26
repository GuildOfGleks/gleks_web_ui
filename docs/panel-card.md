# `gog-panel` and `gog-card`

**Built 2026-08-23, in 21.6.1; finished 2026-08-26.** All four iterations are done — 1, 2 and 3 are
in the changelog, and iteration 4 (the showcase's own `.card` goes away) converted all 40 pages and
retired the class. The filename still carries no version: it was `panel-card-21.6.0.md`
until 21.6.0 shipped without it, and renaming it now buys nothing, since the line above says where
the work landed.

**Two of iteration 1's answers came out differently from the sketch below.** Read _Iteration 1, as
resolved_ before treating any code block further down as the API.

Two surface components: a **card** (a small, self-contained block — a product tile, a summary, a
list item that has grown up) and a **panel** (a large region — a settings section, a dashboard
area, a form group with a heading).

Written 2026-08-20, after 21.5.0 closed. Built 2026-08-23.

## The question this plan exists to answer

> "Принимает стили библиотеки, но имеет какие-то свои встроенные вещи — правда, не могу придумать
> какие, кроме темизации."

That doubt is the right instinct, and it decides the whole design: **a surface that only paints a
background is a class, not a component.** The proof is in this repo. `ui-showcase` hand-rolls
`.card` and uses it across 37 templates, and the definition is five declarations:

```scss
.card {
  padding: 20px;
  border: 1px solid var(--gog-border-color);
  background: color-mix(in srgb, var(--gog-surface-color) 92%, transparent);
  box-shadow: var(--gog-panel-shadow);
}
```

A component that ships exactly this earns nothing: it costs an import, a selector, a change
detection cycle and two more token families, and gives back a `<div class="card">`. The library
already has a place for five declarations — `styles/utilities.css`.

**So the components have to own something a class cannot.** Everything below is chosen against
that bar. Where an item does not clear it, it says so.

## What a class cannot do

1. **Name the region for a screen reader.** A card with a heading should say so:
   `role="region"` (or a real `<section>`) with `aria-labelledby` pointing at the projected
   header's id. Nobody writes that by hand — the showcase's own `.card` does not — and it is
   generated id plumbing, which is exactly what a component is for. This is the strongest single
   reason either component should exist.
2. **Make an interactive card safe.** A clickable card is one of the most common accessibility
   defects on the web: `<div (click)>` with no tab stop, no `role`, no Enter/Space. 21.5.0 fixed
   this exact bug in `gogCollapsibleTrigger`; shipping a card that invites consumers to
   re-create it would be worse than not shipping one. `interactive` must mean a real button or
   link, with focus ring, keyboard activation and `aria-pressed`/`aria-current` where relevant.
3. **Fold in states the library already has.** `loading` → `gog-skeleton` for a first paint,
   `gog-spinner [overlay]` for a refresh; `disabled` → the shared opacity token plus
   `aria-disabled`. Each is three lines of wiring a consumer repeats per card, and the spinner
   case carries the `position: fixed` containing-block trap the backlog documents, which a
   component can get right once.
4. **Give the two sizes one vocabulary.** `padding`/density that lines up with `GogSize`, so a
   card inside a panel does not need hand-tuned spacing.

## What does _not_ justify a component, and stays out

- **Theming alone.** Background, radius, border, shadow — that is `--gog-*` tokens and a class.
- **A panel/card distinction by size.** "Panel is big, card is small" is one input (`size`), not
  two components. They are two components only if their _behaviour_ diverges — see the decision
  below.
- **A slot for everything.** `header`/`footer`/`media` earn their place; `subtitle`, `actions`,
  `badge` and the rest are the consumer's markup inside the body.

## The decision to take first: one component or two

**Recommendation: two, but only if the panel gets behaviour the card does not.** The split that
holds up:

|             | `gog-card`                                            | `gog-panel`                                                       |
| ----------- | ----------------------------------------------------- | ----------------------------------------------------------------- |
| Role        | a self-contained item, often in a grid                | a titled region of a page                                         |
| Header      | optional, decorative or a heading                     | a real heading, with the region named by it                       |
| Interactive | **yes** — the whole surface can be a button or a link | no; controls live inside it                                       |
| Collapsible | no                                                    | **yes** — via the existing `gog-collapsible`, not a new mechanism |
| Footer      | rare                                                  | common (actions, summary)                                         |

If the panel does not get collapsing and the card does not get the interactive surface, the honest
answer is **one component with a `size` input**, and this plan should be cut down to that before
any code is written.

## Iterations

| #   | Iteration                                 | Kind    | State                           |
| --- | ----------------------------------------- | ------- | ------------------------------- |
| 1   | Decide one-or-two, and write the API down | api     | ✅ done — two, see below        |
| 2   | `gog-card`                                | feature | ✅ done (21.6.1)                |
| 3   | `gog-panel`                               | feature | ✅ done (21.6.1)                |
| 4   | The showcase's own `.card` goes away      | fix     | ✅ done — 2026-08-26, all 40    |

### Iteration 1, as resolved

**Two components.** Both halves of the plan's own test came true: the card got the interactive
surface, the panel got collapsing. They diverged in a third way the sketch did not anticipate —
`role="region"` for the panel, `role="group"` for the card — which is the strongest of the three
arguments for keeping them apart. A grid of twenty cards would otherwise put twenty landmarks in a
screen reader's landmark list, which is worse than none.

**`interactive` / `interactiveAs` / `href` do not exist. `gogCardLink` does.** The sketch had
`<gog-card [interactive]="true" (gogClick)>` render a `<button>` or an `<a>` of its own, inferring
which from `href`. That went once the open question — _copy whatever `gog-button`'s link flavour
did_ — was actually answered: what it did was **not render the element at all**. It made
`[gogButton]` a directive on the consumer's own `<a>`, precisely so the router's input surface did
not have to be brokered through a component. The same answer applies here, and three things fall
out of it that the component-rendered version could not have had:

1. **A card can hold other controls.** A `<button>` may not contain a button or a link, so the
   sketch's interactive card and its own footer actions were mutually exclusive — in a component
   whose footer slot exists for actions.
2. **`routerLink` keeps working**, along with `target`, `download`, middle-click and "open in new
   tab", because the element was never taken away.
3. **The accessible name is the link's text**, not the card's entire contents.

The cost is the stretched-hit-area pattern's two inherent ones, documented in `AGENTS.md`: text in
the card cannot be drag-selected, and a second link is keyboard-reachable but not clickable
through the surface around it. Both are smaller than any of the three above.

**The `--gog-panel-*` collision resolved by adoption, not by renaming.** The four foundation
tokens (`--gog-panel-radius`, `-shadow`, `-border-width`, `-border-style`) stay exactly where they
are, and the component reads them as its own surface chrome. The alternative — renaming the tier
to `--gog-surface-*` and keeping the old names alive in a fallback — is a real deprecation cycle
(35 reads across the library plus ~20 in `theme.css`) bought for a distinction nobody asked for: a
panel _is_ the surface that tier describes. It also points the same way as `themes.md`, whose
whole argument is that radius, border and shadow should be foundation character rather than
per-component literals. Rule E never fired, because `panel` is already a foundation namespace.

The one wart it leaves: the elevated variant has no separate instance-tier token for its shadow,
because `--gog-panel-shadow` is taken. It does not need one — the variant class declares
`--gog-panel-variant-shadow` _on the host_, so a `var()` inside it resolves against that element,
and setting `--gog-panel-shadow` on a single panel already changes only that panel. Written into
`theme.css`'s Panel block, because it is not guessable.

**Header as a slot, and the toggle beside it rather than around it.** A `<button>` may not contain
an `<h2>`, and `role="button"` on the heading deletes it from the heading list — so the collapse
toggle is its own button, named by the heading through `aria-labelledby`, with its hit area
stretched across the header row. The pointer still gets "click the title"; the screen reader gets
a heading _and_ a named expandable button. `gogCollapsibleTrigger`'s div-with-`role="button"` path
would have been simpler, and is what Material does; it was rejected for exactly the heading it
eats.

**Three variants, shared.** `GogSurfaceVariant` = `outlined | elevated | filled`, one type for
both components so the two agree on what each word means. `elevated` reads the shared
`--gog-panel-shadow`, which in the dark theme already carries a 1px ring — so it needs no border
of its own there, and reads intentionally flatter in light.

### Iteration 4, as it finished

**Done 2026-08-26.** All 40 pages converted, one commit each, plus a final commit retiring `.card`
itself. `grep` for a `card` class token in `ui-showcase` now returns nothing.

**Finding 1 held up over all 40 pages, and that is the verdict this iteration existed for.** The
swap stayed exactly as mechanical as the pilot said: `<article class="card">` → `<gog-panel
size="md">`, `gogPanelHeader` on the heading, two imports on the page class. Not once was a wrapper
`<div>` needed, and `::ng-deep` was never reached for — the tripwire the recipe set for "the API is
wrong" never fired. Nine of the last twelve pages were converted by a three-line
string-replace script and needed no hand-editing at all, which is about as strong a statement as
"the API is pleasant" can get.

Findings 2 and 3 also held: the hero never converted (44 of them, see below), and the light-theme
flattening was visible, expected, and not worth chasing.

**Two things the plan did not anticipate, both worth keeping:**

- **The original count was wrong, and the way it was wrong is instructive.** It used
  `grep -c 'class="card"'` — an exact string match — so every block whose `class` attribute put
  `card` next to a page-local name was invisible to it: `class="card dash__filters"`,
  `class="catalog__header card"`. Two whole pages (`catalog-page`, `onboarding-page`) were missing
  from the checklist, and the table said 39 rows when it was 40. **Count class _tokens_, split on
  whitespace, not attribute substrings.**
- **The last block was not a panel at all.** `benchmark-index-page`'s tiles were
  `<a class="card bench-index-card" routerLink>` — the whole tile _is_ a link, and a `gog-panel`
  is never a link by design. It became a `gog-card` with a `gogCardLink`, which is precisely the
  shape iteration 1 argued that pairing into existence. That the one block in 250 that resisted
  `gog-panel` turned out to be the exact case `gog-card` was built for is the best evidence the
  two-component split of iteration 1 was the right call.

`.card` itself is gone from `_detail.scss`, renamed to `.detail__hero`, and the four full-page
examples now carry `detail__hero` next to their own layout class (`.dash__header` and friends) so
all 44 heroes are spelled one way.

`docs/showcase-card-to-panel.md` is the record of how it was done — the corrected counts, the
nine-step recipe, the page order, and the Part 5 write-up of the `gog-card` finding above.

### Iteration 1 — the API, on paper, before any file

Sketch to argue with, not to implement as-is:

```html
<gog-card variant="outlined" size="md">
  <h3 gogCardHeader>Ada Lovelace</h3>
  <img gogCardMedia src="…" alt="" />
  Body markup, projected as-is.
  <div gogCardFooter>…</div>
</gog-card>

<!-- interactive: renders a real <button>/<a>, not a div with a click handler -->
<gog-card [interactive]="true" (gogClick)="open(row)">…</gog-card>
<gog-card interactiveAs="link" href="/docs/ada">…</gog-card>

<gog-panel size="lg" [collapsible]="true" [(open)]="isOpen">
  <h2 gogPanelHeader>Notifications</h2>
  …
  <div gogPanelFooter>…</div>
</gog-panel>
```

Open questions for this iteration, each of which changes the shape:

- **`interactiveAs`, or infer it?** A card that navigates must render `<a>`; one that acts must
  render `<button>`. Inferring from the presence of `href` is fewer inputs and one less thing to
  get wrong — `gog-button`'s link flavour already made this choice, so copy whatever it did.
- **Does `gog-panel` reuse `gog-collapsible` or re-implement?** It must reuse: the primitive exists
  and 21.5.0 just made its trigger accessible.
- **Header as a slot or an input?** `api-design.instructions.md` puts markup on the slot axis, so a
  slot — but then the _heading level_ is the consumer's, which is right, and the component reads
  the projected element's id (generating one when absent) for `aria-labelledby`.
- **How many variants?** `outlined` / `elevated` / `filled` is the usual set. Each is a token
  family; see the note on themes below before adding a third.

### Iteration 2 — `gog-card`

1. Structure: `:host` is the surface; `gogCardHeader`/`gogCardMedia`/`gogCardFooter` slots.
2. `aria-labelledby` wiring from the header slot, with a generated id (`nextGogControlId`).
3. Interactive mode renders a real focusable element, with `:focus-visible` from the shared focus
   tokens. Keyboard comes from the element, not from a handler — the `gogCollapsibleTrigger` fix
   is the cautionary tale.
4. `loading` → skeleton; `disabled` → `aria-disabled` and the shared opacity token.
5. Tokens `--gog-card-*`, spelled out per `check-tokens.mjs`'s rule E.

**Done when:** a grid of interactive cards is fully keyboard-operable, a card with a header is
announced by that header, and the showcase has both.

### Iteration 3 — `gog-panel`

1. Header slot with the same `aria-labelledby` wiring, plus `footer`.
2. `collapsible` composes `gog-collapsible` rather than repeating it.
3. Tokens `--gog-panel-*` — **note the collision**: `--gog-panel-radius` and `--gog-panel-shadow`
   already exist as _foundation_ tokens (the shared overlay-surface tier that dropdown panels and
   dialogs read). Either the component takes a different family name, or those foundation tokens
   move — decide in iteration 1, because rule E will not let both live under one prefix by
   accident.

**Done when:** a settings page in the showcase is built from panels, and a collapsible panel is
the existing primitive underneath.

### Iteration 4 — the showcase stops hand-rolling it

`ui-showcase`'s `.card` is used in 37 templates. Replacing it is the honest test of whether these
components are pleasant: if the demo pages get shorter and nothing about them gets harder, the
API is right. If a page needs `::ng-deep` or a wrapper div to get its old look back, the API is
wrong and iteration 1 was too optimistic.

## Why 21.6.0 and not 21.5.0

> Written before the work, and kept because its second argument is what decided the token design
> above. They landed in 21.6.1 rather than 21.6.0 — that release went out first, carrying seven
> fixes and nothing new.

Both components are additive, so they _could_ have gone in 21.5.0. Two reasons they did not:

1. **21.5.0 was scoped as "one version to read before upgrading, one migration list."** New
   components break nothing but dilute exactly the property the version was assembled for.
2. **`themes.md` is about the 510 literal component-token declarations** that force every
   theme to name tokens per component. Two new surfaces would add two more families to that count
   today; after the character layer lands they inherit a theme's radius, border, shadow and
   density for free. Shipping them into the _current_ token model means writing them twice.

That second point is also the argument against waiting until after 21.7.0: the character layer
needs real components to prove it, and a card is the clearest case of "radius, border, shadow,
density" in the library. 21.6.0 — after the ripple, before the themes — is the slot where they
cost the least and teach the most.

## Backlog, deliberately out of scope

- **`gog-empty-state`.** Sits inside a card or panel and is a separate component; the plan for it
  is the same argument as this one and should be written separately.
- **Drag-to-reorder panels, resizable panels.** A layout system, not a surface.
- **`gog-card` as a list item with selection.** That is `gog-table`'s or a future list's job; a
  card with a checkbox is markup the consumer projects.
