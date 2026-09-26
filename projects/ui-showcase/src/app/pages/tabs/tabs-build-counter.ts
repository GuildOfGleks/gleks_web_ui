import { ChangeDetectionStrategy, Component, type OnInit, input, output } from '@angular/core';

/** Reports each time it is built, so the page can show when a tab's content is created. */
@Component({
  selector: 'app-tabs-build-counter',
  template: `<p class="tabs-build-counter">{{ name() }} content.</p>`,
  styles: `
    .tabs-build-counter {
      margin: var(--gog-space-8) 0 0;
      color: var(--gog-muted-text-color);
      font-size: var(--gog-text-sm);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsBuildCounter implements OnInit {
  readonly name = input.required<string>();
  readonly built = output<string>();

  ngOnInit(): void {
    // Deferred: the page renders the count in the same pass that builds this component, and a
    // write to it mid-pass would be an ExpressionChanged error in development.
    queueMicrotask(() => this.built.emit(this.name()));
  }
}
