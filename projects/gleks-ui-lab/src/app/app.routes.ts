import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'general/overview',
    pathMatch: 'full',
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
    path: 'general/:slug',
    loadComponent: () =>
      import('./components/pages/general-page/general-page').then((m) => m.GeneralPage),
  },
  {
    path: 'components/:name',
    loadComponent: () =>
      import('./components/pages/component-preview-page/component-preview-page').then(
        (m) => m.ComponentPreviewPage,
      ),
  },
  {
    path: '**',
    redirectTo: 'general/overview',
  },
];
