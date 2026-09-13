// The token reference the Theming page renders, and the per-component Styling Tokens table every
// doc page slices out of it by section id.
//
// **Hand-maintained, and deliberately not the package's full token list.** `TOKENS.md` and
// `GOG_TOKEN_GROUPS` are exhaustive — 1383 custom properties, most of them one per size step —
// and reprinting that is a search result, not a reference. The rows here compress a family into
// one line (`{variant}`, `{status}`, "per size step") and say what it is *for*. The cost of that
// choice is that a release adding tokens does not show up here on its own: check a new release's
// changelog against the section it touches. 21.9.0's press, toggled and severity tokens were
// added this way.

import type { GogAccordionItem } from '@guildofgleks/ui';

export interface TokenRow {
  readonly name: string;
  readonly description: string;
}

export interface TokenSection extends GogAccordionItem {
  readonly tokens: readonly TokenRow[];
}

export const TOKEN_SECTIONS: TokenSection[] = [
  {
    id: 'foundation-palette',
    title: 'Foundation — Palette',
    tokens: [
      { name: '--gog-background-color', description: 'Page / app background.' },
      { name: '--gog-surface-color', description: 'Card, panel and control surface background.' },
      { name: '--gog-hover-color', description: 'Hover background for interactive surfaces.' },
      {
        name: '--gog-border-color',
        description:
          'The decorative hairline — dividers, table rules, panel outlines — and deliberately faint. It is not the edge of a control; that is the token below.',
      },
      {
        name: '--gog-control-boundary-color',
        description:
          'The edge that identifies a control, and the one WCAG SC 1.4.11 measures: it has to clear 3:1 against whatever the control sits on. Split off from --gog-border-color in 21.12.0, because one token cannot be both — a theme that sets only the decorative one either shouts its dividers or hides its controls, and three of this package’s own presets were doing the second, at 1.18 to 2.17:1. gog-chip, gog-toggle and gog-button-toggle read it. Set both, and check the boundary rather than eyeballing it: npm run suggest:color in the repo computes a value that clears a target ratio while holding your theme’s own hue and chroma.',
      },
      { name: '--gog-text-color', description: 'Primary text color.' },
      { name: '--gog-muted-text-color', description: 'Secondary / placeholder text color.' },
      {
        name: '--gog-accent-text-color',
        description: 'Text color placed on top of an accent-colored background.',
      },
      { name: '--gog-primary-color', description: 'Primary brand color.' },
      {
        name: '--gog-accent-color',
        description: 'Accent / brand color used for interactive elements.',
      },
      { name: '--gog-accent-bright', description: 'Brighter accent, used for hover states.' },
      { name: '--gog-accent-dim', description: 'Dimmed accent, used for borders and strokes.' },
      { name: '--gog-accent-pale', description: 'Pale accent tint, used for subtle backgrounds.' },
      { name: '--gog-secondary-color', description: 'Secondary brand color.' },
      { name: '--gog-success-color', description: 'Semantic success color.' },
      { name: '--gog-danger-color', description: 'Semantic danger / error color.' },
      { name: '--gog-warning-color', description: 'Semantic warning color.' },
      { name: '--gog-info-color', description: 'Semantic info color.' },
      {
        name: '--gog-success-text-color / --gog-danger-text-color / --gog-warning-text-color / --gog-info-text-color',
        description:
          'The label a status fill carries, the way --gog-accent-text-color is the accent’s. Each defaults to the accent’s answer, so state one only where your own hue disagrees — and check it, because getting this wrong is silent: white on a bright amber measured 1.97:1 in one of this package’s own presets before these existed.',
      },
      {
        name: '--gog-success-shade / --gog-danger-shade / --gog-warning-shade / --gog-info-shade',
        description:
          'Which way a status fill deepens when hovered or held: away from its own label, so the state always makes the label easier to read rather than harder. Defaults to the page’s ink, which is right when the label is white — set it to the opposite when the label is the ink itself.',
      },
      {
        name: '--gog-panel-shadow / --gog-dialog-shadow / --gog-toast-shadow',
        description:
          'The surfaces that lift, and still the names you override for one of them. Since 21.12.0 their value is a step off the elevation ladder rather than a hand-written shadow — panel 3, toast 4, dialog 5 — so turning one knob in the Elevation family moves all of them together and keeps the order between them. The gog-panel component reads the first.',
      },
    ],
  },
  {
    id: 'foundation-typography',
    title: 'Foundation — Typography',
    tokens: [
      { name: '--gog-font-heading', description: 'Font stack used for headings and titles.' },
      { name: '--gog-font-body', description: 'Font stack used for body text.' },
      { name: '--gog-font-mono', description: 'Monospace font stack (code, numeric values).' },
      { name: '--gog-text-xs … --gog-text-3xl', description: 'Type scale, from 0.75rem to 3rem.' },
      {
        name: '--gog-text-2xs',
        description:
          '0.6875rem (11px), one step below xs and the bottom of the scale. It exists because the smallest chip and the smallest tag were already painting 11px as a literal — the step was being used before it had a name.',
      },
      {
        name: '--gog-text-slg',
        description:
          '20px, between lg and xl — named for the control size it serves rather than continuing the t-shirt run, because that is what asked for it. gog-button and the field controls both needed a step for their slg size and, having none, both wrote 1.25rem as a literal.',
      },
    ],
  },
  {
    // The short path to a custom look (docs/themes.md iteration 1 & 6): most component
    // tokens read one of these instead of declaring their own literal, so a theme is
    // expected to set these — not the dozens of component tokens derived from them.
    id: 'foundation-character-layer',
    title: 'Foundation — Character Layer',
    tokens: [
      { name: '--gog-radius', description: 'Base corner radius used across most components.' },
      {
        name: '--gog-panel-radius',
        description:
          'Corner radius for larger panels, derived from --gog-radius — and the gog-panel component’s own, which reads the same token.',
      },
      {
        name: '--gog-border-width / --gog-border-style',
        description:
          'Border weight for small inline elements — chip, tag, table row — the tier below panel and control.',
      },
      {
        name: '--gog-panel-border-width / --gog-panel-border-style',
        description:
          'Border width and style for elevated panels — and for the gog-panel component, which reads the same pair.',
      },
      {
        name: '--gog-control-border-width / -style',
        description:
          'Border weight for form controls (buttons, fields) — the thickest of the three tiers.',
      },
      {
        name: '--gog-text-transform',
        description:
          'Emphasis casing shared by buttons, section headers, table headers and field labels.',
      },
      {
        name: '--gog-letter-spacing',
        description: 'Emphasis tracking, paired with --gog-text-transform.',
      },
      {
        name: '--gog-font-weight-medium / -semibold / -bold / -heavy',
        description:
          'Weight, the third character axis. Four steps because four are painted — there is no normal, since nothing in the library uses 400. Set these and every component weight follows; before them, fifteen component tokens each held a bare number.',
      },
      {
        name: '--gog-line-height-none / -tight / -snug / -normal / -relaxed / -loose',
        description:
          'Leading, the fourth. Six steps because six values are painted. gog-panel’s heading keeps its own 1.25, off this scale on purpose the way an 11px chip is off the type scale.',
      },
      {
        name: '--gog-density',
        description:
          'Single multiplier every component padding and gap derives from — set once for a tighter or roomier library, never a component padding directly.',
      },
    ],
  },
  {
    id: 'foundation-spacing',
    title: 'Foundation — Spacing',
    tokens: [
      {
        name: '--gog-space-4 … --gog-space-48',
        description:
          'The ten-step scale every padding and gap in the library is built from — 4, 8, 12, 16, 20, 24, 28, 32, 40, 48, every one of them a multiple of 4. Each step is calc(Npx * var(--gog-density)), so the whole scale moves together when density changes. It was fourteen steps until 21.11.0; the five odd ones (2, 6, 10, 14, 18) are gone, and a stylesheet still naming one should take the neighbouring step, rounding up, which is the direction the library itself took.',
      },
      {
        name: '--gog-space-xs … --gog-space-2xl',
        description:
          'Five named aliases onto that scale — 4, 8, 16, 24 and 48px at density 1. Convenience names, not a second scale: they derive from the numeric steps above, so overriding one with a literal takes it out of density.',
      },
    ],
  },
  {
    id: 'foundation-motion-focus',
    title: 'Foundation — Motion & Focus',
    tokens: [
      {
        name: '--gog-duration-fast / -base / -slow',
        description: 'Transition durations used by every animated component.',
      },
      { name: '--gog-easing', description: 'Default transition easing function.' },
      {
        name: '--gog-focus-ring-width / --gog-focus-ring-offset',
        description: 'Keyboard focus ring size and offset.',
      },
      { name: '--gog-disabled-opacity', description: 'Opacity applied to disabled controls.' },
      {
        name: '--gog-{block}-press-bg',
        description:
          'The pressed background, on each of the nine pressable surfaces (button, menu item, ' +
          'chip, tab and accordion header, button-toggle option and the three dropdowns’ option ' +
          'rows). Listed here as well because they share a rule: a press is a colour and not ' +
          'only a movement, so it is the half that survives prefers-reduced-motion. The ripple ' +
          'is the deliberate exception — it is suppressed there, being decoration rather than ' +
          'state.',
      },
    ],
  },
  {
    // One token and five derivations, which is the whole point of it being here: an app that has
    // to sit the library above its own chrome edits the floor, not the five layers.
    id: 'foundation-stacking',
    title: 'Foundation — Stacking',
    tokens: [
      {
        name: '--gog-z-base',
        description:
          'The library’s stacking floor, and the only one of these you set. Every layer is base + N, so moving it lifts the whole library at once and keeps the internal order intact.',
      },
      {
        name: '--gog-badge-z / --gog-toast-base-z / --gog-dropdown-z / --gog-tooltip-z / --gog-spinner-overlay-z',
        description:
          'The five layers themselves — +1, +100, +300 (dropdowns, dialogs and menus), +400 and +8000 (the blocking overlay, which outranks even a dialog it covers). Derived, so overriding one takes it out of the base and should be a deliberate exception rather than the way you move the stack.',
      },
    ],
  },
  {
    // Ten knobs and six generated steps, and the ten are the part a theme writes. Listed as its
    // own section rather than folded into the character layer because it is a system with an
    // internal rule — Z doubles — and a reader who takes one token out of it gets a ladder that
    // no longer climbs evenly.
    id: 'foundation-elevation',
    title: 'Foundation — Elevation',
    tokens: [
      {
        name: '--gog-elevation-0 … --gog-elevation-5',
        description:
          'The ladder: six heights, generated from the knobs below, and every raised surface in the package reads one. Z doubles — 0, 1, 2, 4, 8, 16 — and the heights are assigned by what a thing is, not by how it looks: 0 flat, 1 a thumb riding on a control, 2 an elevated card or panel, 3 anything anchored to a control (the four dropdown panels, the menu, the tooltip), 4 a toast, 5 a modal dialog. You do not write a step; you turn the knobs and all six follow.',
      },
      {
        name: '--gog-elevation-ink / -key-alpha / -ambient-alpha',
        description:
          'The colour of the shadow, as an unwrapped RGB triple, and the two opacities it composites at. A step is two lights: the ambient contact shadow that hugs the object and the key light that moves with height. The default ambient is half the key, which is the ratio the light theme’s hand-written panel already held.',
      },
      {
        name: '--gog-elevation-key-x / -key-y / -key-blur',
        description:
          'The style axis, as three unitless multipliers per unit of Z. Soft is the default: x 0, y 1, blur 3. A hard-offset theme (bevel, ledger) sets x and y to a fraction and blur to 0; a glow theme (terminal) sets y to 0 and keeps blur, and the key light becomes a halo without the ladder knowing anything about halos. Blur is 3× Z rather than the 2× the general rule gives, because across the 26 shadow layers this library shipped before the ladder the median ratio was exactly 3.00.',
      },
      {
        name: '--gog-elevation-contact-blur',
        description:
          'The contact shadow’s blur, and the one length in the family that does not grow with height — that is what ambient occlusion does, and it is what this library already did every time it hand-wrote two layers.',
      },
      {
        name: '--gog-elevation-ring-width / -highlight-ink / -highlight-alpha',
        description:
          'The hairline ring and the top-edge catch light, deliberately outside the steps: they belong to particular surfaces rather than to height. A dark theme’s overlay wants the ring and its in-flow elevated card must not have it, or elevated and outlined render identically. Both are inert by default (0px, 0 alpha); a component that wants one composes it — box-shadow: var(--gog-elevation-ring), var(--gog-elevation-3).',
      },
      {
        name: '--gog-elevation-ring / -highlight / -contact',
        description:
          'The three composable layers themselves, derived from the knobs above so a component can prepend one to a step. Derived, so override the knobs rather than these.',
      },
    ],
  },
  {
    id: 'foundation-control-metrics',
    title: 'Foundation — Control Metrics',
    tokens: [
      {
        name: '--gog-control-padding-y / -x',
        description: 'Shared padding for form controls (buttons, fields).',
      },
      { name: '--gog-control-icon-offset', description: 'Icon inset shared by form controls.' },
      {
        name: '--gog-control-clear-icon-ratio',
        description:
          'The clear (×) button’s glyph as a fraction of its box, shared by the five single-line controls that draw one. gog-textarea keeps its own 1 deliberately: its clear button sits in a corner rather than in the field’s icon row.',
      },
      {
        name: '--gog-control-checkbox-{size}-box-size / -label-size / -icon-size',
        description: 'Checkbox box, label and icon size, per size step (xsm/sm/md/lg/slg).',
      },
      {
        name: '--gog-field-line-height / -label-line-height / -error-line-height',
        description:
          'Leading for the three things every field renders — its own text, its label and its error line — declared once here and aliased by all eight controls that draw them. The role is what sets the value, not the size: all five size steps of a field share one leading, which is why there is no per-size token to override.',
      },
      {
        name: '--gog-field-float-label-reserve / -in-top / -over-gap / -over-reserve',
        description:
          'Float-label geometry shared by every field. Each control’s own --gog-{control}-float-label-* tokens derive from these, so one declaration retunes them all while a single control can still be overridden.',
      },
    ],
  },
  {
    id: 'accordion',
    title: 'Accordion',
    tokens: [
      {
        name: '--gog-accordion-border-color / -width / -style',
        description: 'Header border.',
      },
      { name: '--gog-accordion-text-color / -accent-color', description: 'Text and accent color.' },
      {
        name: '--gog-accordion-hover-bg / -hover-ring',
        description: 'Header hover background and the ring the hover draws.',
      },
      {
        name: '--gog-accordion-focus-ring-color / -width',
        description:
          'The keyboard focus ring, and its own colour since 21.12.0. The header’s :focus-visible outline used to read --gog-accordion-hover-ring, so a hover-weight colour was doing focus duty and missed 3:1 in all eleven themes. Hover and focus are different signals and now carry different colours.',
      },
      {
        name: '--gog-accordion-press-bg',
        description: 'Header press background, one step past its own hover.',
      },
      {
        name: '--gog-accordion-radius / -body-radius',
        description: 'Corner radius for the header and body.',
      },
      {
        name: '--gog-accordion-header-bg / -body-bg',
        description: 'Header and body background.',
      },
      { name: '--gog-accordion-header-gap', description: 'Gap between chevron and title.' },
      {
        name: '--gog-accordion-transition-duration / -body-transition-duration / -chevron-transition-duration',
        description: 'Expand/collapse animation timing.',
      },
      {
        name: '--gog-accordion-{size}-padding-y / -x / -font-size / -chevron-size / -chevron-font-size',
        description:
          'Header padding and font size, per size step (xsm/sm/md/lg/slg). The chevron is a ratio of the header’s own type since 21.11.0 — 1.4em of box, 1em of glyph, one value at every size — so the three smallest sizes, which all label at --gog-text-xs, now carry identical chevrons. Making it a ratio also surfaced a glyph that had been overflowing its own box at every size.',
      },
    ],
  },
  {
    id: 'alert',
    title: 'Alert',
    tokens: [
      {
        name: '--gog-alert-bg / -color / -font-family',
        description:
          'Surface, body text colour and font stack. The ordinary surface and text pair, not a status tint — the library ships no per-status tint family, and the alert does not invent one.',
      },
      {
        name: '--gog-alert-border-color / -border-width / -border-style / -radius',
        description: 'The frame on three sides, and the corner radius.',
      },
      {
        name: '--gog-alert-edge-color / -edge-width',
        description:
          'The leading edge that carries the severity, and the icon colour. Written by the severity class, which outranks a plain class of yours — to repaint a severity, set its own colour token below instead.',
      },
      {
        name: '--gog-alert-accent-color / -success-color / -danger-color / -warning-color / -info-color',
        description:
          'What each severity points --gog-alert-edge-color at. Default to the foundation status colours, so a theme that sets those needs nothing here.',
      },
      {
        name: '--gog-alert-padding-y / -padding-x / -gap / -main-gap',
        description:
          'Inner padding, the gap between icon, text and close button, and the gap between heading and body.',
      },
      {
        name: '--gog-alert-icon-font-size / -icon-line-height',
        description: 'The glyph, and the box that holds it.',
      },
      {
        name: '--gog-alert-heading-color / -heading-font-size / -heading-font-weight / -heading-line-height',
        description: 'The optional heading.',
      },
      {
        name: '--gog-alert-body-font-size / -body-line-height',
        description: 'The projected body.',
      },
    ],
  },
  {
    id: 'autocomplete',
    title: 'Autocomplete',
    tokens: [
      { name: '--gog-autocomplete-label-color', description: 'Field label color.' },
      {
        name: '--gog-autocomplete-field-bg / -border-color / -text-color',
        description: 'Field surface, border and text.',
      },
      {
        name: '--gog-autocomplete-radius / -min-width',
        description: 'Field corner radius and the floor an auto-width field cannot collapse past.',
      },
      {
        name: '--gog-autocomplete-focus-ring-color / -focus-ring-width / -hover-border-color',
        description: 'Focus and hover states.',
      },
      {
        name: '--gog-autocomplete-panel-bg / -panel-border-color / -panel-shadow / -panel-max-height',
        description: 'Suggestion panel surface and height cap.',
      },
      {
        name: '--gog-autocomplete-option-hover-bg / -option-press-bg / -option-selected-bg',
        description: 'Suggestion row states.',
      },
      {
        name: '--gog-autocomplete-option-height / -panel-gap',
        description:
          'A seed for the first frame rather than the row height — the component measures a real row and corrects itself, which is also what places the panel above or below the field. And the gap between the field and its panel.',
      },
      {
        name: '--gog-autocomplete-empty-color / -spinner-size',
        description: 'The "nothing found" message and the loading spinner.',
      },
      {
        name: '--gog-autocomplete-clear-color / -clear-hover-color / -actions-inset',
        description: 'Clear button color and how far the trailing actions sit from the edge.',
      },
      {
        name: '--gog-autocomplete-float-label-reserve / -in-top / -over-gap / -over-reserve',
        description:
          'Float-label geometry, derived from the shared --gog-field-float-label-* scale.',
      },
    ],
  },
  {
    id: 'badge',
    title: 'Badge',
    tokens: [
      {
        name: '--gog-badge-success-bg / -danger-bg / -warning-bg / -info-bg (+ matching -color)',
        description: 'Fill and text color per semantic variant.',
      },
      {
        name: '--gog-badge-size / -dot-size / -padding-inline',
        description: 'Badge height, the bare-dot diameter, and horizontal padding around a count.',
      },
      {
        name: '--gog-badge-radius / -border-color / -border-width / -border-style',
        description: 'Corner radius and the ring separating the badge from its host.',
      },
      {
        name: '--gog-badge-font-family / -font-size / -font-weight / -line-height',
        description: 'Count typography.',
      },
      {
        name: '--gog-badge-offset / -z',
        description: 'How far the badge overhangs its host corner, and its stacking order.',
      },
    ],
  },
  {
    id: 'button',
    title: 'Button',
    tokens: [
      {
        name: '--gog-button-font-family / -font-weight / -letter-spacing / -text-transform',
        description: 'Label typography.',
      },
      { name: '--gog-button-radius', description: 'Corner radius.' },
      { name: '--gog-button-border-width / -style', description: 'Border.' },
      {
        name: '--gog-button-transition-duration',
        description: 'Hover / active transition timing.',
      },
      {
        name: '--gog-button-{variant}-bg / -color / -border / -shadow',
        description: 'Fill, text, border and shadow per variant (primary/secondary/outline/ghost).',
      },
      {
        name: '--gog-button-{variant}-hover-bg / -hover-color / -hover-shadow',
        description: 'Hover state per variant.',
      },
      {
        name: '--gog-button-{variant}-press-bg / -press-color',
        description:
          'Pressed state per variant. The press is a colour and not only the scale below, so it ' +
          'survives prefers-reduced-motion.',
      },
      {
        name: '--gog-button-focus-ring-color / -focus-ring-width / -focus-ring-offset',
        description:
          'The keyboard focus ring. Its colour is its own token since 21.13.0 and reads the accent; it used to follow each variant’s hover wash, which on ghost and the severity outline buttons made the ring invisible in four themes (1.07:1 at worst).',
      },
      {
        name: '--gog-button-active-scale',
        description:
          'How far a press shrinks the button. Dropped under prefers-reduced-motion, where the ' +
          'press colour carries the state on its own.',
      },
      {
        name: '--gog-button-{variant}-toggled-shadow / --gog-button-toggled-ring-width',
        description:
          'The inset ring a button with aria-pressed="true" (or "mixed") draws. A ring rather ' +
          'than a fill, because hover and press already own the background.',
      },
      {
        name: '--gog-button-{status}-fill / -fill-hover / -fill-press / -on-fill / -ink / -wash',
        description:
          'The severity palette, per status (danger/success/warning/info). fill and on-fill are ' +
          'a filled button and its label; ink is the label of a transparent one, the status hue ' +
          'mixed halfway toward the page ink; wash is the hover background under it.',
      },
      {
        name: '--gog-button-{variant}-spinner-color',
        description: 'The loading spinner, per variant.',
      },
      {
        name: '--gog-button-bg / -color / -border / -padding / -font-size / -press-bg / -press-color / -toggled-shadow',
        description:
          'Undeclared by default — the escape hatch for styling a single button instance.',
      },
    ],
  },
  {
    id: 'button-toggle',
    title: 'Button Toggle',
    tokens: [
      {
        name: '--gog-button-toggle-rest-bg / -rest-color',
        description: 'An unselected button.',
      },
      {
        name: '--gog-button-toggle-selected-bg / -selected-color / -selected-border-color',
        description: 'The selected button.',
      },
      {
        name: '--gog-button-toggle-hover-bg / -hover-color',
        description: 'Hover state.',
      },
      {
        name: '--gog-button-toggle-press-bg / -selected-press-bg',
        description:
          'Press state, with its own value for a button that is already selected — pressing one ' +
          'has to read as a press rather than as a deselection.',
      },
      {
        name: '--gog-button-toggle-border-color / -border-width / -border-style / -radius',
        description:
          'Group border and corner radius. The colour defaults to --gog-control-boundary-color since 21.12.0 — it read the decorative hairline before, which is why a segmented control now shows a visibly firmer edge in every theme.',
      },
      {
        name: '--gog-button-toggle-separated-gap',
        description: 'Gap between buttons in the "separated" appearance. "joined" shares borders.',
      },
      {
        name: '--gog-button-toggle-font-family / -font-weight / -letter-spacing / -text-transform / -icon-size',
        description: 'Button typography and icon size.',
      },
      {
        name: '--gog-button-toggle-focus-ring-color / -focus-ring-width / -focus-ring-offset',
        description: 'Keyboard focus ring.',
      },
    ],
  },
  {
    id: 'calendar',
    title: 'Calendar',
    tokens: [
      {
        name: '--gog-calendar-max-width',
        description:
          'How wide the calendar may get. Defaults to max-content, which caps it at its own ' +
          'month grid and follows the size steps, numberOfMonths and showTime on its own — ' +
          'set it to 100% for a calendar that fills its container instead. Also sizes ' +
          'gog-datepicker in inline mode, which renders this component.',
      },
      {
        name: '--gog-calendar-padding / -header-gap / -footer-gap / -months-gap',
        description: 'Grid padding and the gaps between header, footer and side-by-side months.',
      },
      {
        name: '--gog-calendar-day-size (per size step: xsm/sm/md/lg/slg) / -day-radius',
        description: 'Day cell size and shape.',
      },
      {
        name: '--gog-calendar-day-rest-bg / -day-hover-bg / -day-outside-color',
        description: 'Day cell states, including days spilling in from the neighbouring month.',
      },
      {
        name: '--gog-calendar-selected-bg / -selected-color / -selected-font-weight',
        description: 'The selected day.',
      },
      {
        name: '--gog-calendar-range-bg / -range-color',
        description: 'Days between the two ends of a range selection.',
      },
      {
        name: '--gog-calendar-today-border-color / -today-font-weight',
        description: 'The ring marking today.',
      },
      {
        name: '--gog-calendar-nav-bg / -nav-hover-bg / -nav-size / -nav-icon-size',
        description: 'Previous/next month and year buttons.',
      },
      {
        name: '--gog-calendar-weekday-color / -weekday-font-size / -weekday-text-transform',
        description: 'Weekday header row.',
      },
      {
        name: '--gog-calendar-time-input-bg / -time-input-width / -time-gap',
        description: 'The clock section shown under the grid when showTime is on.',
      },
    ],
  },
  {
    id: 'card',
    title: 'Card',
    tokens: [
      {
        name: '--gog-card-bg / -border-color / -shadow / -padding-y / -padding-x / -gap',
        description:
          'The instance tier — left undeclared by the library on purpose, so setting one on an element beats the variant and size classes without a specificity fight.',
      },
      {
        name: '--gog-card-outlined-bg / -outlined-border-color / -outlined-shadow',
        description: 'The outlined variant (the default): a border, no shadow.',
      },
      {
        name: '--gog-card-elevated-bg / -elevated-border-color / -elevated-shadow',
        description: 'The elevated variant: the shared surface shadow, no border.',
      },
      {
        name: '--gog-card-filled-bg / -filled-border-color / -filled-shadow',
        description: 'The filled variant: a tint, neither border nor shadow.',
      },
      {
        name: '--gog-card-color / --gog-card-font-family / --gog-card-radius',
        description: 'Body text color, font stack and corner radius.',
      },
      {
        name: '--gog-card-heading-color / -heading-font-family / -heading-font-size / -heading-font-weight / -heading-line-height',
        description:
          'The projected gogCardHeader. The visual size comes from these regardless of which heading level you use.',
      },
      {
        name: '--gog-card-footer-border-color / -footer-gap / -footer-padding-top',
        description: 'The projected gogCardFooter row and the rule above it.',
      },
      {
        name: '--gog-card-hover-border-color / --gog-card-hover-shadow',
        description: 'Hover treatment, which only appears on a card holding a gogCardLink.',
      },
      {
        name: '--gog-card-focus-ring / -focus-ring-width / -focus-ring-offset',
        description: 'The ring drawn around the whole card when its stretched link takes focus.',
      },
      {
        name: '--gog-card-xsm-padding-y … --gog-card-slg-padding-y (and -padding-x, -gap)',
        description: 'Padding and row gap per size tier, xsm through slg.',
      },
      {
        name: '--gog-card-disabled-opacity / --gog-card-transition-duration',
        description: 'Disabled dimming, and the hover/focus transition.',
      },
    ],
  },
  {
    id: 'checkbox',
    title: 'Checkbox',
    tokens: [
      { name: '--gog-checkbox-gap', description: 'Gap between box and label.' },
      { name: '--gog-checkbox-radius', description: 'Box corner radius.' },
      {
        name: '--gog-checkbox-border-width / -style / -color',
        description: 'Box border.',
      },
      {
        name: '--gog-checkbox-bg / -checked-bg / -checked-border',
        description: 'Box background, unchecked and checked.',
      },
      { name: '--gog-checkbox-icon-color', description: 'Checkmark color.' },
      { name: '--gog-checkbox-label-color', description: 'Label text color.' },
      {
        name: '--gog-checkbox-focus-ring / -focus-ring-width / -focus-ring-offset',
        description:
          'Keyboard focus ring. The colour reads --gog-accent-color rather than the pale wash it used to, corrected in 21.12.0: this outline is the only thing marking focus on this control, and a wash measured 1.38:1 against the light page where WCAG asks for 3:1.',
      },
    ],
  },
  {
    id: 'chip',
    title: 'Chip',
    tokens: [
      {
        name: '--gog-chip-bg / -hover-bg / -press-bg',
        description: 'Background, default, hover and pressed.',
      },
      {
        name: '--gog-chip-selected-shadow / -selected-ring-width',
        description:
          'The inset ring a filter chip draws while selected ([(selected)], 21.9.0). A ring ' +
          'rather than a fill, because hover and press already own the background.',
      },
      {
        name: '--gog-chip-border / -border-width / -style',
        description:
          'Border. Since 21.12.0 the colour defaults to --gog-control-boundary-color rather than the decorative --gog-border-color: a chip is a control, and its edge is what identifies it. That is why chips look outlined more firmly than they did — they were at 1.18:1 in primeng before.',
      },
      {
        name: '--gog-chip-focus-ring-color / -width / -offset',
        description:
          'The keyboard focus ring. The colour is new in 21.12.0 — the chip had a width and an offset but no colour of its own, so the stylesheet reached for --gog-chip-border and the ring came out as a hairline. A focus indicator needs its own colour.',
      },
      { name: '--gog-chip-color / -font-weight', description: 'Text color and weight.' },
      {
        name: '--gog-chip-radius / -pill-radius',
        description: 'Corner radius, square and pill shape.',
      },
      {
        name: '--gog-chip-remove-color / -remove-hover-color',
        description: 'Remove (×) icon color.',
      },
      {
        name: '--gog-chip-{size}-font-size / -padding-block / -padding-inline / -gap / -avatar-size / -icon-size / -remove-size',
        description:
          'Full sizing scale, per size step (xsm/sm/md/lg/slg). The three glyph sizes are ratios of the chip’s own type rather than px ladders since 21.11.0 — avatar 1.5em, icon 1em, remove mark 1.125em, one value at every size — so overriding a size’s font-size carries its glyphs with it, which the rem ladder did not.',
      },
    ],
  },
  {
    id: 'collapsible',
    title: 'Collapsible',
    tokens: [
      {
        name: '--gog-collapsible-transition-duration',
        description: 'Expand/collapse animation timing.',
      },
      {
        name: '--gog-collapsible-max-height',
        description:
          'Height an open panel transitions toward. Defaults to max-content, so a panel is as tall as its content and never truncates it. Set a length to cap one deliberately — the panel is overflow: hidden, so a cap clips rather than scrolls.',
      },
      {
        name: '--gog-collapsible-disabled-opacity',
        description: 'Opacity applied to a disabled trigger.',
      },
    ],
  },
  {
    id: 'datepicker',
    title: 'Datepicker',
    tokens: [
      { name: '--gog-datepicker-label-color', description: 'Field label color.' },
      {
        name: '--gog-datepicker-field-bg / -border-color / -text-color',
        description: 'Field surface, border and text.',
      },
      {
        name: '--gog-datepicker-radius / -min-width',
        description: 'Field corner radius and minimum width.',
      },
      {
        name: '--gog-datepicker-focus-ring-color / -focus-ring-width / -hover-border-color',
        description: 'Focus and hover states.',
      },
      {
        name: '--gog-datepicker-icon-color / -icon-hover-color / -toggle-icon-size',
        description: 'The calendar toggle icon.',
      },
      {
        name: '--gog-datepicker-panel-bg / -panel-border-color / -panel-shadow / -panel-radius',
        description:
          'The panel wrapping the calendar. The grid itself is themed by --gog-calendar-*.',
      },
      {
        name: '--gog-datepicker-panel-width',
        description:
          'Width of the dropdown panel, max-content by default. Inline mode has no panel — it ' +
          'is gog-calendar on its own, so it sizes from --gog-calendar-max-width.',
      },
      {
        name: '--gog-datepicker-clear-color / -clear-icon-ratio / -actions-inset',
        description: 'Clear button color, glyph size and inset.',
      },
      {
        name: '--gog-datepicker-error-color / -error-border-color / -error-font-size',
        description: 'Validation error message and border.',
      },
      {
        name: '--gog-datepicker-float-label-reserve / -in-top / -over-gap / -over-reserve',
        description:
          'Float-label geometry, derived from the shared --gog-field-float-label-* scale.',
      },
    ],
  },
  {
    id: 'dialog',
    title: 'Dialog',
    tokens: [
      {
        name: '--gog-dialog-backdrop-bg / -backdrop-blur',
        description: 'Scrim behind the dialog.',
      },
      {
        name: '--gog-dialog-bg / -color / -border / -radius / -shadow',
        description: 'Panel surface.',
      },
      {
        name: '--gog-dialog-title-font-size / -title-line-height',
        description:
          'The dialog’s <h2>. New tokens in 21.11.0 and the value is the size it was already rendering — the title had simply been inheriting from the browser rather than reading the type scale, so it was outside a theme’s reach.',
      },
      {
        name: '--gog-dialog-header-padding / -body-padding',
        description: 'Section padding.',
      },
      {
        name: '--gog-dialog-close-color / -close-hover-color / -close-hover-bg',
        description: 'Close button.',
      },
      {
        name: '--gog-confirmation-dialog-color / -description-color / -actions-gap',
        description: 'Confirmation dialog variant.',
      },
      {
        name: '--gog-confirmation-dialog-title-font-size / -description-font-size (and their line heights)',
        description:
          'The title and the description, on the type scale since 21.11.0 rather than inherited. The description is the one that visibly moved: 16px to 14px, a step smaller than it was.',
      },
      {
        name: '--gog-confirmation-dialog-max-width',
        description:
          'The panel’s cap, in ch since 21.11.0 so raising the font size widens the panel with it. It resolves against .confirm-dialog’s own inherited size, not the description’s — a ch cap always reads the font of the element carrying max-width, never a descendant’s.',
      },
    ],
  },
  {
    id: 'divider',
    title: 'Divider',
    tokens: [
      {
        name: '--gog-divider-line-color / -line-thickness',
        description: 'The rule itself.',
      },
      {
        name: '--gog-divider-solid-style / -dashed-style / -dotted-style',
        description: 'The border-style each variant maps to.',
      },
      {
        name: '--gog-divider-block-spacing / -inline-spacing',
        description: 'Margin around a horizontal and a vertical divider respectively.',
      },
      {
        name: '--gog-divider-vertical-length',
        description: 'Fallback length for a vertical divider whose row has no height of its own.',
      },
      {
        name: '--gog-divider-inset-size',
        description: 'How far the inset variant is indented from the leading edge.',
      },
      {
        name: '--gog-divider-label-color / -label-font-size / -label-font-weight / -label-gap',
        description: 'The projected label and the gap punched in the rule around it.',
      },
    ],
  },
  {
    id: 'icon',
    title: 'Icon',
    tokens: [
      { name: '--gog-icon-size', description: 'Default icon size.' },
      { name: '--gog-icon-stroke-width', description: 'Stroke width for outline icons.' },
      { name: '--gog-icon-fallback-size', description: 'Size used when no size is set.' },
    ],
  },
  {
    id: 'input-field',
    // --gog-input-* names the text-field block that gog-inputfield and gog-textarea both
    // render — not the gog-inputfield component. The two restyle together from one token
    // set on purpose, which is why there is no --gog-inputfield-*.
    title: 'Input Field & Text Area — the shared field block',
    tokens: [
      { name: '--gog-input-label-color', description: 'Field label color.' },
      {
        name: '--gog-input-field-bg / -field-border / -field-color',
        description: 'Field surface, border and text.',
      },
      { name: '--gog-input-radius', description: 'Field corner radius.' },
      {
        name: '--gog-input-focus-border / -focus-ring / -focus-glow',
        description: 'Focus state.',
      },
      { name: '--gog-input-error-color', description: 'Validation error color.' },
      {
        name: '--gog-input-icon-color / -icon-hover-color',
        description: 'Prefix / suffix icon color.',
      },
      {
        name: '--gog-input-float-label-reserve / -in-top / -on-bg / -over-gap / -over-reserve',
        description:
          'Float-label geometry, derived from the shared --gog-field-float-label-* scale. -on-bg is an instance-layer token (undeclared) — the patch that masks the border behind an "on" label.',
      },
      {
        name: '--gog-textarea-clear-icon-ratio',
        description:
          'Size of gog-textarea’s clear glyph relative to the field. A textarea is a large multi-line box, so it takes a full-size glyph rather than the dropdowns’ denser 0.7 ratio.',
      },
      {
        name: '--gog-textarea-scrollbar-width',
        description:
          'Instance-layer (undeclared): written by the component from its own measured scrollbar width, so a clear button on a scrolling textarea does not end up under the thumb.',
      },
    ],
  },
  {
    id: 'menu',
    title: 'Menu',
    tokens: [
      {
        name: '--gog-menu-z',
        description:
          'Stacking order of the portaled panel. Defaults to --gog-dropdown-z, and the panel takes the value its trigger inherits — which is how a menu opened inside a dialog stacks above it.',
      },
      { name: '--gog-menu-bg', description: 'Panel background.' },
      {
        name: '--gog-menu-border-color / -border-width / -border-style',
        description: 'Panel border.',
      },
      {
        name: '--gog-menu-radius / --gog-menu-item-radius',
        description:
          'The panel’s corner, and the item’s. The item derives from the panel less the panel’s own padding since 21.11.0, so the first and last rows stay concentric with the corner they sit in instead of looking squarer than it — at the default theme that moved the item from 8px to 12px.',
      },
      {
        name: '--gog-menu-shadow',
        description:
          'Panel shadow. Defaults to --gog-panel-shadow, the same step the four dropdown panels sit on. It aliased the dialog’s until 21.12.0, which put a modal’s shadow on a dropdown menu — two overlays of one kind, four steps apart, and the alias is why nobody saw it.',
      },
      { name: '--gog-menu-font-family', description: 'Panel font family.' },
      { name: '--gog-menu-padding', description: 'Space between the panel edge and its items.' },
      { name: '--gog-menu-gap', description: 'Space between items.' },
      {
        name: '--gog-menu-item-hover-bg / -item-press-bg',
        description: 'An item under the pointer, and under a press.',
      },
      { name: '--gog-menu-panel-gap', description: 'Gap between the trigger and the panel.' },
      {
        name: '--gog-menu-min-width / -max-width',
        description:
          'Panel width bounds. The panel sizes to its widest item between them, never to the trigger.',
      },
      {
        name: '--gog-menu-max-height',
        description:
          'Height past which the panel scrolls itself with gog-scroll instead of growing. The panel takes the smallest of this, its own content, and the room between its trigger and the viewport edge.',
      },
      {
        name: '--gog-menu-available-height',
        description:
          'Instance-layer (undeclared): written by the component from the room it measured beside the trigger. Listed because it is the other half of the min() above, not because you would set it.',
      },
      { name: '--gog-menu-transition-duration', description: 'Open/close transition.' },
      {
        name: '--gog-menu-focus-ring / -focus-ring-width',
        description: 'Focus ring on the item the arrow keys landed on.',
      },
      {
        name: '--gog-menu-item-color / -hover-bg / -hover-color',
        description: 'Item foreground, and the pair it swaps to under the pointer or focus.',
      },
      {
        name: '--gog-menu-item-font-size / -line-height / -padding / -radius',
        description: 'Item metrics.',
      },
      { name: '--gog-menu-item-gap', description: "Space between an item's icon and its label." },
      {
        name: '--gog-menu-item-icon-size',
        description: "Size of an icon projected into an item, relative to the item's own text.",
      },
      {
        name: '--gog-menu-item-disabled-opacity / -disabled-color',
        description: 'How a disabled item reads. It stays in the list rather than disappearing.',
      },
    ],
  },
  {
    id: 'multiselect',
    title: 'Multiselect',
    tokens: [
      { name: '--gog-multiselect-label-color', description: 'Field label color.' },
      {
        name: '--gog-multiselect-field-bg / -field-border',
        description: 'Field surface and border.',
      },
      {
        name: '--gog-multiselect-radius / -min-width',
        description:
          'The field’s corner radius — the field only, since 21.12.0 — and the floor an auto-width trigger cannot collapse past.',
      },
      { name: '--gog-multiselect-focus-border / -focus-ring', description: 'Focus state.' },
      {
        name: '--gog-multiselect-panel-bg / -panel-border / -panel-shadow / -panel-max-width',
        description:
          'Dropdown panel surface, and the cap on a panel that sizes to its own content rather than to the trigger.',
      },
      {
        name: '--gog-multiselect-panel-gap',
        description:
          'Gap between the trigger and the panel. Renamed from --gog-multiselect-panel-offset in 21.13.0; the old name still resolves until 21.14.0, so move an override now.',
      },
      {
        name: '--gog-multiselect-option-height',
        description:
          'A seed for the first frame, not the row height: the component measures a real row and corrects itself, which is also what decides whether the panel opens up or down.',
      },
      {
        name: '--gog-multiselect-panel-radius',
        description:
          'The panel’s own corner, new in 21.12.0 and defaulting to var(--gog-radius). Splitting it off the field’s radius is why shaping the trigger no longer reshapes the overlay; the option row and the filter input both stay concentric with whatever you set here.',
      },
      {
        name: '--gog-multiselect-option-hover-bg / -option-press-bg / -option-color',
        description: 'Option row, default, hover and pressed.',
      },
      {
        name: '--gog-multiselect-checkbox-bg / -checkbox-checked-bg',
        description: 'Per-option selection checkbox.',
      },
      {
        name: '--gog-multiselect-float-label-reserve / -in-top / -on-bg / -over-gap / -over-reserve',
        description:
          'Float-label geometry, derived from the shared --gog-field-float-label-* scale.',
      },
    ],
  },
  {
    id: 'paginator',
    title: 'Paginator',
    tokens: [
      { name: '--gog-paginator-gap', description: 'Gap between page controls.' },
      {
        name: '--gog-paginator-ellipsis-color / -ellipsis-font-size',
        description: 'The "…" truncation marker.',
      },
    ],
  },
  {
    id: 'panel',
    title: 'Panel',
    tokens: [
      {
        name: '--gog-panel-radius / --gog-panel-shadow / --gog-panel-border-width / --gog-panel-border-style',
        description:
          'Shared with the foundation surface tier — the same four tokens dialogs and dropdown panels read, so a theme’s idea of a raised surface reaches gog-panel for free. Setting them here restyles those surfaces too.',
      },
      {
        name: '--gog-panel-outlined-bg / -outlined-border-color / -outlined-shadow',
        description: 'The outlined variant: a border, no shadow.',
      },
      {
        name: '--gog-panel-elevated-bg / -elevated-border-color',
        description: 'The elevated variant (the default) — takes the shared surface shadow above.',
      },
      {
        name: '--gog-panel-filled-bg / -filled-border-color / -filled-shadow',
        description: 'The filled variant: a tint, neither border nor shadow.',
      },
      {
        name: '--gog-panel-color / --gog-panel-font-family',
        description: 'Body text color and font stack.',
      },
      {
        name: '--gog-panel-heading-color / -heading-font-family / -heading-font-size / -heading-font-weight / -heading-line-height',
        description: 'The projected gogPanelHeader heading.',
      },
      {
        name: '--gog-panel-header-gap',
        description: 'Gap between the heading and the collapse toggle.',
      },
      {
        name: '--gog-panel-toggle-size / -toggle-color / -toggle-hover-bg / -toggle-radius / --gog-panel-chevron-size',
        description: 'The collapse toggle button and its chevron.',
      },
      {
        name: '--gog-panel-footer-border-color / -footer-gap / -footer-padding-top',
        description: 'The projected gogPanelFooter row and the rule above it.',
      },
      {
        name: '--gog-panel-xsm-padding-y … --gog-panel-slg-padding-y (and -padding-x, -gap)',
        description: 'Padding and row gap per size tier, xsm through slg.',
      },
      {
        name: '--gog-panel-focus-ring / -focus-ring-width / -focus-ring-offset',
        description: 'Focus ring on the collapse toggle.',
      },
      {
        name: '--gog-panel-disabled-opacity / --gog-panel-transition-duration',
        description: 'Disabled dimming, and the collapse/hover transition.',
      },
    ],
  },
  {
    id: 'progressbar',
    title: 'Progress Bar',
    tokens: [
      {
        name: '--gog-progressbar-accent-bg / -success-bg / -danger-bg / -warning-bg / -info-bg',
        description: 'Fill color per variant.',
      },
      {
        name: '--gog-progressbar-{variant}-buffer-bg',
        description: 'The lighter buffer level shown ahead of the fill in "buffer" mode.',
      },
      {
        name: '--gog-progressbar-track-base-bg / -radius',
        description: 'The unfilled track.',
      },
      {
        name: '--gog-progressbar-{size}-height',
        description: 'Bar thickness, per size step (xsm/sm/md/lg/slg).',
      },
      {
        name: '--gog-progressbar-indeterminate-duration / -indeterminate-easing',
        description:
          'Indeterminate animation timing. Replaced by a static stripe under prefers-reduced-motion.',
      },
      {
        name: '--gog-progressbar-stripe-color / -stripe-size',
        description: 'The static stripe that stands in for the animation when motion is reduced.',
      },
      {
        name: '--gog-progressbar-value-color / -value-font-size / -value-min-width / -value-gap',
        description: 'The percentage readout rendered when showValue is on.',
      },
      {
        name: '--gog-progressbar-edge-color / -edge-backing-color / -edge-width',
        description:
          'The two hairlines marking where the fill ends, added in 21.10.0 — and, since 21.13.0, where the buffer level ends too. Two rather than one because no single tone clears WCAG 1.4.11 against all five fills: the ink line sits outermost against the track, the surface-coloured one just inside the fill, and whichever tone a fill sits close to, the other one reads. With showValue off — the default — this boundary is the only thing stating the value.',
      },
    ],
  },
  {
    id: 'radio-group',
    title: 'Radio Group',
    tokens: [
      {
        name: '--gog-radio-bg / -border-color / -border-width / -border-style',
        description: 'The circle, unchecked.',
      },
      {
        name: '--gog-radio-checked-bg / -checked-border / -dot-color / -dot-size-ratio',
        description: 'The circle and its dot once checked.',
      },
      {
        name: '--gog-radio-label-color / -label-line-height / -gap',
        description: 'Per-option label and the gap to its circle.',
      },
      {
        name: '--gog-radio-group-label-color / -group-label-size / -group-gap',
        description: 'The group’s own label.',
      },
      {
        name: '--gog-radio-group-option-gap / -group-option-gap-horizontal',
        description: 'Gap between options, vertical and horizontal orientation respectively.',
      },
      {
        name: '--gog-radio-focus-ring / -focus-ring-width / -focus-ring-offset',
        description:
          'Keyboard focus ring. The colour reads --gog-accent-color rather than the pale wash it used to, corrected in 21.12.0: this outline is the only thing marking focus on this control, and a wash measured 1.38:1 against the light page where WCAG asks for 3:1.',
      },
      {
        name: '--gog-radio-error-color / -error-font-size / -disabled-opacity',
        description: 'Validation error message and the disabled state.',
      },
    ],
  },
  {
    id: 'ripple',
    title: 'Ripple',
    tokens: [
      {
        name: '--gog-ripple-color',
        description:
          'The wash. Defaults to currentColor rather than a palette token — the only token in this catalogue that does — so it reads as the surface’s own foreground on a filled surface and a ghost one alike, which is why the ripple needs no per-variant tier.',
      },
      { name: '--gog-ripple-opacity', description: 'Peak opacity of the wash.' },
      {
        name: '--gog-ripple-enter-duration',
        description: 'How long the wave takes to expand from the press point.',
      },
      {
        name: '--gog-ripple-exit-duration',
        description: 'How long it fades once the pointer is released.',
      },
      { name: '--gog-ripple-easing', description: 'Easing curve for both phases.' },
    ],
  },
  {
    id: 'scroll',
    title: 'Scroll',
    tokens: [
      {
        name: '--gog-scroll-track-bg / -track-radius',
        description: 'Track background and corner radius.',
      },
      {
        name: '--gog-scroll-thumb-bg / -thumb-hover-bg / -thumb-active-bg',
        description: 'Draggable thumb color, per interaction state.',
      },
      {
        name: '--gog-scroll-thumb-radius / -thumb-inset',
        description: 'Thumb shape and inset from the track edges.',
      },
      {
        name: '--gog-scroll-corner-bg',
        description: 'Background of the corner square where two tracks meet.',
      },
      { name: '--gog-scroll-fade-duration', description: 'Auto-hide fade animation timing.' },
      {
        name: '--gog-scroll-focus-ring / -focus-ring-width',
        description: 'Keyboard focus ring on the viewport.',
      },
      {
        name: '--gog-scroll-{normal|thin}-track-width / -thumb-min-size',
        description: 'Track width and minimum thumb length, per size step.',
      },
    ],
  },
  {
    id: 'select',
    title: 'Select',
    tokens: [
      { name: '--gog-select-label-color', description: 'Field label color.' },
      {
        name: '--gog-select-field-bg / -field-border',
        description: 'Field surface and border.',
      },
      {
        name: '--gog-select-radius',
        description:
          'The field’s corner radius — the field only. Until 21.12.0 it shaped the dropdown panel too, so rounding the trigger into a pill rounded the overlay into one as well; that box has its own token now.',
      },
      { name: '--gog-select-focus-border / -focus-ring', description: 'Focus state.' },
      {
        name: '--gog-select-panel-bg / -panel-shadow / -panel-max-width',
        description:
          'Dropdown panel surface, and the cap on a panel that sizes to its own content rather than to the trigger.',
      },
      {
        name: '--gog-select-panel-gap',
        description:
          'Gap between the trigger and the panel. Renamed from --gog-select-panel-offset in 21.13.0; the old name still resolves until 21.14.0, so move an override now.',
      },
      {
        name: '--gog-select-option-height',
        description:
          'A seed for the first frame, not the row height: the component measures a real row and corrects itself, which is also what decides whether the panel opens up or down.',
      },
      {
        name: '--gog-select-panel-radius',
        description:
          'The panel’s own corner, new in 21.12.0 and defaulting to var(--gog-radius), so nothing moves unless you change it. gog-autocomplete and gog-datepicker already declared theirs; this and the multiselect’s are the pair that completes the family.',
      },
      {
        name: '--gog-select-options-padding / --gog-select-option-radius',
        description:
          'The gutter around the option list and the row’s own corner, matching what gog-autocomplete and gog-multiselect already had. This panel had no interior at all before 21.12.0, which is why its first and last rows were square inside a rounded corner. The row radius derives from the panel radius less the gutter, so it stays concentric once --gog-density moves the padding.',
      },
      {
        name: '--gog-select-min-width',
        description: 'The floor an auto-width trigger cannot collapse past (120px).',
      },
      {
        name: '--gog-select-chevron-color / -chevron-inset',
        description:
          'Dropdown arrow color and inset. Since 21.3.0 the inset lands on --gog-control-icon-offset, the same line as gog-inputfield’s icons — the three controls now line up in a form.',
      },
      {
        name: '--gog-select-option-hover-bg / -option-press-bg / -option-selected-color',
        description: 'Option row states.',
      },
      {
        name: '--gog-select-float-label-reserve / -in-top / -on-bg / -over-gap / -over-reserve',
        description:
          'Float-label geometry, derived from the shared --gog-field-float-label-* scale.',
      },
    ],
  },
  {
    id: 'skeleton',
    title: 'Skeleton',
    tokens: [
      { name: '--gog-skeleton-base / -shine', description: 'Placeholder base color and shimmer.' },
      {
        name: '--gog-skeleton-radius / -line-radius',
        description: 'Corner radius, block and line shapes.',
      },
      {
        name: '--gog-skeleton-pulse-duration / -wave-duration',
        description: 'Loading animation timing.',
      },
    ],
  },
  {
    id: 'slider',
    title: 'Slider',
    tokens: [
      { name: '--gog-slider-label-color / -value-color', description: 'Label and current value.' },
      {
        name: '--gog-slider-track-bg / -fill-bg',
        description:
          'Track, empty and filled. The fill is applied as background rather than background-color, so -fill-bg also accepts a gradient.',
      },
      {
        name: '--gog-slider-track-border-width / -track-border-style / -track-border-color',
        description:
          'An optional border on the track — transparent by default, the same opt-in convention as --gog-button-primary-border.',
      },
      {
        name: '--gog-slider-thumb-bg / -thumb-border / -thumb-shadow',
        description: 'Drag handle.',
      },
      {
        name: '--gog-slider-auto-width / -vertical-length',
        description:
          'Size of a slider that does not fill its container: width when horizontal, length when vertical.',
      },
      { name: '--gog-slider-focus-ring', description: 'Keyboard focus ring.' },
    ],
  },
  {
    id: 'spinner',
    title: 'Spinner',
    tokens: [
      { name: '--gog-spinner-track-color', description: 'Background ring.' },
      {
        name: '--gog-spinner-arc-outer-color / -arc-inner-color',
        description: 'Spinning arc colors.',
      },
      {
        name: '--gog-spinner-diamond-color / -rune-color / -glow-color',
        description: 'Decorative elements on the larger spinner variants.',
      },
      {
        name: '--gog-spinner-spin-duration / -pulse-duration',
        description: 'Animation timing.',
      },
    ],
  },
  {
    id: 'table',
    title: 'Table',
    tokens: [
      { name: '--gog-table-border-color / -border-width', description: 'Outer border.' },
      {
        name: '--gog-table-surface / -text-color / -accent-color',
        description: 'Surface, body text and header accent.',
      },
      { name: '--gog-table-hover-bg', description: 'Row hover background.' },
      { name: '--gog-table-muted-color', description: 'Secondary text (e.g. empty state).' },
      {
        name: '--gog-table-header-letter-spacing / -text-transform',
        description: 'Header cell typography.',
      },
      {
        name: '--gog-table-{size}-padding-v / -th-font-size / -td-font-size',
        description: 'Row density, per size step (xsm/sm/md/lg/slg).',
      },
    ],
  },
  {
    id: 'tabs',
    title: 'Tabs',
    tokens: [
      {
        name: '--gog-tabs-rest-color / -hover-color / -active-color',
        description: 'Tab header label, per state.',
      },
      {
        name: '--gog-tabs-press-bg / -press-color',
        description:
          'A header under a press. It carries a label colour as well as a background, the way ' +
          'the button does, because a header has little fill of its own to deepen.',
      },
      {
        name: '--gog-tabs-indicator-color / -indicator-thickness / -indicator-radius',
        description: 'The bar marking the active tab.',
      },
      {
        name: '--gog-tabs-header-border-color / -header-border-width / -header-border-style',
        description: 'The rule under the tablist.',
      },
      {
        name: '--gog-tabs-{size}-font-size / -{size}-padding',
        description: 'Header typography and padding, per size step (sm/md/lg/slg).',
      },
      {
        name: '--gog-tabs-tab-gap / -gap / -icon-size',
        description: 'Gap between headers, between a header’s icon and its label, and icon size.',
      },
      {
        name: '--gog-tabs-panel-padding / -panel-color',
        description: 'The content panel below the tablist.',
      },
      {
        name: '--gog-tabs-focus-ring-color / -focus-ring-width / -focus-ring-offset / -disabled-opacity',
        description: 'Keyboard focus ring and the disabled state.',
      },
    ],
  },
  {
    id: 'tag',
    title: 'Tag',
    tokens: [
      {
        name: '--gog-tag-default-color / -success-color / -danger-color / -warning-color / -info-color',
        description: 'Base color per semantic variant.',
      },
      {
        name: '--gog-tag-bg-base / -color-base / -bg-mix / -color-mix',
        description: 'How the variant color is mixed into background and text.',
      },
      {
        name: '--gog-tag-radius / -pill-radius',
        description: 'Corner radius, square and pill shape.',
      },
      {
        name: '--gog-tag-{size}-font-size / -padding-block / -padding-inline / -gap / -icon-size',
        description: 'Full sizing scale, per size step (xsm/sm/md/lg/slg).',
      },
    ],
  },
  {
    id: 'toast',
    title: 'Toast',
    tokens: [
      { name: '--gog-toast-bg / -color / -border', description: 'Card surface.' },
      {
        name: '--gog-toast-success-color / -error-color / -warning-color / -info-color',
        description: 'Accent stripe and icon color, per toast type.',
      },
      { name: '--gog-toast-padding / -radius', description: 'Card padding and corner radius.' },
      {
        name: '--gog-toast-stack-peek / -stack-scale-step / -stack-expanded-gap',
        description: 'Card-stack geometry when several toasts are visible at once.',
      },
    ],
  },
  {
    id: 'toggle',
    title: 'Toggle',
    tokens: [
      {
        name: '--gog-toggle-track-off-bg / -track-on-bg / -on-border-color',
        description: 'The track, off and on.',
      },
      {
        name: '--gog-toggle-border-color / -border-width / -border-style',
        description:
          'The track’s edge in the off state, which is the whole of the control when it is off. It defaults to --gog-control-boundary-color since 21.12.0; reading the decorative hairline instead had left an off switch at under 3:1 in all eleven themes, which is to say invisible to WCAG.',
      },
      {
        name: '--gog-toggle-thumb-off-bg / -thumb-on-bg / -thumb-shadow / -thumb-inset',
        description: 'The sliding thumb.',
      },
      {
        name: '--gog-toggle-{size}-track-width / -track-height / -thumb-size / -label-size',
        description: 'Full sizing scale, per size step (xsm/sm/md/lg/slg).',
      },
      {
        name: '--gog-toggle-state-color / -state-font-weight / -state-padding-inline / -state-thumb-gap',
        description: 'The onLabel / offLabel text rendered inside the track.',
      },
      {
        name: '--gog-toggle-label-color / -gap / -radius',
        description: 'The label next to the switch, its gap, and the track corner radius.',
      },
      {
        name: '--gog-toggle-focus-ring-color / -focus-ring-width / -focus-ring-offset / -disabled-opacity',
        description: 'Keyboard focus ring and the disabled state.',
      },
    ],
  },
  {
    id: 'tooltip',
    title: 'Tooltip',
    tokens: [
      {
        name: '--gog-tooltip-bg / -color / -border-color / -shadow / -radius',
        description:
          'The bubble surface. Deliberately the same floating-panel recipe as a dialog or dropdown, not a bespoke inverted bubble.',
      },
      {
        name: '--gog-tooltip-max-width / -max-height',
        description:
          'Content wraps at the width and scrolls past the height, inside an internal gog-scroll.',
      },
      {
        name: '--gog-tooltip-padding / -gap / -arrow-size',
        description: 'Bubble padding, its distance from the trigger, and the arrow.',
      },
      {
        name: '--gog-tooltip-font-family / -font-size / -line-height',
        description: 'Bubble typography.',
      },
      {
        name: '--gog-tooltip-z / -transition-duration',
        description:
          'Stacking order (raised inside a dialog so a tooltip stacks above it) and fade timing.',
      },
    ],
  },
];
