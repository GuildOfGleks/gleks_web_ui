import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'themes',
  },
  {
    path: 'themes',
    loadComponent: () => import('./pages/themes-page/themes-page').then((m) => m.ThemesPage),
  },
  {
    path: 'buttons',
    loadComponent: () => import('./pages/button-page/button-page').then((m) => m.ButtonPage),
  },
  {
    path: 'checkbox',
    loadComponent: () => import('./pages/checkbox-page/checkbox-page').then((m) => m.CheckboxPage),
  },
  {
    path: 'inputfield',
    loadComponent: () =>
      import('./pages/inputfield-page/inputfield-page').then((m) => m.InputfieldPage),
  },
  {
    path: 'textarea',
    loadComponent: () => import('./pages/textarea-page/textarea-page').then((m) => m.TextareaPage),
  },
  {
    path: 'radio-group',
    loadComponent: () =>
      import('./pages/radio-group-page/radio-group-page').then((m) => m.RadioGroupPage),
  },
  {
    path: 'chip',
    loadComponent: () => import('./pages/chip-page/chip-page').then((m) => m.ChipPage),
  },
  {
    path: 'select',
    loadComponent: () => import('./pages/select-page/select-page').then((m) => m.SelectPage),
  },
  {
    path: 'multiselect',
    loadComponent: () =>
      import('./pages/multiselect-page/multiselect-page').then((m) => m.MultiselectPage),
  },
  {
    path: 'menu',
    loadComponent: () => import('./pages/menu-page/menu-page').then((m) => m.MenuPage),
  },
  {
    path: 'table',
    loadComponent: () => import('./pages/table-page/table-page').then((m) => m.TablePage),
  },
  {
    path: 'scroll',
    loadComponent: () => import('./pages/scroll-page/scroll-page').then((m) => m.ScrollPage),
  },
  {
    path: 'paginator',
    loadComponent: () =>
      import('./pages/paginator-page/paginator-page').then((m) => m.PaginatorPage),
  },
  {
    path: 'slider',
    loadComponent: () => import('./pages/slider-page/slider-page').then((m) => m.SliderPage),
  },
  {
    path: 'spinner',
    loadComponent: () => import('./pages/spinner-page/spinner-page').then((m) => m.SpinnerPage),
  },
  {
    path: 'skeleton',
    loadComponent: () => import('./pages/skeleton-page/skeleton-page').then((m) => m.SkeletonPage),
  },
  {
    path: 'accordion',
    loadComponent: () =>
      import('./pages/accordion-page/accordion-page').then((m) => m.AccordionPage),
  },
  {
    path: 'card',
    loadComponent: () => import('./pages/card-page/card-page').then((m) => m.CardPage),
  },
  {
    path: 'panel',
    loadComponent: () => import('./pages/panel-page/panel-page').then((m) => m.PanelPage),
  },
  {
    path: 'collapsible',
    loadComponent: () =>
      import('./pages/collapsible-page/collapsible-page').then((m) => m.CollapsiblePage),
  },
  {
    path: 'toast',
    loadComponent: () => import('./pages/toast-page/toast-page').then((m) => m.ToastPage),
  },
  {
    path: 'tooltip',
    loadComponent: () => import('./pages/tooltip-page/tooltip-page').then((m) => m.TooltipPage),
  },
  {
    path: 'tag',
    loadComponent: () => import('./pages/tag-page/tag-page').then((m) => m.TagPage),
  },
  {
    path: 'dialog',
    loadComponent: () => import('./pages/dialog-page/dialog-page').then((m) => m.DialogPage),
  },
  {
    path: 'autocomplete',
    loadComponent: () =>
      import('./pages/autocomplete-page/autocomplete-page').then((m) => m.AutocompletePage),
  },
  {
    path: 'datepicker',
    loadComponent: () =>
      import('./pages/datepicker-page/datepicker-page').then((m) => m.DatepickerPage),
  },
  {
    path: 'button-toggle',
    loadComponent: () =>
      import('./pages/button-toggle-page/button-toggle-page').then((m) => m.ButtonTogglePage),
  },
  {
    path: 'toggle',
    loadComponent: () => import('./pages/toggle-page/toggle-page').then((m) => m.TogglePage),
  },
  {
    path: 'tabs',
    loadComponent: () => import('./pages/tabs-page/tabs-page').then((m) => m.TabsPage),
  },
  {
    path: 'progressbar',
    loadComponent: () =>
      import('./pages/progressbar-page/progressbar-page').then((m) => m.ProgressbarPage),
  },
  {
    path: 'badge',
    loadComponent: () => import('./pages/badge-page/badge-page').then((m) => m.BadgePage),
  },
  {
    path: 'divider',
    loadComponent: () => import('./pages/divider-page/divider-page').then((m) => m.DividerPage),
  },
  {
    path: 'icon',
    loadComponent: () => import('./pages/icon-page/icon-page').then((m) => m.IconPage),
  },
  {
    path: 'global-config',
    loadComponent: () =>
      import('./pages/global-config-page/global-config-page').then((m) => m.GlobalConfigPage),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard-page/dashboard-page').then((m) => m.DashboardPage),
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings-page/settings-page').then((m) => m.SettingsPage),
  },
  {
    path: 'catalog',
    loadComponent: () => import('./pages/catalog-page/catalog-page').then((m) => m.CatalogPage),
  },
  {
    path: 'onboarding',
    loadComponent: () =>
      import('./pages/onboarding-page/onboarding-page').then((m) => m.OnboardingPage),
  },
  {
    path: 'benchmark',
    loadComponent: () =>
      import('./pages/benchmark-index-page/benchmark-index-page').then((m) => m.BenchmarkIndexPage),
  },
  {
    path: 'benchmark/table',
    loadComponent: () =>
      import('./pages/benchmark-table-page/benchmark-table-page').then((m) => m.BenchmarkTablePage),
  },
  {
    path: 'benchmark/accordion',
    loadComponent: () =>
      import('./pages/benchmark-accordion-page/benchmark-accordion-page').then(
        (m) => m.BenchmarkAccordionPage,
      ),
  },
  {
    path: 'benchmark/dropdown',
    loadComponent: () =>
      import('./pages/benchmark-dropdown-page/benchmark-dropdown-page').then(
        (m) => m.BenchmarkDropdownPage,
      ),
  },
  {
    path: 'benchmark/instances',
    loadComponent: () =>
      import('./pages/benchmark-instances-page/benchmark-instances-page').then(
        (m) => m.BenchmarkInstancesPage,
      ),
  },
  {
    path: '**',
    redirectTo: 'themes',
  },
];
