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
    path: 'paginator',
    loadComponent: () =>
      import('./pages/paginator-page/paginator-page').then((m) => m.PaginatorPage),
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
