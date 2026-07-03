import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, TemplateRef, computed, input } from '@angular/core';

export type GogIconName =
  | 'check'
  | 'close'
  | 'chevron-down'
  | 'chevron-up'
  | 'sort'
  | 'sort-up'
  | 'sort-down'
  | 'success'
  | 'error'
  | 'warning'
  | 'info';

@Component({
  selector: 'gog-icon',
  imports: [NgTemplateOutlet],
  template: `
    @if (template(); as iconTpl) {
      <ng-container *ngTemplateOutlet="iconTpl" />
    } @else {
      <svg
        class="gog-icon__svg"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        @switch (name()) {
          @case ('check') {
            <path
              d="M3 8.5L6.5 12L13 4"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          }
          @case ('close') {
            <path
              d="M4 4L12 12M12 4L4 12"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          }
          @case ('chevron-up') {
            <path
              d="M4 10L8 6L12 10"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          }
          @case ('chevron-down') {
            <path
              d="M4 6L8 10L12 6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          }
          @case ('sort-up') {
            <path d="M8 3L4.5 6.5H11.5L8 3Z" fill="currentColor" />
          }
          @case ('sort-down') {
            <path d="M8 13L11.5 9.5H4.5L8 13Z" fill="currentColor" />
          }
          @case ('sort') {
            <path d="M5 5.5H11M5 8H11M5 10.5H11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          }
          @case ('success') {
            <path
              d="M3 8.5L6.2 11.7L13 4.9"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          }
          @case ('error') {
            <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          }
          @case ('warning') {
            <path d="M8 3L14 13H2L8 3Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
            <path d="M8 6V9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
          }
          @case ('info') {
            <circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="1.5" />
            <path d="M8 7V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            <circle cx="8" cy="5.25" r="0.75" fill="currentColor" />
          }
        }
      </svg>
    }
  `,
  styleUrl: './icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'gog-icon',
    '[attr.aria-hidden]': 'ariaHidden() ? "true" : null',
    '[attr.aria-label]': 'ariaHidden() ? null : ariaLabel()',
  },
})
export class IconComponent {
  readonly name = input<GogIconName>('close');
  readonly template = input<TemplateRef<unknown> | null>(null);
  readonly title = input('');
  readonly ariaHidden = input(true);

  protected readonly ariaLabel = computed(() => (this.ariaHidden() ? null : this.title() || this.name()));
}
