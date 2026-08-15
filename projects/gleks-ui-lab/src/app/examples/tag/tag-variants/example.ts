import { Component } from '@angular/core';
import { GogTagVariant, TagComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [TagComponent],
})
export class TagVariantsExample {
  protected readonly variants: GogTagVariant[] = ['success', 'danger', 'warning', 'info'];
  protected readonly variantIcons: Record<GogTagVariant, string> = {
    success: 'check',
    danger: 'error',
    warning: 'warning',
    info: 'info',
  };
}
