import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/** One titled, linkable section of a component page. `app-doc-page` builds its contents list from these. */
@Component({
  selector: 'app-doc-section',
  imports: [RouterLink],
  template: `
    <h2 class="doc-section__title">
      <a class="doc-section__anchor" [routerLink]="[]" [fragment]="id()">{{ title() }}</a>
    </h2>
    @if (lead()) {
      <p class="doc-section__lead">{{ lead() }}</p>
    }
    <ng-content />
  `,
  styleUrl: './doc-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[id]': 'id()', class: 'doc-section' },
})
export class DocSection {
  readonly id = input.required<string>();
  readonly title = input.required<string>();
  /** One sentence at most: what the section shows that the tables do not say themselves. */
  readonly lead = input('');
}
