# `gog-stepper` — where a reader is in a multi-step task

Target: the next minor after 21.18.0. The filename carries no version on purpose; a plan named for
a release is a plan that becomes a lie when the release ships without it.

`docs/backlog.md`'s Gaps section lists the missing components "in rough order of how often a real
site wants them"; with `avatar` and `breadcrumbs` built, `stepper` leads what is left. It is purely
additive, so under the semantic-versioning rule it is a minor.

---

## The question this plan exists to answer

**What does it own that an `<ol>` of numbered circles and a class do not?** Three answers.

### 1. State a screen reader can hear

A stepper's whole message is visual: a filled circle is done, a ring is current, a red one failed,
a grey one is not reachable yet. A hand-built one shows all four and announces none — a screen
reader hears "1, Account, 2, Address, 3, Payment". The component says it: `aria-current="step"` on
the current step, and the state of every other step as visually hidden text after its label
("Account, completed"; "Payment, has an error"), from `GOG_CONFIG.labels` so it translates.

### 2. Which steps can be reached

In a linear flow a reader may go back to any step and forward only as far as the steps before are
complete. That rule decides which steps are buttons and which are not, and getting it wrong in
markup either traps a reader or lets them skip a required step. The component derives it from the
steps' states (`linear`, on by default) and renders an unreachable step as plain text — not as a
disabled button, which a keyboard reader would still have to tab past.

### 3. One look across orientations and sizes

The indicator, its connectors and its label have to line up horizontally and vertically, at five
sizes, in RTL, and the connector between two complete steps reads as done. That is geometry a
class repeated in every app gets slightly wrong in each.

---

## What it is — an indicator, not a wizard

**The stepper shows the steps and moves between them; the app renders each step's content.** It
does not own panels, forms or a "Next" button:

```html
<gog-stepper [steps]="steps" [(activeIndex)]="step" />

@switch (step()) { @case (0) { <app-account-form (done)="complete(0)" /> } @case (1) {
<app-address-form (done)="complete(1)" /> } @case (2) { <app-payment-form /> } }
```

Whether a step may be left — a form is valid, a request succeeded — is the app's knowledge, and a
stepper that owned the panels would have to ask for it through an input per step or depend on
`@angular/forms` in a way no other component here does. The app marks a step complete in its data;
the stepper reacts.

```ts
interface GogStep {
  label: string;
  description?: string;
  /** Unset: not started. */
  state?: 'complete' | 'error';
  /** Never reachable from the stepper, whatever `linear` says. */
  disabled?: boolean;
  /** Shows "Optional" under the label; a linear stepper does not wait for it. */
  optional?: boolean;
}
```

| Input / model | Type                  | Default        | Notes                                                                                                    |
| ------------- | --------------------- | -------------- | -------------------------------------------------------------------------------------------------------- |
| `steps`       | `readonly GogStep[]`  | `[]`           |                                                                                                          |
| `activeIndex` | `model<number>`       | `0`            | Two-way; a press on a reachable step sets it.                                                            |
| `linear`      | `boolean`             | `true`         | Forward only as far as the steps before are complete or optional.                                        |
| `orientation` | `GogOrientation`      | `'horizontal'` | Vertical stacks the steps with the connector between them; it is also the answer for a narrow container. |
| `size`        | `GogSize`             | `'md'`         |                                                                                                          |
| `ariaLabel`   | `string \| undefined` | `'Progress'`   | Names the list; `GOG_CONFIG.labels.stepper`.                                                             |

The indicator draws the step's number, a check when complete and the error glyph on error.

## What it is not

- **Not a tab bar.** Tabs switch between peers in any order; steps are a sequence with a direction.
- **Not a progress bar.** `gog-progressbar` says how much; a stepper says which, and lets a reader
  go back.
- **Not a form wizard** (above). An app that wants the full wizard composes this with its forms.

---

## Iterations

| #   | What                                                                                                                                                           | Status        |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| 1   | `gog-stepper`: states announced, reachability, both orientations, sizes, RTL, connectors, tokens, specs, showcase page, `AGENTS.md`/`README.md`/`CHANGELOG.md` | ✅ 2026-10-04 |

## Geometry, colour and the gates

- **The indicator** is a circle per size step; its number and glyph are drawn at a ratio of it,
  the rule `gog-avatar` follows.
- **The connector** runs between indicators and is decorative; its done colour is the accent, its
  pending colour the border.
- **Law 5**: a reachable step is a button whose box — indicator and label — is well over 24x24.
- **`check:contrast`**: the label colours (current, done, pending) on the page and the number on
  the indicator's fill, at 4.5:1; the indicator's ring against the page at 3:1, since it is what
  marks the current step for a reader who cannot tell the colours apart.

## Iteration 1, as it finished

Built as planned. One thing the showcase found that the plan did not foresee:

- **A horizontal row has a minimum width, and that is a decision, not a bug.** The first build let a
  step shrink with `min-width: 0` and broke labels anywhere, so six steps in 44rem drew "Acc / oun
  / t". Labels now wrap only at their spaces and a step is never narrower than its longest word;
  the connectors give way first. Past that the row overflows its container, and the answer is
  `orientation="vertical"`, which fits any width — the showcase's narrow example shows it, and
  `AGENTS.md` says so rather than letting a consumer discover it.

Measured in Chrome: the list reads `list "Progress"` › `button "Account Done, completed"`,
`button "Card Declined, has an error"`, and the current step as text with `aria-current="step"`;
walking the showcase flow, two "complete" presses turn the first two steps into buttons and leave
the two ahead as text; no stepper on the page overflows. `check:contrast` measures labels, numbers,
the complete and error marks and the pending ring in all eleven themes, all passing.
