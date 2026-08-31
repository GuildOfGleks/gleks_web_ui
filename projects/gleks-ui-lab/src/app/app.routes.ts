import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'general/overview',
    pathMatch: 'full',
  },
  {
    path: 'general/overview',
    loadComponent: () =>
      import('./components/pages/overview-page/overview-page').then((m) => m.OverviewPage),
  },
  {
    path: 'general/getting-started',
    loadComponent: () =>
      import('./components/pages/getting-started-page/getting-started-page').then(
        (m) => m.GettingStartedPage,
      ),
  },
  {
    path: 'general/theming',
    loadComponent: () =>
      import('./components/pages/theming-page/theming-page').then((m) => m.ThemingPage),
  },
  {
    path: 'general/theme-generator',
    loadComponent: () =>
      import('./components/pages/theme-generator-page/theme-generator-page').then(
        (m) => m.ThemeGeneratorPage,
      ),
  },
  {
    // Above the `general/:slug` catch-all, like `faq` and `releases`: it is a routed component
    // with a live demo, not a markdown doc.
    path: 'general/rtl',
    loadComponent: () => import('./components/pages/rtl-page/rtl-page').then((m) => m.RtlPage),
  },
  {
    path: 'general/compare',
    loadComponent: () =>
      import('./components/pages/compare-page/compare-page').then((m) => m.ComparePage),
  },
  {
    // Was a markdown doc under `general/:slug` until the answers moved into `gog-collapsible`
    // items — must stay above that catch-all, which would otherwise match it and render nothing.
    path: 'general/faq',
    loadComponent: () => import('./components/pages/faq-page/faq-page').then((m) => m.FaqPage),
  },
  {
    // Renders the package's own CHANGELOG.md, not a markdown doc of ours — so it is a routed
    // component and, like `faq`, has to stay above the `general/:slug` catch-all.
    path: 'general/releases',
    loadComponent: () =>
      import('./components/pages/releases-page/releases-page').then((m) => m.ReleasesPage),
  },
  {
    // Renders the package's own AGENTS.md — same reason as `releases`, above.
    path: 'general/agents',
    loadComponent: () =>
      import('./components/pages/agents-page/agents-page').then((m) => m.AgentsPage),
  },
  {
    path: 'general/:slug',
    loadComponent: () =>
      import('./components/pages/general-page/general-page').then((m) => m.GeneralPage),
  },
  {
    path: 'components/accordion',
    loadComponent: () =>
      import('./components/pages/accordion-doc-page/accordion-doc-page').then(
        (m) => m.AccordionDocPage,
      ),
  },
  {
    path: 'components/autocomplete',
    loadComponent: () =>
      import('./components/pages/autocomplete-doc-page/autocomplete-doc-page').then(
        (m) => m.AutocompleteDocPage,
      ),
  },
  {
    path: 'components/badge',
    loadComponent: () =>
      import('./components/pages/badge-doc-page/badge-doc-page').then((m) => m.BadgeDocPage),
  },
  {
    path: 'components/button',
    loadComponent: () =>
      import('./components/pages/button-doc-page/button-doc-page').then((m) => m.ButtonDocPage),
  },
  {
    path: 'components/button-toggle',
    loadComponent: () =>
      import('./components/pages/button-toggle-doc-page/button-toggle-doc-page').then(
        (m) => m.ButtonToggleDocPage,
      ),
  },
  {
    path: 'components/calendar',
    loadComponent: () =>
      import('./components/pages/calendar-doc-page/calendar-doc-page').then(
        (m) => m.CalendarDocPage,
      ),
  },
  {
    path: 'components/card',
    loadComponent: () =>
      import('./components/pages/card-doc-page/card-doc-page').then((m) => m.CardDocPage),
  },
  {
    path: 'components/checkbox',
    loadComponent: () =>
      import('./components/pages/checkbox-doc-page/checkbox-doc-page').then(
        (m) => m.CheckboxDocPage,
      ),
  },
  {
    path: 'components/chip',
    loadComponent: () =>
      import('./components/pages/chip-doc-page/chip-doc-page').then((m) => m.ChipDocPage),
  },
  {
    path: 'components/collapsible',
    loadComponent: () =>
      import('./components/pages/collapsible-doc-page/collapsible-doc-page').then(
        (m) => m.CollapsibleDocPage,
      ),
  },
  {
    path: 'components/datepicker',
    loadComponent: () =>
      import('./components/pages/datepicker-doc-page/datepicker-doc-page').then(
        (m) => m.DatepickerDocPage,
      ),
  },
  {
    path: 'components/dialog',
    loadComponent: () =>
      import('./components/pages/dialog-doc-page/dialog-doc-page').then((m) => m.DialogDocPage),
  },
  {
    path: 'components/divider',
    loadComponent: () =>
      import('./components/pages/divider-doc-page/divider-doc-page').then((m) => m.DividerDocPage),
  },
  {
    path: 'components/icon',
    loadComponent: () =>
      import('./components/pages/icon-doc-page/icon-doc-page').then((m) => m.IconDocPage),
  },
  {
    path: 'components/inputfield',
    loadComponent: () =>
      import('./components/pages/inputfield-doc-page/inputfield-doc-page').then(
        (m) => m.InputfieldDocPage,
      ),
  },
  {
    path: 'components/menu',
    loadComponent: () =>
      import('./components/pages/menu-doc-page/menu-doc-page').then((m) => m.MenuDocPage),
  },
  {
    path: 'components/multiselect',
    loadComponent: () =>
      import('./components/pages/multiselect-doc-page/multiselect-doc-page').then(
        (m) => m.MultiselectDocPage,
      ),
  },
  {
    path: 'components/panel',
    loadComponent: () =>
      import('./components/pages/panel-doc-page/panel-doc-page').then((m) => m.PanelDocPage),
  },
  {
    path: 'components/paginator',
    loadComponent: () =>
      import('./components/pages/paginator-doc-page/paginator-doc-page').then(
        (m) => m.PaginatorDocPage,
      ),
  },
  {
    path: 'components/progressbar',
    loadComponent: () =>
      import('./components/pages/progressbar-doc-page/progressbar-doc-page').then(
        (m) => m.ProgressbarDocPage,
      ),
  },
  {
    path: 'components/radio-group',
    loadComponent: () =>
      import('./components/pages/radio-group-doc-page/radio-group-doc-page').then(
        (m) => m.RadioGroupDocPage,
      ),
  },
  {
    path: 'components/ripple',
    loadComponent: () =>
      import('./components/pages/ripple-doc-page/ripple-doc-page').then((m) => m.RippleDocPage),
  },
  {
    path: 'components/scroll',
    loadComponent: () =>
      import('./components/pages/scroll-doc-page/scroll-doc-page').then((m) => m.ScrollDocPage),
  },
  {
    path: 'components/select',
    loadComponent: () =>
      import('./components/pages/select-doc-page/select-doc-page').then((m) => m.SelectDocPage),
  },
  {
    path: 'components/skeleton',
    loadComponent: () =>
      import('./components/pages/skeleton-doc-page/skeleton-doc-page').then(
        (m) => m.SkeletonDocPage,
      ),
  },
  {
    path: 'components/slider',
    loadComponent: () =>
      import('./components/pages/slider-doc-page/slider-doc-page').then((m) => m.SliderDocPage),
  },
  {
    path: 'components/spinner',
    loadComponent: () =>
      import('./components/pages/spinner-doc-page/spinner-doc-page').then((m) => m.SpinnerDocPage),
  },
  {
    path: 'components/table',
    loadComponent: () =>
      import('./components/pages/table-doc-page/table-doc-page').then((m) => m.TableDocPage),
  },
  {
    path: 'components/tabs',
    loadComponent: () =>
      import('./components/pages/tabs-doc-page/tabs-doc-page').then((m) => m.TabsDocPage),
  },
  {
    path: 'components/tag',
    loadComponent: () =>
      import('./components/pages/tag-doc-page/tag-doc-page').then((m) => m.TagDocPage),
  },
  {
    path: 'components/textarea',
    loadComponent: () =>
      import('./components/pages/textarea-doc-page/textarea-doc-page').then(
        (m) => m.TextareaDocPage,
      ),
  },
  {
    path: 'components/toast',
    loadComponent: () =>
      import('./components/pages/toast-doc-page/toast-doc-page').then((m) => m.ToastDocPage),
  },
  {
    path: 'components/toggle',
    loadComponent: () =>
      import('./components/pages/toggle-doc-page/toggle-doc-page').then((m) => m.ToggleDocPage),
  },
  {
    path: 'components/tooltip',
    loadComponent: () =>
      import('./components/pages/tooltip-doc-page/tooltip-doc-page').then((m) => m.TooltipDocPage),
  },
  {
    path: 'components/:name',
    loadComponent: () =>
      import('./components/pages/component-preview-page/component-preview-page').then(
        (m) => m.ComponentPreviewPage,
      ),
  },
  {
    // Renders a real not-found page rather than redirecting to the overview. The redirect made
    // every unknown URL answer `200` on an indexable page — a soft 404, which turns each typo
    // and stale inbound link into another duplicate entry point. The **404 status** that goes
    // with this lives in `app.routes.server.ts`; without it the page is cosmetic.
    path: '**',
    loadComponent: () =>
      import('./components/pages/not-found-page/not-found-page').then((m) => m.NotFoundPage),
    // Read by `SeoService`, which is otherwise driven purely by the path table in `seo-data.ts`.
    // A flag on the route rather than a path pattern in the service: this is the only place that
    // knows which URLs are unmatched, and duplicating that as "not `general/x` or `components/x`"
    // would be a second copy of the routing rules, in a file that has no reason to hold them.
    data: { notFound: true },
  },
];
