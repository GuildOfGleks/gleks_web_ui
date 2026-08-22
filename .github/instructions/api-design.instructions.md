---
description: 'How to grow the @guildofgleks/ui public API without turning it into PrimeNG'
applyTo: 'projects/gleks/ui/**'
---

# @guildofgleks/ui — API Design & Extension Pressure

`gleks-ui-library.instructions.md` covers *how* to write a component. This file covers the
decision that comes before that: **when a request arrives, which extension mechanism should
absorb it.** Getting this wrong is not a style problem — it is how a component library ends
up with a hundred inputs per component that nobody can discover, which is the specific
outcome this library exists to avoid.

Read this before adding any input, any `TemplateRef`, or any new component.

Whatever you decide here also has to land in **`projects/gleks/ui/AGENTS.md`** — the API
reference that ships in the package — in the same change. It is a big file of per-component
input tables, which makes it the easiest thing in the repo to leave stale, and a stale table
does not fail a build: it just makes the next agent write code against API that isn't there.
See `gleks-ui-library.instructions.md`, definition of done, step 9.

## The four axes, in priority order

When something isn't customizable enough, walk this list **top to bottom** and stop at the
first axis that can carry it. Reaching for a plain input first is the default mistake.

### 1. A theme token — for anything visual

If the value only ever ends up in CSS, it is a token (`--gog-<block>-*` in `theme.css`), not
an input. See `styling.instructions.md`. A consumer gets it app-wide *and* per instance for
free, with zero API surface. An input that only feeds a `[style.x]` binding is a token that
was implemented in the wrong place.

### 2. A slot — for "I need different markup here"

Anything shaped like *content* — a custom header, a chevron, an option row, a trailing
action — is a slot, never a set of inputs.

**Use one mechanism: a content directive read with `contentChild()`.**

```ts
@Directive({ selector: '[gogAccordionHeader]' })
export class GogAccordionHeaderDirective {
  readonly templateRef = inject<TemplateRef<GogAccordionHeaderContext>>(TemplateRef);
}
```

```html
<gog-accordion [items]="items">
  <ng-template gogAccordionHeader let-item let-open="open">…</ng-template>
</gog-accordion>
```

This is the pattern `gog-accordion` uses and the one to copy. Two older mechanisms exist and
are **deprecated for new code** — do not add more of either:

- `input<TemplateRef>(...)` (`iconEndTemplate`, `checkIconTemplate`, …). Forces the consumer
  to declare `<ng-template #x>` *and* wire `[fooTemplate]="x"` by hand, gives the template no
  typed context, and costs one input per slot — which is precisely how a component reaches 26
  inputs.
- String-keyed lookup (`gog-table`'s `TemplateDirective` with `type="body" template="name"`).
  The strings are invisible to the compiler; a typo is a silently missing template.

Always give the directive a **typed context interface** (`GogAccordionHeaderContext`) so
`let-` variables are checked.

### 3. A headless primitive — for "your markup doesn't fit at all"

`gog-collapsible` owns no markup: it is open/close state plus `gogCollapsibleTrigger` /
`gogCollapsibleContent` directives. When a consumer needs a structure the component can't
anticipate, the answer is to expose the *behaviour* this way rather than to keep adding
inputs to the opinionated version.

Behaviour cores already factored out and reusable for this: `GogDropdownBase`,
`roving-focus.ts`, `dropdown-position.ts`, `tooltip-position.ts`, `error-state.ts`.

### 4. An input — everything else

Only once 1–3 are ruled out. An input is right for a scalar that changes *behaviour*
(`debounce`, `pageSize`, `sortable`) or a small closed enum (`variant`, `size`).

## Hard limits on inputs

- **Never add a parallel family of inputs.** If you are writing `fooTemplate` next to `foo`,
  or `iconStartLabel` next to `iconStart`, stop — that is axis 2 wearing a disguise. The
  existing `gog-inputfield` icon API (`iconStart`, `iconStartTemplate`, `iconStartFn`,
  `iconStartLabel`, ×2 for `end`) is the anti-pattern, kept only for back-compat. Do not
  extend it and do not copy its shape.
- **A component crossing ~15 inputs is a design smell.** Not a hard error, but it means
  re-reading this file before adding the next one.
- **Every input needs a default that makes the component work unconfigured.** Zero-config is
  a standing promise of this library.
- **Don't add an input for something a parent can already express.** Class/style forwarding,
  for instance, already works through the host element in Angular — no `styleClass` input.

## Wrapping a native control: forward its attribute space

A component that hides a native `<input>`, `<textarea>`, `<button>` or `<a>` inside its own
template owns that element's entire API surface, because the consumer can no longer reach it.
There is no escape hatch: an attribute the wrapper doesn't forward is simply unavailable.

**The default is to forward the native attribute space of the wrapped element.** Anything left
out is a deliberate, documented omission, not an oversight to be discovered by a consumer who
needs `maxlength` and finds nothing. This is the one place where "add an input" is the right
answer without walking the four axes first — these are not new API surface, they are the
element's own, and a developer already knows their names and semantics.

In practice, for a text control that means at least: `readonly`, `maxlength`, `minlength`,
`pattern`, `inputmode`, `spellcheck` and the `type` values that render as a text field (see
`GogInputType`).

`autofocus` is the worked example of a deliberate omission: it is deliberately **not**
forwarded, because moving focus without the user asking is disorienting for screen-reader and
keyboard users — the same reason `@angular-eslint/template/no-autofocus` is on in this repo and
would reject it anyway. An app that genuinely needs it can focus the element itself.

Two rules that come with it:

- **Model the interactions.** `readonly` and `disabled` both refuse edits, so both must
  suppress every affordance that offers one — the clear button, a number field's spin buttons.
  `GogClearableState`'s `isNotEditable` parameter exists for exactly this.
- **Keep the native name.** `readonly`, not `isReadOnly`; `maxlength`, not `maxLength`. The
  input's discoverability comes from already knowing the platform. (`inputMode` is the one
  exception, matching the DOM property's own casing.)

## User-visible strings: chrome goes in `GOG_CONFIG.labels`, content does not

Every fixed string a component renders that the consumer never writes markup for — button text,
an accessible name for a close/clear/step control — belongs in `GOG_CONFIG.labels`, not in one
input per string. The test is the one the config section already uses: *would an app set this
once, or per instance?* "Clear", "Close dialog", "Previous page" are set once, by an app that
isn't in English; twenty inputs to say so is exactly the boilerplate this library exists to
remove.

Three rules that come with it:

- **A per-instance input may exist as well, and wins.** `clearAriaLabel`, `todayLabel` and
  friends resolve instance → config → default through `resolveConfigured`, like every other
  configurable input. Add one only when a single instance realistically differs.
- **Content is not chrome.** `gog-checkbox`'s `ariaLabel`, `gog-button`'s `ariaLabel`, a field's
  `label` or `placeholder` describe *that* control and have no meaningful app-wide value. They
  stay per-instance and out of `labels`.
- **A string that interpolates takes a function, not a placeholder.** `GOG_CONFIG.labels.page`
  is `(page, isCurrent) => string` rather than `'Go to page {0}'`. A `{0}` convention is a
  second, weaker formatting language to learn, and it cannot express languages where the
  number's position or the grammar agreeing with it depends on its value. Keep such fields rare
  and document them where they sit.

Never leave a rendered string unreachable. A hardcoded `aria-label` or button caption in a
template is a bug for every consumer who does not ship in English, and it is invisible until
one of them files it.

## Data-shape inputs: never hardcode a DTO

A component that accepts a collection must not dictate the object shape its consumer stores.
`GogDropdownOption { id, name }` is the library's cautionary example: every consuming app has
its own DTO and is forced to map into `{id, name}` before each dropdown, losing both its types
and the original object on the way back out.

For any new collection-driven component, take a **generic item type plus accessors**:

```ts
readonly options = input<T[]>([]);
readonly optionLabel = input<string | ((option: T) => string)>('name');
readonly optionValue = input<string | ((option: T) => unknown) | null>(null);
```

with a shared resolver helper, so a consumer can pass their own objects untouched.

## Deduplication: the rule of three

The library already carries the right tool for this — `GogErrorState` is a plain class,
constructed with signals and composed into components that share a base class *and* ones that
can't (`error-state.ts:16-21` explains why it is not a base class or a directive). Use that
pattern.

**Before writing the third copy of anything, extract it.** Concretely:

- Repeated **TypeScript state** (a cluster of `computed()`s appearing in more than two
  components) → a composition class in `lib/shared/`, like `GogErrorState`.
- Repeated **SCSS** that differs only by the BEM block prefix → a mixin in
  `lib/styles/_mixins.scss`, parameterized by block name. Four near-identical copies of the
  float-label rules is what motivated this rule; they diverge silently, because nothing fails
  when only three of four get a fix.
- Repeated **config resolution** (`this.x() ?? this.globalConfig.a?.x ?? DEFAULT_X`) → the
  shared resolver helper in `lib/shared/config.ts`.

When you fix a bug in one copy of duplicated code, you own fixing it in all copies — or
extracting it. Never fix one and leave the rest.

## Global config

The full procedure is in `gleks-ui-library.instructions.md`'s "Global configuration". Two
rules that belong here:

- **`GogGlobalConfig` merges down the injector tree.** A nested `provideGogConfig(...)` layers
  onto whatever the parent injector already provides; it must not silently drop sibling keys.
  Preserve this when touching `config.ts`.
- **A setting that an app would realistically write on every instance belongs in the config**
  (`errorDisplay`, `size`, `appendToBody`) — that repetition *is* the boilerplate this library
  is supposed to remove. This does not override the CSS-token rule: if the value only reaches
  CSS, it is still a token, not a config field.

## Loading states

A `loading` input has one required part and one choice.

**Required: `aria-busy="true"` on the host while loading.** Not optional, and not something the
consumer should have to add. A loading component usually replaces its content with skeletons or a
spinner, and those are `aria-hidden` — so without `aria-busy` the component is not "loading" to a
screen reader, it is *empty*. `gog-button` and `gog-spinner-overlay` have always done this;
`gog-accordion` gained it in 21.6.0.

**The choice is between two treatments, and it follows from what the component is:**

- **A component that owns a region** — accordion, table, list — shows **placeholders shaped like
  the content that is coming**: one per row, matching the real row's silhouette including its
  chrome. The point is that nothing moves when the data lands. If a real row has a chevron, the
  placeholder has one; if titles vary in length, the placeholder widths vary too (cycled by
  index, never random — random breaks hydration and makes snapshots unstable).
- **A control** — button, field, dropdown — shows an **inline spinner in its own chrome** and
  keeps its box. There is no shape to preview; the useful signal is "this control is working".

Whichever it is, the loading state must be non-interactive: `pointer-events: none` or a real
`disabled`, and anything focusable taken out of the tab order.

**Known violations, deliberately not fixed yet:** `gog-table` and `gog-autocomplete` set no
`aria-busy`. Recorded in `docs/hardening-21.5.0.md`.

## Consistency is itself a feature

A developer who has learned one component must be able to guess the next one. Before shipping,
check the new API against its neighbours:

- same concept → same input name (`fullWidth`, `size`, `disabled`, `errorMessage`,
  `errorDisplay`, `appendToBody`);
- same slot concept → same directive-suffix convention;
- selector is `gog-*`, **including sub-elements** — `<column>` is an unprefixed legacy
  selector, not a precedent to follow;
- block token prefix spelled out, not abbreviated (`--gog-multiselect-*`, not `--gog-ms-*`).

## Breaking changes & the deprecation lifecycle

Pre-1.0, breaking changes are allowed in minor versions (`CHANGELOG.md` says so) — but the
library is public, so nothing disappears without notice, **and nothing stays deprecated
forever**. Accumulated deprecated code is its own kind of debt: it doubles the API surface a
newcomer has to read and quietly becomes load-bearing if it is never removed.

### The rule

1. **Deprecate, don't delete.** When replacing a public symbol, input, selector or slot, keep
   the old one working and mark it `@deprecated`.
2. **Carry it for one or two minors, then delete it.** Removal happens on schedule, not "when
   someone gets round to it". Two minors is the maximum, not the default — use one unless the
   migration is genuinely awkward for consumers.
3. **Every `@deprecated` tag records when it started and when it goes.** Without a date the
   ratchet stops working and deprecations pile up invisibly.

### The tag format — use this exactly

```ts
/**
 * @deprecated since 21.3.0 (2026-08-07) — use `gog-column` instead. Removed in 21.5.0.
 */
```

Four required parts, in this order: the version it was deprecated in, the **date** in
`(YYYY-MM-DD)`, the replacement, and the version that removes it. Same format for a deprecated
selector, input, type alias or exported function.

The format is fixed so the whole set is greppable in one command — that is the point of the
date:

```bash
grep -rn "@deprecated since" projects/gleks/ui/src
```

Before cutting a release, run it and delete everything whose "Removed in" version is at or
below the version being cut. If a removal has to slip, edit the tag to say so rather than
letting it drift silently.

### Also required

- List every deprecation under a `### Deprecated` heading in `CHANGELOG.md`, and every actual
  removal under `### Removed`, each with a one-line migration note.
- Prefer making the *new* shape the default and the old one opt-in, over a hard swap.
- A deprecated symbol keeps working exactly as before. Do not "soften" it, change its behaviour,
  or make it warn at runtime — a deprecation is a documentation event, not a behaviour change.
