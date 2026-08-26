/**
 * Per-page `<title>` and `<meta name="description">` for every routed page.
 *
 * Why a table rather than `title` on each route: the description has to live somewhere anyway
 * (the router only carries a title), and splitting the two across `app.routes.ts` and a service
 * guarantees one of them gets forgotten. Everything a search result shows for a page is
 * therefore in one file, next to `nav-data.ts`, which is what the sitemap is generated from.
 *
 * Rules of thumb when adding a page:
 * - **Title** ≤ 60 characters or Google truncates it. Lead with what the page is about, not
 *   with the site name — `Angular Table Component — Guild of Gleks UI`, never the reverse.
 * - **Description** 120–160 characters, unique per page, written as a sentence a human would
 *   read in a result list. It is not a ranking factor, it is the click-through pitch.
 * - Say **Angular** in both. It is the single word that qualifies every search this site can
 *   realistically win.
 *
 * A path missing from this table still renders — it just gets the fallback below plus
 * `noindex`, which is exactly what should happen to `components/<typo>`.
 */

export const SITE_URL = 'https://ui.guildofgleks.com';
export const SITE_NAME = 'Guild of Gleks UI';

/** `/` redirects here (`app.routes.ts`), so this page is the site's home for search engines. */
export const HOME_PATH = 'general/overview';

/** Social-card image. Square-ish, so the cards are `summary`, not `summary_large_image`. */
export const SOCIAL_IMAGE = `${SITE_URL}/gleks_ui_logo.png`;

export interface PageSeo {
  readonly title: string;
  readonly description: string;
}

/**
 * The `**` route's tags. Separate from `FALLBACK_SEO` because the two cases are different:
 * `components/<typo>` renders real chrome around an unknown name and honestly describes the
 * site, while this page describes nothing. Both are `noindex`; only this one answers a 404
 * (`app.routes.server.ts`), and a browser tab reading "Angular UI Component Library" over a
 * not-found page is simply wrong.
 */
export const NOT_FOUND_SEO: PageSeo = {
  title: `Page not found — ${SITE_NAME}`,
  description: 'This URL does not match any page in the Guild of Gleks UI documentation.',
};

export const FALLBACK_SEO: PageSeo = {
  title: `${SITE_NAME} — Angular UI Component Library`,
  description:
    'Documentation for @guildofgleks/ui, a lightweight Angular 21 and 22 component library: ' +
    'standalone, signal-based components themed with plain CSS custom properties.',
};

const component = (name: string, description: string): PageSeo => ({
  title: `Angular ${name} Component — ${SITE_NAME}`,
  description,
});

export const PAGE_SEO: Readonly<Record<string, PageSeo>> = {
  [HOME_PATH]: {
    title: `${SITE_NAME} — Angular UI Component Library`,
    description:
      'A lightweight Angular UI component library: 29 standalone, signal-based, OnPush components ' +
      'themed with plain CSS variables. No CDK, no Material, no Sass build step.',
  },
  'general/getting-started': {
    title: `Getting Started — Angular UI Library Setup`,
    description:
      'Install @guildofgleks/ui in an Angular 21 or 22 app: one npm package, one stylesheet ' +
      'import, and standalone components you import where you use them. No module, no theme ' +
      'compiler.',
  },
  'general/global-config': {
    title: `Global Configuration — provideGogConfig`,
    description:
      'Set library-wide defaults once with provideGogConfig: component sizes, scroll behaviour, ' +
      'toast position, theme storage and every user-facing string, overridable per injector.',
  },
  'general/theming': {
    title: `Theming Angular Components with CSS Variables`,
    description:
      'Retheme the whole library by overriding a handful of CSS custom properties — foundation, ' +
      'component and instance layers, 1239 tokens, no preprocessor and no rebuild.',
  },
  'general/theme-generator': {
    title: `Theme Generator — Build an Angular UI Theme`,
    description:
      'Pick colours, radii and spacing in the browser and copy out a ready CSS block that themes ' +
      'every Guild of Gleks UI component. No build step, no Sass, no theming API to learn.',
  },
  'general/compare': {
    title: `Angular UI Libraries Compared: Material, PrimeNG`,
    description:
      'How Guild of Gleks UI compares with Angular Material and PrimeNG on bundle size, ' +
      'dependencies, deprecated API and theming model — measured from the published packages.',
  },
  'general/compare-full': {
    title: `Full Technical Comparison — measured, reproducible`,
    description:
      'Every number behind the Angular UI library comparison: bundle weight per component, CSS ' +
      'weight, dependency trees and deprecation counts, each with the command that produced it.',
  },
  'general/faq': {
    title: `FAQ — Angular UI Component Library`,
    description:
      'Answers to the questions asked before adopting Guild of Gleks UI: browser support, form ' +
      'integration, accessibility, SSR, bundle size and how it relates to Material and PrimeNG.',
  },
  'general/releases': {
    title: `Releases and Changelog — Angular UI Library`,
    description:
      'Every release of @guildofgleks/ui, an Angular component library: what changed, what was ' +
      'fixed and what is deprecated, read from the changelog shipped inside the package itself.',
  },

  'components/accordion': component(
    'Accordion',
    'An accessible Angular accordion with single or multiple open panels, projected headers and ' +
      'chevrons, animated height and full keyboard support.',
  ),
  'components/autocomplete': component(
    'Autocomplete',
    'Angular autocomplete input with async options, load-more paging, custom option templates and ' +
      'full ControlValueAccessor support for reactive and template-driven forms.',
  ),
  'components/badge': component(
    'Badge',
    'A badge directive that attaches a count or status dot to any element you already have — ' +
      'buttons, icons, avatars — instead of wrapping it in another component.',
  ),
  'components/button': component(
    'Button',
    'Angular button as a directive on your own element or as a component: four variants, three ' +
      'sizes, loading and icon states, and an anchor flavour that keeps real link semantics.',
  ),
  'components/button-toggle': component(
    'Button Toggle',
    'A segmented control for Angular: single or multiple selection, roving focus, keyboard ' +
      'navigation and options projected as ordinary buttons you can style.',
  ),
  'components/calendar': component(
    'Calendar',
    'A standalone Angular calendar: single date, range and time selection, multiple months, ' +
      'locale-aware week start and shortcut buttons — the datepicker panel, usable on its own.',
  ),
  'components/checkbox': component(
    'Checkbox',
    'An accessible Angular checkbox built on a real input element, with an indeterminate state, ' +
      'a projectable check icon and CSS-variable theming.',
  ),
  'components/chip': component(
    'Chip',
    'Angular chips for filters, selections and inputs: removable, clickable and disabled states, ' +
      'with icons and full keyboard handling.',
  ),
  'components/collapsible': component(
    'Collapsible',
    'A minimal Angular show/hide primitive: a trigger directive and a content directive, animated ' +
      'height, and no opinion about how either one looks.',
  ),
  'components/card': component(
    'Card',
    'A surface for one self-contained thing in Angular: named by its own heading, with an ' +
      'optional link that activates the whole surface without swallowing the controls inside it.',
  ),
  'components/panel': component(
    'Panel',
    'A titled region of an Angular page: a real landmark named by its heading, optional ' +
      'collapsing built on gog-collapsible, and a loading state that keeps the title.',
  ),
  'components/datepicker': component(
    'Datepicker',
    'Angular datepicker with range and time selection, min/max bounds, keyboard navigation, ' +
      'locale-aware formatting and a text input you can still type into.',
  ),
  'components/dialog': component(
    'Dialog',
    'Angular modal dialog with a focus trap, Escape to close and restored focus — opened in the ' +
      'template or through DialogService, plus a ready-made confirmation dialog.',
  ),
  'components/divider': component(
    'Divider',
    'A horizontal or vertical divider with inset and style variants, themed by the same CSS ' +
      'variables as every other Guild of Gleks UI component.',
  ),
  'components/icon': component(
    'Icon',
    '41 built-in outline icons plus provideGogIcons to register your own set by name — sized and ' +
      'coloured from CSS variables, so icons inherit from wherever they are used.',
  ),
  'components/inputfield': component(
    'Input Field',
    'Angular text input with floating labels, prefix and suffix add-ons, a clear button, ' +
      'validation states and every native attribute passed straight through.',
  ),
  'general/rtl': {
    title: 'Right-to-left — Guild of Gleks UI',
    description:
      'Angular RTL support with no per-component configuration: dir="rtl" on the document or ' +
      'any region mirrors every component, portaled overlays included.',
  },
  'components/menu': component(
    'Menu',
    'An accessible Angular command menu — the trigger and the items are your own buttons, ' +
      'with full WAI-ARIA menu-button keyboard support and a panel nothing can clip.',
  ),
  'components/multiselect': component(
    'Multiselect',
    'Angular multi-select with chips, a filter, select-all, custom option templates and overlay ' +
      'positioning that flips when it runs out of room.',
  ),
  'components/paginator': component(
    'Paginator',
    'A standalone Angular paginator with window or ellipsis page ranges, an optional page-size ' +
      'select and translatable labels — used by gog-table or on its own.',
  ),
  'components/progressbar': component(
    'Progress Bar',
    'Determinate and indeterminate Angular progress bars, with label, size and colour driven by ' +
      'CSS custom properties.',
  ),
  'components/radio-group': component(
    'Radio Group',
    'An Angular radio group built on native inputs, so arrow-key navigation is the browser’s — ' +
      'with proper role, labelling and form integration on top.',
  ),
  'components/scroll': component(
    'Scroll',
    'A drop-in replacement for overflow: auto with a themeable overlay scrollbar — native ' +
      'scrolling, reach events and no hijacked wheel behaviour.',
  ),
  'components/select': component(
    'Select',
    'Angular select with an in-panel filter, custom option and chevron templates, typed values ' +
      'from your own DTOs and overlay positioning that stays on screen.',
  ),
  'components/skeleton': component(
    'Skeleton',
    'Loading placeholders in text, circle and rectangle shapes, with a shimmer that respects ' +
      'prefers-reduced-motion.',
  ),
  'components/slider': component(
    'Slider',
    'An Angular slider built on a real range input: single value or two-thumb range, vertical ' +
      'orientation, steps, a live value bubble and per-thumb aria labels.',
  ),
  'components/spinner': component(
    'Spinner',
    'A sized, themeable loading spinner plus an overlay variant that covers a container or the ' +
      'whole page while work is in flight.',
  ),
  'components/table': component(
    'Table',
    'Angular data table with sorting, pagination, row selection, custom cell templates and a lazy ' +
      'mode that hands sorting and paging to your server.',
  ),
  'components/tabs': component(
    'Tabs',
    'Angular tabs with projected tab content, lazy tab bodies, a scrollable header row and ' +
      'keyboard navigation that follows the WAI-ARIA tabs pattern.',
  ),
  'components/tag': component(
    'Tag',
    'Status tags in success, danger, warning and info flavours, with icons, sizes and shapes — ' +
      'for labelling rows, cards and list items.',
  ),
  'components/textarea': component(
    'Textarea',
    'Multi-line Angular text input with a floating label, clear button, resize control and ' +
      'validation states, sharing the input field’s look and tokens.',
  ),
  'components/toast': component(
    'Toast',
    'Angular toast notifications through a service: four corner positions, hover-pause, ' +
      'deduplication, stacking and an accessible live region.',
  ),
  'components/toggle': component(
    'Toggle',
    'An accessible Angular switch backed by a real checkbox input, with sizes, labels on either ' +
      'side and CSS-variable theming.',
  ),
  'components/tooltip': component(
    'Tooltip',
    'A tooltip directive for any element: four sides with automatic flipping, hover and focus ' +
      'triggers, delays, and text that screen readers actually announce.',
  ),
};
