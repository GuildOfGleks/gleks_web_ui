import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'buttons',
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
    loadComponent: () => import('./pages/inputfield-page/inputfield-page').then((m) => m.InputfieldPage),
  },
  {
    path: 'select',
    loadComponent: () => import('./pages/select-page/select-page').then((m) => m.SelectPage),
  },
  {
    path: 'multiselect',
    loadComponent: () => import('./pages/multiselect-page/multiselect-page').then((m) => m.MultiselectPage),
  },
  {
    path: 'toast',
    loadComponent: () => import('./pages/toast-page/toast-page').then((m) => m.ToastPage),
  },
  {
    path: 'dialog',
    loadComponent: () => import('./pages/dialog-page/dialog-page').then((m) => m.DialogPage),
  },
  {
    path: '**',
    redirectTo: 'buttons',
  },
];
