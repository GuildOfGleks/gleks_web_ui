import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/showcase-page/showcase-page').then((m) => m.ShowcasePage),
  },
];
