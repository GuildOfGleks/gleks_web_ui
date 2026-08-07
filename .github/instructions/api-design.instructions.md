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

## Consistency is itself a feature

A developer who has learned one component must be able to guess the next one. Before shipping,
check the new API against its neighbours:

- same concept → same input name (`fullWidth`, `size`, `disabled`, `errorMessage`,
  `errorDisplay`, `appendToBody`);
- same slot concept → same directive-suffix convention;
- selector is `gog-*`, **including sub-elements** — `<column>` is an unprefixed legacy
  selector, not a precedent to follow;
- block token prefix spelled out, not abbreviated (`--gog-multiselect-*`, not `--gog-ms-*`).

## Breaking changes

Pre-1.0, breaking changes are allowed in minor versions (`CHANGELOG.md` says so) — but the
library is now public, so:

- keep a **deprecated alias** for at least one minor whenever it is mechanical to do so
  (`export type GogSelectOption = GogDropdownOption` is the model), marked `@deprecated` with
  the replacement named in the message;
- list every break under `### Changed` in `CHANGELOG.md` with a one-line migration note;
- prefer making the *new* shape the default and the old one opt-in, over a hard swap.
