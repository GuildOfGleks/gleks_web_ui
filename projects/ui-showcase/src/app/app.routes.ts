import { Routes } from '@angular/router';

import { legacyRoutes } from './legacy/legacy.routes';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'legacy' },
  { path: 'legacy', children: legacyRoutes },
  { path: '**', redirectTo: 'legacy' },
];
