import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

const PAGE_TITLES: Record<string, string> = {
  overview: 'Overview',
  'getting-started': 'Getting Started',
  compare: 'Compare with Material and PrimeNG',
  faq: 'FAQ',
};

@Component({
  selector: 'app-general-page',
  templateUrl: './general-page.html',
  styleUrl: './general-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneralPage {
  private readonly route = inject(ActivatedRoute);

  protected readonly title = toSignal(
    this.route.params.pipe(map((params) => PAGE_TITLES[params['slug']] ?? params['slug'])),
    { initialValue: '' },
  );
}
