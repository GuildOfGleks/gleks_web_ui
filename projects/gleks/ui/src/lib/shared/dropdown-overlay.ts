import { ApplicationRef, EmbeddedViewRef, TemplateRef } from '@angular/core';

/**
 * Renders a template into `document.body` while keeping it wired to the declaring
 * component: the view is stamped with that component's style encapsulation and reads
 * its signals directly.
 *
 * That is the whole point of doing it this way rather than with a second, portal-only
 * component: one `<ng-template>` can serve both the inline and the appended-to-body
 * dropdown, so the option markup exists once and cannot drift between the two modes,
 * and selection state needs no manual field-syncing to stay in step.
 */
export class GogDropdownOverlay {
  private hostEl: HTMLElement | null = null;
  private viewRef: EmbeddedViewRef<unknown> | null = null;

  constructor(
    private readonly appRef: ApplicationRef,
    private readonly document: Document,
  ) {}

  /** The `<body>` child holding the rendered panel, or null while detached. */
  get hostElement(): HTMLElement | null {
    return this.hostEl;
  }

  get isAttached(): boolean {
    return this.viewRef !== null;
  }

  attach(template: TemplateRef<unknown>): void {
    this.detach();

    this.hostEl = this.document.createElement('div');
    this.hostEl.classList.add('gog-overlay-host');
    this.document.body.appendChild(this.hostEl);

    this.viewRef = template.createEmbeddedView({});
    // Attached as its own change-detection root so signal reads inside the panel still
    // mark it dirty even though its DOM no longer sits under the declaring component.
    this.appRef.attachView(this.viewRef);

    for (const node of this.viewRef.rootNodes as Node[]) {
      this.hostEl.appendChild(node);
    }

    this.viewRef.detectChanges();
  }

  detach(): void {
    if (this.viewRef) {
      this.appRef.detachView(this.viewRef);
      this.viewRef.destroy();
      this.viewRef = null;
    }

    this.hostEl?.remove();
    this.hostEl = null;
  }
}
