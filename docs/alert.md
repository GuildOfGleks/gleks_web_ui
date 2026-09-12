# `gog-alert` — a persistent, in-flow message

Target: the next minor after 21.13.0. The filename carries no version on purpose; a plan named
for a release is a plan that becomes a lie when the release ships without it.

`docs/backlog.md`'s Gaps section opens with this one, and gives the reason in a parenthesis:
_"`alert`/`banner` (a persistent in-flow message — `gog-toast` is transient and cannot serve
this)"_. That is the need. What follows is the argument that it should be a component at all, then
what it is.

---

## The question this plan exists to answer

`docs/panel-card.md`'s rule, which `docs/backlog.md` repeats for every unbuilt component: **what
does it own that a `<div>` and a class do not?** An `empty state` that cannot answer it is not
ready, and neither is this. Four answers, and the first two are the load-bearing ones.

### 1. The live-region role, which is a decision and not a look

`role="alert"` is implicitly `aria-live="assertive"`: it interrupts whatever a screen reader is
saying. `role="status"` is `polite` — it waits. No role at all is right for a message that was
always on the page.

The three are not interchangeable, and the choice does not follow from severity alone. It follows
from **why the message appeared**. A validation summary that lands on submit has earned an
interruption. The same red box, rendered on page load because the record is already invalid, has
not: it makes every visit begin with an interruption about something the reader has not asked
about yet. A class cannot hold that distinction. A component can take it as an input, default it
sensibly, and state the trap in one place instead of in every consuming app.

### 2. A live region has to exist before the content it announces

This library has already paid for this once. `toast.component.ts` carries the note:

> Deliberately carries no `role`/`aria-live` of its own. A live region has to be in the DOM
> _before_ the content it announces lands inside it; this element is created together with its own
> text, which screen readers routinely skip.

`gog-toast-container` solved it with two permanently-mounted regions. An in-flow alert has the
same problem and cannot solve it the same way, because the consumer writes
`@if (error()) { <gog-alert>…</gog-alert> }` and the element and its text arrive in one insertion.

**This is the thing a class provably cannot do**, and it is why this is a component. The alert
renders its region on creation and fills the message into it after the first render, so what a
screen reader sees is a mutation inside a region that already existed. A `<div class="alert">`
written by hand announces nothing, reliably, and nobody notices, because it looks right.

### 3. Dismissal is a focus problem, not a `display: none`

An alert that removes itself when its own close button is pressed destroys the focused element.
Focus falls to `<body>` and a keyboard reader loses their place. The component owns where focus
goes, which a class has no way to express.

### 4. The severity → icon → colour mapping, shared

`GogSeverity` already exists and already drives `gog-button`, `gog-progressbar` and `gogBadge`.
An alert that reuses it matches the rest of the app for free; a hand-rolled one drifts the first
time a theme changes. This is a weak argument on its own — it is the reason the component is
_cheap_, not the reason it should exist.

---

## What it is

```html
<gog-alert severity="danger" heading="Payment failed" [dismissible]="true" (dismissed)="retry()">
  The card issuer declined the charge. No money has left your account.
</gog-alert>
```

| Input         | Type                               | Default     | Notes                                                                    |
| ------------- | ---------------------------------- | ----------- | ------------------------------------------------------------------------ |
| `severity`    | `GogSeverity`                      | `'accent'`  | Shared union. `'accent'` is the library's own colour and claims nothing. |
| `heading`     | `string \| undefined`              | `undefined` | Optional title above the projected body.                                 |
| `dismissible` | `boolean`                          | `false`     | Renders the close button and enables `dismissed`.                        |
| `iconName`    | `GogIconName \| null \| undefined` | `undefined` | Derived from severity when unset; `null` suppresses the icon entirely.   |
| `live`        | `'assertive' \| 'polite' \| 'off'` | _see below_ | The decision from §1, stated rather than guessed.                        |
| `ariaLabel`   | `string \| undefined`              | `undefined` | Names the region when there is no `heading`.                             |

Output: `dismissed` (void).

**Two rows of that table changed on contact with the code, and both are worth the correction.**
`severity` defaults to `'accent'`, not `'info'`: `GogSeverity`'s own documentation says `'accent'`
is "the absence of a claim — the library's own colour, and the default everywhere this appears",
and an alert that defaulted to `info` would be claiming something about every message nobody
classified.

**And `variant` is gone.** It was going to be `GogSurfaceVariant`, defaulting to `'filled'` — but
`filled` in this library means _a tint_, and there is no per-status tint to draw it with:
`--gog-accent-pale` exists and `--gog-success-pale` does not. Inventing the family here is exactly
what the closing section of this plan forbids, so iteration 1 ships one look — the severity as a
leading edge and the icon over the ordinary surface, which is the shape `gog-toast` already
reached for the same reason. A tint family is a colour decision with its own measurement; if it is
ever wanted, it is its own entry and not a footnote to this one.

**`live`'s default is the one judgement call in the API.** Deriving it from `severity` — `danger`
and `warning` assertive, the rest polite — is the _less_ wrong default, since an unannounced error
is worse than an over-announced one. But it is wrong for the commonest case of all: a message
present at first paint. Iteration 2 decides whether the component can detect that case itself (it
knows whether it was created during the app's first render) or whether it stays the consumer's
call with a loud note. **Do not settle that from the armchair: measure what `afterNextRender` can
actually tell the component about its own mounting.**

## What it is not

- **Not a toast.** No timer, no queue, no overlay, no service. It renders where it is written. If
  both exist in an app they should look related, and the severity family is what does that.
- **Not a dialog.** It never traps focus and never blocks.
- **Not `gog-panel` with a colour.** A panel is a surface; this is a message with semantics.

---

## Iterations

| #   | What                                                                                                     | Status        |
| --- | -------------------------------------------------------------------------------------------------------- | ------------- |
| 1   | The component: severity, heading, projected body, icon, dismissible, tokens, specs, showcase page        | ✅ 2026-09-12 |
| 2   | The live-region decision from §1/§2, measured rather than assumed, plus the focus rule from §3           | ✅ 2026-09-12 |
| 3   | `AGENTS.md`, `README.md` inventory, `docs/lab-after-publish.md`; the component count moves from 31 to 32 | ✅ 2026-09-12 — folded into 1 and 2, since the library's own rule puts `AGENTS.md` in the same change as the API |

Iteration 1 deliberately ships the _look_ before the semantics, which is the opposite of the order
`docs/backlog.md` used for the selectable chip ("the look and the semantics landed together …
forwarding `aria-pressed` alone would have let a chip announce itself as on while looking
identical to an off one"). Why inverting it is safe here: a chip with no ring is a **wrong** state
shown to a sighted reader, while an alert with no live region is a message that is merely not
announced early — the visible half is complete and correct on its own, and the announcement is
additive. If iteration 2 slips, what shipped is still honest.

## Geometry, colour and the gates

Nothing here is exempt from the checks, and three of them will have opinions:

- **`check:contrast`** will measure the label against the fill for all five severities across
  eleven themes, and the boundary sweep will want `.gog-alert` in `CONTROL_BOUNDARIES` only if the
  border is what identifies it — for a `filled` banner it is not, the fill is. Decide that rather
  than adding the entry reflexively.
- **`check:geometry`** wants padding on the 4px grid at a ratio of exactly 2.0, a concentric
  radius for anything nested (the close button), and 24×24 of pointer target on that button.
- **`check:typography`** wants the heading and the body on the leading scale by role, not by size.

The severity colours exist already. **Do not introduce `--gog-alert-<severity>-bg` as new
literals** — read the status fills the library already ships, the way `gogBadge` and
`gog-progressbar` do, or the alert becomes the twelfth place a theme has to restate its red.
