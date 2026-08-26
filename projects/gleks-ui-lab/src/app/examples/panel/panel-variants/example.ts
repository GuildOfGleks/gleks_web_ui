import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  GogPanelHeaderDirective,
  GogSize,
  GogSurfaceVariant,
  PanelComponent,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [GogPanelHeaderDirective, PanelComponent],
  templateUrl: './example.html',
  styleUrl: './example.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelVariantsExample {
  protected readonly variants: readonly GogSurfaceVariant[] = ['outlined', 'elevated', 'filled'];
  protected readonly sizes: readonly GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
}
