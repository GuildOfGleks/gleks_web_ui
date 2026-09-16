import { Routes } from '@angular/router';

import { legacyRoutes } from './legacy/legacy.routes';
import { PAGES } from './pages/pages';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./overview/overview-page').then((m) => m.OverviewPage),
  },
  ...Object.entries(PAGES).map(([id, page]) => ({ path: id, loadComponent: page.load })),
  { path: 'legacy', children: legacyRoutes },
  { path: '**', redirectTo: '' },
];
