import { Routes } from '@angular/router';

import { legacyRoutes } from './legacy/legacy.routes';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./overview/overview-page').then((m) => m.OverviewPage),
  },
  { path: 'legacy', children: legacyRoutes },
  { path: '**', redirectTo: '' },
];
