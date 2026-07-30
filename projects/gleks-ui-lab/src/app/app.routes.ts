import { Component, inject } from '@angular/core';
import { ActivatedRoute, Routes } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

// 1. Временный компонент-заглушка прямо в этом файле
@Component({
  standalone: true,
  template: `
    <div
      style="
      padding: 32px;
      border: 1px dashed var(--gog-border-color);
      border-radius: var(--gog-radius);
      background: var(--gog-surface-color);
    "
    >
      <h2
        style="margin-top: 0; text-transform: uppercase; color: var(--gog-accent-color);"
        class="font-heading"
      >
        🧪 Образец: {{ componentName() }}
      </h2>
      <p style="color: var(--gog-muted-text-color); margin-bottom: 0;">
        Страница документации и интерактивный стенд для компонента
        <strong style="color: var(--gog-text-color);">{{ componentName() }}</strong>
        находится в процессе сборки в лаборатории.
      </p>
    </div>
  `,
})
export class SpecimenPlaceholder {
  private route = inject(ActivatedRoute);

  componentName = toSignal(this.route.params.pipe(map((params) => params['name'])), {
    initialValue: '',
  });
}

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'components/button',
    pathMatch: 'full',
  },

  {
    path: 'components/:name',
    component: SpecimenPlaceholder,
  },

  {
    path: '**',
    redirectTo: 'components/button',
  },
];
