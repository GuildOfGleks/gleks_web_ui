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
    path: 'components/accordion',
    loadComponent: () =>
      import('./components/pages/accordion-doc-page/accordion-doc-page').then(
        (m) => m.AccordionDocPage,
      ),
  },
  {
    path: 'components/button',
    loadComponent: () =>
      import('./components/pages/button-doc-page/button-doc-page').then((m) => m.ButtonDocPage),
  },
  {
    path: 'components/checkbox',
    loadComponent: () =>
      import('./components/pages/checkbox-doc-page/checkbox-doc-page').then(
        (m) => m.CheckboxDocPage,
      ),
  },
  {
    path: 'components/chip',
    loadComponent: () =>
      import('./components/pages/chip-doc-page/chip-doc-page').then((m) => m.ChipDocPage),
  },
  {
    path: 'components/dialog',
    loadComponent: () =>
      import('./components/pages/dialog-doc-page/dialog-doc-page').then((m) => m.DialogDocPage),
  },
  {
    path: 'components/icon',
    loadComponent: () =>
      import('./components/pages/icon-doc-page/icon-doc-page').then((m) => m.IconDocPage),
  },
  {
    path: 'components/inputfield',
    loadComponent: () =>
      import('./components/pages/inputfield-doc-page/inputfield-doc-page').then(
        (m) => m.InputfieldDocPage,
      ),
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
