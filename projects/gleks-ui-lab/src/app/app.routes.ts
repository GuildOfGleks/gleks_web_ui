import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'general/overview',
    pathMatch: 'full',
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
