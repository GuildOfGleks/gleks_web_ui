import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { httpResource } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { GENERAL_NAV_ITEMS } from '../../shared/nav-data';
import { MarkdownComponent } from '../../shared/markdown/markdown';

const DOCUMENTED_SLUGS = new Set(['overview', 'getting-started']);

@Component({
  selector: 'app-general-page',
  imports: [MarkdownComponent],
  templateUrl: './general-page.html',
  styleUrl: './general-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneralPage {
  private readonly route = inject(ActivatedRoute);

  protected readonly slug = toSignal(
    this.route.params.pipe(map((params) => params['slug'] as string)),
    { initialValue: '' },
  );

  protected readonly title = computed(
    () =>
      GENERAL_NAV_ITEMS.find((item) => item.path === `general/${this.slug()}`)?.label ??
      this.slug(),
  );

  private readonly content = httpResource.text(() =>
    DOCUMENTED_SLUGS.has(this.slug()) ? `/docs/${this.slug()}.md` : undefined,
  );

  protected readonly markdown = computed(() => this.content.value());
  protected readonly hasContent = computed(() => this.content.status() === 'resolved');
}
