import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  ButtonComponent,
  GogPanelFooterDirective,
  GogPanelHeaderDirective,
  PanelComponent,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, GogPanelFooterDirective, GogPanelHeaderDirective, PanelComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelLoadingExample {
  protected readonly loading = signal(true);

  protected toggle(): void {
    this.loading.update((value) => !value);
  }
}
