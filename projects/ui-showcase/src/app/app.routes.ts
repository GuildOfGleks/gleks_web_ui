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
    path: 'collapsible',
    loadComponent: () =>
      import('./pages/collapsible-page/collapsible-page').then((m) => m.CollapsiblePage),
  },
  {
    path: 'toast',
    loadComponent: () => import('./pages/toast-page/toast-page').then((m) => m.ToastPage),
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
    path: '**',
    redirectTo: 'themes',
  },
];
