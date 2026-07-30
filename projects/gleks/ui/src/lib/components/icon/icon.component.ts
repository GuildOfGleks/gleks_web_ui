import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  computed,
  input,
  inject,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { GogIconName, ICON_DEFS } from '../../shared/icons';

export type { GogIconName } from '../../shared/icons';

@Component({
  selector: 'gog-icon',
  imports: [NgTemplateOutlet],
  template: `
    @if (template(); as iconTpl) {
      <ng-container *ngTemplateOutlet="iconTpl" />
    } @else {
      <span [innerHTML]="iconSvg()"></span>
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
  private readonly sanitizer = inject(DomSanitizer);

  readonly name = input<GogIconName>('close');
  readonly template = input<TemplateRef<unknown> | null>(null);
  readonly title = input('');
  readonly ariaHidden = input(true);

  protected readonly ariaLabel = computed(() =>
    this.ariaHidden() ? null : this.title() || this.name(),
  );

  protected readonly iconSvg = computed(() =>
    this.sanitizer.bypassSecurityTrustHtml(ICON_DEFS[this.name()]),
  );
}
