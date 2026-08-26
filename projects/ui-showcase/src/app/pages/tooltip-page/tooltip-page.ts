import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ButtonComponent,
  ChipComponent,
  CheckboxComponent,
  GogDropdownOption,
  GogPanelHeaderDirective,
  GogTooltipDirective,
  GogTooltipPosition,
  IconComponent,
  PanelComponent,
  SelectComponent,
  SliderComponent,
  TagComponent,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-tooltip-page',
  imports: [
    ButtonComponent,
    ChipComponent,
    CheckboxComponent,
    GogPanelHeaderDirective,
    GogTooltipDirective,
    IconComponent,
    PanelComponent,
    RouterLink,
    SelectComponent,
    SliderComponent,
    TagComponent,
  ],
  templateUrl: './tooltip-page.html',
  styleUrl: './tooltip-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipPage {
  protected readonly positionOptions: GogDropdownOption[] = [
    { id: 'auto', name: 'Auto' },
    { id: 'top', name: 'Top' },
    { id: 'bottom', name: 'Bottom' },
    { id: 'left', name: 'Left' },
    { id: 'right', name: 'Right' },
  ];

  // Playground
  protected readonly playgroundPosition = signal<GogTooltipPosition>('auto');
  protected readonly playgroundShowDelay = signal(300);
  protected readonly playgroundHideDelay = signal(100);
  protected readonly playgroundDisabled = signal(false);

  // Content & sizing
  protected readonly longText =
    'Deploys run on a rolling schedule: every merge to main queues a build, staging picks ' +
    'it up automatically, and production requires a manual approval from a workspace admin ' +
    'before it ships. Rollbacks go through the same approval step.';
  protected readonly unbreakableText =
    'Supercalifragilisticexpialidocioussupercalifragilisticexpialidocious';

  protected setPlaygroundPosition(value: string | number | null): void {
    if (value === null) return;
    this.playgroundPosition.set(value as GogTooltipPosition);
  }
}
