import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
} from '@angular/core';

const REPORTED = /^(aria-|role$|disabled$|readonly$|type$|inputmode$|spellcheck$|tabindex$|href$)/;

/**
 * Renders its content and prints the accessibility-relevant attributes of the element matching
 * `target` inside it, as the browser has them — kept live, so a state change shows up here.
 */
@Component({
  selector: 'app-doc-attrs',
  template: `
    <div class="doc-attrs__example"><ng-content /></div>
    <code class="doc-attrs__out">{{ attributes() }}</code>
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--gog-space-8) var(--gog-space-16);
    }

    .doc-attrs__out {
      color: var(--gog-muted-text-color);
      font-size: var(--gog-text-xs);
      white-space: pre-wrap;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocAttrs {
  /** CSS selector, resolved inside this component's content. */
  readonly target = input.required<string>();

  /** Server render and first paint: nothing measured yet. */
  protected readonly attributes = signal('…');

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const read = () => {
        const element = host.querySelector(this.target());
        if (!element) {
          this.attributes.set(`no element matches ${this.target()}`);
          return;
        }
        const pairs = Array.from(element.attributes)
          .filter((attribute) => REPORTED.test(attribute.name))
          .map((attribute) => `${attribute.name}="${attribute.value}"`);
        this.attributes.set(pairs.join(' ') || '(none)');
      };
      read();
      const observer = new MutationObserver(read);
      observer.observe(host, { subtree: true, attributes: true, childList: true });
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
