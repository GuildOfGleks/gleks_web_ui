import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { PAGES } from '../pages/pages';
import { describeUnit, unitById } from '../registry/registry';
import { DocApiTable } from './doc-api';
import { DocSection } from './doc-section';
import { DocTokens } from './doc-tokens';

/**
 * The frame every component page shares, in a fixed order:
 *
 * 1. header — group, name, import line, the unit's parts (all from the registry);
 * 2. contents;
 * 3. the page's own `app-doc-section`s — states, then whatever else the component has;
 * 4. API and 5. tokens — rendered from `PAGES`, never written on the page itself.
 */
@Component({
  selector: 'app-doc-page',
  imports: [RouterLink, DocApiTable, DocSection, DocTokens],
  templateUrl: './doc-page.html',
  styleUrl: './doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocPage {
  /** Registry unit id; must be listed in `PAGES`. */
  readonly unit = input.required<string>();

  protected readonly row = computed(() => describeUnit(unitById(this.unit())));
  protected readonly entry = computed(() => {
    const entry = PAGES[this.unit()];
    if (!entry) throw new Error(`'${this.unit()}' has no entry in PAGES`);
    return entry;
  });

  protected readonly importLine = computed(() => {
    const row = this.row();
    const symbols = row.parts.map((part) => part.symbol).sort();
    return `import { ${symbols.join(', ')} } from '${row.importPath}';`;
  });

  private readonly sections = contentChildren(DocSection);
  protected readonly contents = computed(() => [
    ...this.sections().map((section) => ({ id: section.id(), title: section.title() })),
    { id: 'api', title: 'API' },
    { id: 'tokens', title: 'Tokens' },
  ]);
}
