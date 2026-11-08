# Input masking — `[gogMask]` and `gog-inputfield`'s `mask`

Target: **21.20.0**, by the owner's decision on 2026-11-07, which lifted the 2026-09-13 deferral
("with the next batch of new components"). This is the plan `docs/feedback-triage.md` item 3 asked
for before any code: phone numbers, barcodes and similar fixed-shape values, formatted as they are
typed.

## Decisions taken before code (owner, 2026-11-07)

1. **A directive and an input, one implementation.** `input[gogMask]` works on any native
   `<input>` — the consumer's own, or one inside someone else's component — and
   `gog-inputfield` gains a `mask` input that runs the same logic on its own `<input>`. The same
   argument made `[gogButton]` a directive: a mask is a value transform, not a control, so it must
   not need the library's field to exist.
2. **The form gets the raw value by default**, with an opt-in for the formatted one:
   `maskValue: 'raw' | 'formatted'`, default `'raw'`. Raw is what validation and a backend want
   (`0501234567`, not `+38 (050) 123-45-67`).

## Why a shared controller and not "the directive inside the field"

`gog-inputfield` is a `ControlValueAccessor` that registers itself through `NgControl` (so it can
read the control's errors without a provider cycle). A `[gogMask]` placed on its inner `<input>`
would be a second accessor with no form to talk to. So the work splits in three:

- **the engine** — pure functions over strings, no DOM: `pattern + typed text → display + raw +
caret`. Testable in isolation and usable on the server (`formatMask()` for a table cell);
- **`GogMaskController`** — attaches the engine to one `HTMLInputElement`: the `input`,
  `keydown` (Backspace/Delete across a literal), `compositionstart/end` and caret handling.
  Knows nothing about forms;
- **two hosts** — `GogMaskDirective` (a `ControlValueAccessor` + `Validator`, selector
  `input[gogMask]`; Angular prefers a custom accessor over `DefaultValueAccessor`, so `ngModel`
  and `formControl` on the same `<input>` just work), and `gog-inputfield`, which feeds the
  controller's raw/formatted value into its existing `_onChange`.

The code lives in a new entry point, **`@guildofgleks/ui/mask`**, re-exported by the root like
every other (`docs/component-entry-points.md`). `inputfield` imports from it.

## The pattern language

| Char          | Accepts                    |
| ------------- | -------------------------- |
| `0`           | a digit                    |
| `a`           | a letter (Unicode `\p{L}`) |
| `*`           | a letter or a digit        |
| `\x`          | the literal `x`            |
| anything else | itself, a literal          |

`maskTokens` adds or overrides slots: `{ H: /[0-9a-f]/i }` makes `H` a hex digit. **An array of
patterns** is a variable-length mask — the first pattern with room for what was typed is used,
so `['0000 0000 0000 0000', '0000 0000 0000 0000 000']` covers 16- and 19-digit cards, and a
value is complete when it fills any of them exactly.

Behaviour, stated so the specs can be written from it:

- **Literals are inserted as the user types**, and typing a literal at its position is accepted
  rather than rejected. A literal is shown only once a slot after it is filled — `+38 (050`, not
  `+38 (050) ` — except a **leading** run of literals, which appears with the first character.
- **A character a slot rejects is dropped**, and the caret does not move.
- **Paste** is just a longer `input`: everything is re-run through the engine.
- **Backspace with a literal before the caret** deletes the slot character before that literal;
  Delete does the mirror. Without this, Backspace would delete the literal and the engine would
  put it straight back — the caret would be stuck.
- **The caret** stays after the same number of slot characters it was after before formatting.
- **IME composition** is never interrupted: nothing is reformatted between `compositionstart`
  and `compositionend`.
- **A value written in by a form** is read the way `maskValue` says: raw in raw mode, so the `38`
  of a raw `3812…` fills slots rather than matching the `+38` literal; formatted in formatted
  mode. `gog-inputfield`'s `value` model is always the text as shown, so a `[value]` bound
  without a form is read as typed. (The first draft said "raw or formatted, either normalised" —
  the engine cannot tell `38` the literal from `38` the digits, so the mode has to say.)
- **Incomplete is an error, empty is not**: a non-empty value that fills no pattern gives
  `{ gogMask: { actual, required } }` (slot counts) — `Validators.required` is the empty check.
  The partial value is still emitted, so a form sees what is there.
- **`inputmode`**: when every slot of every pattern is `0` and the consumer set none, the
  keyboard is `numeric`.

## Not in this version

- **Visible slot placeholders** (`+38 (___) ___-__-__`). The native `placeholder` can show an
  example; drawing the empty slots means a lazy/eager display mode and a caret that skips them —
  a second iteration if anyone asks.
- **Numeric formatting** (thousands separators, currency, decimals). That is `Intl.NumberFormat`
  on blur, a different feature from a fixed-shape mask; not a pattern.
- **Native undo** across a reformat is the browser's, and a programmatic value change resets it.
  Every mask library has this; recorded, not solved.
- **`type="number"` or `type="password"`.** A number input exposes no selection range, so no
  caret; a masked password is a contradiction. Both are a dev-mode warning and no mask.

## Iterations

| #   | What                                                                                                     | Status        |
| --- | -------------------------------------------------------------------------------------------------------- | ------------- |
| 1   | The engine (`mask/mask-engine.ts`): parse, format, raw, caret, completeness, `formatMask()`; specs       | ✅ 2026-11-07 |
| 2   | `GogMaskController` + `input[gogMask]` (accessor, validator, keys, IME, `inputmode`); the entry point    | ✅ 2026-11-07 |
| 3   | `gog-inputfield`: `mask`, `maskTokens`, `maskValue`, the `gogMask` error on its control; specs           | ✅ 2026-11-07 |
| 4   | Showcase (a Mask page, the Inputfield page's section), AGENTS, CHANGELOG, lab checklist, `check:install` | ✅ 2026-11-08 |

A new entry point triggers `check:install`, and its `SMOKE` table needs the page — iteration 4.

## Iteration 4, as it finished (2026-11-08)

- **Showcase**: a Mask page (`/mask`, Form controls) — a pattern × raw-value matrix written in
  through `ngModel`, the pattern language, raw vs `'formatted'` on a `formControl`, a variable-length
  card on `(gogMaskChange)`, `formatMask()`, and `inputmode` read from the DOM. The Inputfield page
  gained a Mask section and its three API rows; the specimen a masked phone field and two native
  code inputs. Driven in Chrome against the SSR build: typing, Backspace over a literal, `setValue`
  in both modes, the `gogMask` error, the numeric keyboard hint — and a clean console.
- **A lint error from iteration 2 surfaced here**: the directive's `tokens`/`maskValue` were
  aliased to `gogMaskTokens`/`gogMaskValue` (`no-input-rename`). The properties carry the public
  names now; nothing a template writes changed.
- **`check:install`** (compared with the published 21.19.0): passed. `/mask` has its own `SMOKE`
  page — `formatMask()` in the prerendered HTML, then `[gogMask]` and the field's `mask` typed into
  after hydration. Its **first run failed** with `[not-lazy]`: the page's chunk was 673 bytes. The
  code was not in the initial bundle — it sat in a 7.5 kB chunk the bundler split out because the
  generated `/subpaths` page reaches the same code through `inputfield`. The check had measured
  the page's own chunk only; it now adds the lazy chunks that chunk imports (initial chunks are
  never counted). Second run: initial 111.56 kB, `/mask` 9 760 bytes lazy, every page hydrated.
- **Not done**: the AGENTS.md version marker was already at 21.20.0, so it did not move.
