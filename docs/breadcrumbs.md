# `gog-breadcrumbs` — where this page sits, as a trail of links

Target: the next minor after 21.17.0. The filename carries no version on purpose; a plan named for
a release is a plan that becomes a lie when the release ships without it.

`docs/backlog.md`'s Gaps section lists the missing components "in rough order of how often a real
site wants them"; with `avatar` shipped in 21.17.0, `breadcrumbs` leads what is left. It is purely
additive, so under the semantic-versioning rule 21.16.0 adopted it is a minor.

---

## The question this plan exists to answer

**What does it own that a `<nav>`, an `<ol>` and a class do not?** (`docs/panel-card.md`'s rule.)
A breadcrumb trail is short markup, and that is exactly why it is so often wrong: every part of the
correct version is invisible, so nothing on screen says when one is missing. Three answers.

### 1. The semantics nobody sees

The correct trail is a `<nav>` landmark with a name, an ordered list, `aria-current="page"` on the
last item, and separators a screen reader does not read. The commonest hand-written version puts a
`/` or a `›` between the links as text, and a screen reader then says "Home, slash, Docs, slash,
Avatar". Each of the four is one attribute or one element, none of them shows, and a class can
carry none of them. The component owns all four, and the separator is drawn with `aria-hidden`
rather than written as text.

### 2. Collapsing a long trail

A deep page's trail does not fit a phone. The component collapses the middle into a `…` button
past `maxItems`, keeping the first item and the last few, and the button expands the trail in
place. That is behaviour with a focus rule attached: **after expanding, focus moves to the first
item the button revealed**, because the button itself is gone — leaving focus on a removed element
drops a keyboard reader back to `<body>`, the failure `gog-alert`'s close button was designed
around.

### 3. A direction-aware separator

The separator points from a parent to its child, so under `dir="rtl"` it points left. A chevron
glyph in markup does not turn; the component mirrors it, the same way `gog-calendar`'s navigation
arrows mirror.

---

## What it is

The library has no `@angular/router` dependency, on purpose (`button.directive.ts` has the
argument), so the items are **your own elements** — a link with `routerLink` or `href`, and for the
current page whatever you like — marked with a structural directive that hands the component a
template:

```html
<gog-breadcrumbs>
  <a *gogBreadcrumb routerLink="/">Home</a>
  <a *gogBreadcrumb routerLink="/components">Components</a>
  <span *gogBreadcrumb>Avatar</span>
</gog-breadcrumbs>
```

Taking a template rather than the element itself is what makes §1 and §2 possible: the component
stamps each item inside its own `<li>`, so the list is a real list, and it can leave items out
while collapsed. Every directive and attribute on your element keeps working, because it is still
your element.

| Input           | Type                  | Default              | Notes                                                             |
| --------------- | --------------------- | -------------------- | ----------------------------------------------------------------- |
| `maxItems`      | `number \| null`      | `null`               | Past this many, collapse the middle. Unset, never collapse.       |
| `itemsBefore`   | `number`              | `1`                  | Items kept before the `…` when collapsed.                         |
| `itemsAfter`    | `number`              | `2`                  | Items kept after it — the current page and its parent by default. |
| `separatorIcon` | `GogIconName`         | `'chevron-right'`    | Mirrored under `dir="rtl"`.                                       |
| `size`          | `GogSize`             | `'md'`               | The text step.                                                    |
| `ariaLabel`     | `string \| undefined` | `labels.breadcrumbs` | The landmark's name; "Breadcrumb" by default.                     |

Labels through `GOG_CONFIG.labels`: `breadcrumbs` (the landmark) and `showBreadcrumbs` (the `…`
button's name, "Show full path").

**The last item is the current page**: it gets `aria-current="page"`, set by the component on the
element your template renders. A trail whose last item is not the current page — a parent shown as
context — is not a breadcrumb, and is out of scope.

## What it is not

- **Not a menu.** The `…` expands in place; it does not open a dropdown of the hidden items. A
  dropdown would be a second interaction pattern on a component whose job is to be read at a
  glance, and `gog-menu` is there for an app that wants one.
- **Not router-aware.** It does not build itself from the route tree. Which pages are parents of
  which is the app's knowledge; a trail generated from URL segments is a common source of trails
  that link to pages that do not exist.
- **Not a tab bar or a stepper.** Neither of those is a path.

---

## Iterations

| #   | What                                                                                                                                                                                                      | Status        |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| 1   | `gog-breadcrumbs` + `*gogBreadcrumb`: landmark, list, `aria-current`, hidden separators, RTL, sizes, collapsing with the focus rule, tokens, specs, showcase page, `AGENTS.md`/`README.md`/`CHANGELOG.md` | ✅ 2026-10-04 |

One iteration: the collapse is what makes the component worth having over the markup, so it does
not ship later than the rest.

## Geometry, colour and the gates

- **The links are your elements**, rendered from your templates, so the component's scoped
  stylesheet cannot reach them — their rules live in `utilities.css`, like `gog-avatar-group`'s.
- **Law 5, the 24x24 target.** A breadcrumb link is a pointer target that is not inside a
  sentence, so WCAG 2.5.8's inline exemption does not cover it; a link whose line box is under 24px
  grows its hit area with a transparent `::before`, not its paint. Measured with a mouse at every
  size, as the slider's thumbs were.
- **`check:contrast`**: the link colour and the current page's colour against the page, at 4.5:1;
  the separator is decorative and exempt, but its colour is still a token.
- **Gap** between an item and the separator is a spacing step, not a literal (law 1).

## Iteration 1, as it finished

Built as planned, with two things worth recording.

- **The specimen page's own check did not know the structural form.** `ui-showcase`'s
  "every component at least twice" spec counted `gogX` and `[gogX]` but not `*gogX`, so the
  breadcrumb directive read as unused on a page that used it four times. The counter accepts the
  star now; `*gogBreadcrumb` is the first structural directive in the library, so nothing had
  exercised that path before.
- **The current page needs no target of its own.** It is a `<span>` (or whatever the app writes)
  with `aria-current="page"`, not a link — linking the page to itself is the commonest breadcrumb
  bug after the written separator — so only the parents get the `::before` hit area.

Measured in Chrome: the landmark reads `navigation "Breadcrumb"` › `list` › six `listitem`s, five
links and the current page, with no separator anywhere in the accessibility tree; a link at `xsm`
paints 15.6px tall and takes the pointer from 12px above its centre to 11px below, 24px; the `…`
pressed from the keyboard leaves focus on the first revealed link ("Sales"); the separator under
`dir="rtl"` computes to `matrix(-1, 0, 0, 1, 0, 0)`. `check:contrast` measures the link, the current
page and the `…` hover in all eleven themes (55 pairs, all passing).
