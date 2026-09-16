import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  ButtonComponent,
  DividerComponent,
  GogDividerVariant,
  GogOrientation,
  GogPanelHeaderDirective,
  PanelComponent,
  TagComponent,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-divider-page',
  imports: [
    ButtonComponent,
    DividerComponent,
    GogPanelHeaderDirective,
    PanelComponent,
    TagComponent,
  ],
  templateUrl: './divider-page.html',
  styleUrl: './divider-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DividerPage {
  protected readonly variants: GogDividerVariant[] = ['solid', 'dashed', 'dotted'];
  protected readonly orientations: GogOrientation[] = ['horizontal', 'vertical'];
}
