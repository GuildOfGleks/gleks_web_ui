import { Routes } from '@angular/router';

import { PAGES } from './pages/pages';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./overview/overview-page').then((m) => m.OverviewPage),
  },
  {
    path: 'specimen',
    loadComponent: () => import('./specimen/specimen-page').then((m) => m.SpecimenPage),
  },
  ...Object.entries(PAGES).map(([id, page]) => ({ path: id, loadComponent: page.load })),
  { path: '**', redirectTo: '' },
];
