# `gog-panel` and `gog-card`

**Not started. Target: 21.7.0 or later — unscheduled.** The filename carries no version on
purpose: this was `panel-card-21.6.0.md` until 21.6.0 shipped without it, which is what a version
in a *future* plan's name always ends up meaning. Completed plans keep theirs, because there it is
a fact rather than a guess.

Two surface components: a **card** (a small, self-contained block — a product tile, a summary, a
list item that has grown up) and a **panel** (a large region — a settings section, a dashboard
area, a form group with a heading).

Written 2026-08-20, after 21.5.0 closed. Nothing started.

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

| #   | Iteration                                 | Kind    | State   |
| --- | ----------------------------------------- | ------- | ------- |
| 1   | Decide one-or-two, and write the API down | api     | ⬜ todo |
| 2   | `gog-card`                                | feature | ⬜ todo |
| 3   | `gog-panel`                               | feature | ⬜ todo |
| 4   | The showcase's own `.card` goes away      | fix     | ⬜ todo |

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
