# `gog-empty-state` — what a region says when it has nothing to show

Target: the in-progress 21.18.0, beside `gog-breadcrumbs`, `gog-stepper`, `gog-file-upload` and
`gog-rating` — a minor can carry several components. The filename carries no version on purpose.

`docs/backlog.md`'s Gaps section lists `empty state` last, with a condition attached: it is the
same argument as the card's, and an empty state that cannot say what it owns over a `<div>` and a
class is not ready. `docs/panel-card.md` deferred it for that reason. It is additive.

---

## The question this plan exists to answer

**What does it own that a `<div>` with an icon, a line of text and a class does not?** Two answers
that a class provably cannot hold, and one that is only a convenience.

### 1. An empty state is usually an _answer_, and a screen reader never hears it

The empty states that matter most are not the ones a page loads with. They are results: a search
that matched nothing, a filter that excluded everything, the last item deleted. On screen the list
is replaced by "No results for 'invoice 2024'" and the reader knows at once. A screen reader says
nothing at all — the list it was reading simply stopped existing.

This is `gog-alert`'s problem again (`docs/alert.md` §2): a consumer writes
`@if (results().length === 0) { … }`, the element and its text arrive in one insertion, and a live
region created together with its own text is routinely skipped. A `<div role="status">` written by
hand announces nothing, reliably, and looks right. The component does what the alert does: a
visually hidden polite region, empty on the first render, takes a copy of the message one render
later, and that mutation inside an existing region is what gets announced.

### 2. It stays mounted while the question changes

Here an empty state differs from an alert. Type "invoice 2024" and get nothing; type one more
character and still get nothing. The empty state was never removed, so nothing is inserted, and
even a region that worked the first time is silent the second — while the visible text has
changed to say the new query. The component watches its own message and copies every change into
the region, so each new answer is said. What is copied is the heading and the description, never
the actions: "Clear filters" is a button to find, not a sentence to hear.

`live="off"` is for the empty state a page _loads_ with — "You have no projects yet" on a fresh
account — where the reader is reading the page anyway. It is not the default, for the alert's
reason: an unannounced result costs more than one polite announcement too many, and `polite` waits
for the reader rather than interrupting. There is no `assertive`; nothing being empty justifies an
interruption.

### 3. The heading, at a level the app chooses — and the layout

An empty state's title belongs in the page's outline exactly when the empty state _is_ the page's
content, and at the level the surrounding headings set. The component cannot know that level and
guessing it is worse than not having one, so `headingLevel` defaults to `null` — the title is
styled text — and a number makes it a real `<h2>`…`<h6>`. Beyond that it is layout: an icon, the
title, a description at a readable measure, an actions row, centred, at five sizes. That part is
convenience, the reason the component is cheap rather than the reason it exists.

---

## What it is

```html
@if (results().length === 0) {
<gog-empty-state iconName="search" heading="No results" [headingLevel]="2">
  Nothing matches "{{ query() }}". Try fewer words.
  <div gogEmptyStateActions>
    <button gogButton variant="secondary" (click)="clearFilters()">Clear filters</button>
  </div>
</gog-empty-state>
}
```

| Input          | Type                            | Default    | Notes                                           |
| -------------- | ------------------------------- | ---------- | ----------------------------------------------- |
| `heading`      | `string`                        | `''`       | The title.                                      |
| `headingLevel` | `2 \| 3 \| 4 \| 5 \| 6 \| null` | `null`     | A real heading only when set.                   |
| `iconName`     | `GogIconName \| null`           | `null`     | Drawn above the title, decorative.              |
| `live`         | `'polite' \| 'off'`             | `'polite'` | `'off'` for an empty state the page loads with. |
| `size`         | `GogSize`                       | `'md'`     |                                                 |

Slots: the default slot is the description; `[gogEmptyStateMedia]` replaces the icon with an
illustration; `[gogEmptyStateActions]` holds the buttons.

## What it is not

- **Not a loading state.** Empty means the answer is known and is nothing; while it is not known,
  that is `gog-skeleton` or a spinner. Rendering an empty state before the data arrives tells the
  reader something false.
- **Not an error.** A request that failed is `gog-alert`; "nothing matched" is not a failure.
- **Not a focus manager.** When the last item disappears by its own delete button, focus is the
  app's to place — on the empty state's action, usually — because only the app knows the action is
  the next thing to do.
- **Not wired into `gog-table` yet.** The table's own empty row is plain text from `emptyMessage`
  and is not announced either; a template slot that takes a `gog-empty-state` is a separate,
  additive change to the table's API, filed in `docs/backlog.md` rather than smuggled in here.

---

## Iterations

| #   | What                                                                                                                                       | Status        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------- |
| 1   | `gog-empty-state`: announced on arrival and on every change, heading level, icon/media/actions slots, sizes, tokens, specs, showcase, docs | ✅ 2026-10-04 |

## Geometry, colour and the gates

- **It is a surface** (law 3's exemption: it frames content, it does not balance a label). It
  draws no border or fill of its own — it sits inside a card, a panel or a table that already does.
- **The description holds a measure** in `ch`, so a wide container does not set it in one long line.
- **`check:contrast`**: the title and the description at 4.5:1 on the page and a surface; the icon
  is decorative and muted, and held to 3:1 anyway because it is the largest mark in the block.

## Iteration 1, as it finished

Built as planned. Three things worth keeping.

- **The answer the plan had to find was the second one, not the first.** Copying the text into a
  region one render late is `gog-alert`'s mechanism, reused. What an empty state adds is that it
  _stays_: a search box narrows "zz" to "zzz" and the same element keeps showing "Nothing matches
  …" with a different query. The region is fed by a `MutationObserver` on the message, so each
  change is a new mutation in a region that already exists. Measured in Chrome by typing into the
  showcase's search: the region held `No invoices found Nothing matches "zz".`, then the `"zzz"`
  line, and never the "Clear search" button.
- **Each slot directive has to earn its place on the specimen**, which is what made the specimen
  use both: the orders tab renders an empty state in place of the table when the filters exclude
  everything, and "Clear filters" brings the table back; the Disputes card is one the page loads
  with, `live="off"`, and its region stays empty.
- **The table's own empty row has the same problem** and is filed in `docs/backlog.md`, not fixed
  here — a template slot is new table API, and this plan's scope was the component.

`check:contrast` measures the title, the description and the icon on the page and a surface in
all eleven themes. The illustration in `gogEmptyStateMedia` takes the icon's muted colour through
`currentColor`; a picture is unaffected.
