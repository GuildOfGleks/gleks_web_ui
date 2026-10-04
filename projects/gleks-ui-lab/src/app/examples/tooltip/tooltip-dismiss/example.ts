import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonComponent, GogTooltipDirective, ToggleComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, GogTooltipDirective, ToggleComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipDismissExample {
  protected readonly muted = signal(false);
}
