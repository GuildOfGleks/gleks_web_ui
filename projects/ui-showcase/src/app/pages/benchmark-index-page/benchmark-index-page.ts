import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface BenchmarkLink {
  path: string;
  title: string;
  description: string;
}

const LINKS: BenchmarkLink[] = [
  {
    path: '/benchmark/table',
    title: 'gog-table',
    description: 'Paginated vs. every row as a real <tr> — the "500,000 rows" question.',
  },
  {
    path: '/benchmark/accordion',
    title: 'gog-accordion',
    description: 'Every item is always real DOM — no pagination to fall back on.',
  },
  {
    path: '/benchmark/dropdown',
    title: 'gog-select / gog-multiselect / gog-autocomplete',
    description: 'Setting a huge options array is cheap; opening the panel renders all of it.',
  },
  {
    path: '/benchmark/instances',
    title: 'Everything else',
    description:
      'N side-by-side instances of one control — button, checkbox, tag, tooltip, and more.',
  },
];

@Component({
  selector: 'app-benchmark-index-page',
  imports: [RouterLink],
  templateUrl: './benchmark-index-page.html',
  styleUrl: './benchmark-index-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BenchmarkIndexPage {
  protected readonly links = LINKS;
}
