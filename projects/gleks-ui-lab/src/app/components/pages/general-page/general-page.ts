import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { httpResource } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { GENERAL_NAV_ITEMS } from '../../shared/nav-data';
import { MarkdownComponent } from '../../shared/markdown/markdown';

const DOCUMENTED_SLUGS = new Set(['overview', 'getting-started', 'global-config', 'compare-full']);

@Component({
  selector: 'app-general-page',
  imports: [MarkdownComponent],
  templateUrl: './general-page.html',
  styleUrl: './general-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneralPage {
  private readonly route = inject(ActivatedRoute);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly slug = toSignal(
    this.route.params.pipe(map((params) => params['slug'] as string)),
    { initialValue: '' },
  );

  private readonly fragment = toSignal(this.route.fragment, { initialValue: null });

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

  constructor() {
    // The markdown for a fragment's target heading loads asynchronously
    // (httpResource), so it doesn't exist in the DOM yet when the router
    // itself would normally handle a `#fragment` navigation — scroll to it
    // manually once the content has actually rendered.
    effect(() => {
      const id = this.fragment();
      if (!id || !this.hasContent() || !this.isBrowser) return;

      // The markdown's [innerHTML] binding commits in its own change-detection
      // pass, which can land after this effect runs — defer one tick so the
      // target heading actually exists before scrolling to it.
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'instant', block: 'start' });
      });
    });
  }
}
