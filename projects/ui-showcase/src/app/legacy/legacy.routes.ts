import { Routes } from '@angular/router';

/**
 * The pages of the showcase before its rebuild, mounted under `/legacy` unchanged.
 *
 * Each one is deleted when the new page for its component replaces it; this file empties with them.
 */
export const legacyRoutes: Routes = [
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
    path: 'dialog',
    loadComponent: () => import('./pages/dialog-page/dialog-page').then((m) => m.DialogPage),
  },
  {
    path: 'tabs',
    loadComponent: () => import('./pages/tabs-page/tabs-page').then((m) => m.TabsPage),
  },
  {
    path: 'ripple',
    loadComponent: () => import('./pages/ripple-page/ripple-page').then((m) => m.RipplePage),
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
];
