import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import {
  ButtonComponent,
  CheckboxComponent,
  ChipComponent,
  GogDropdownOption,
  IconComponent,
  InputfieldComponent,
  SelectComponent,
  SliderComponent,
  SpinnerComponent,
  TagComponent,
} from '@guildofgleks/ui';

import { showcaseThemes } from '../../showcase-themes';

@Component({
  selector: 'app-themes-page',
  imports: [
    ButtonComponent,
    CheckboxComponent,
    ChipComponent,
    IconComponent,
    InputfieldComponent,
    SelectComponent,
    SliderComponent,
    SpinnerComponent,
    TagComponent,
  ],
  templateUrl: './themes-page.html',
  styleUrl: './themes-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemesPage {
  protected readonly themes = showcaseThemes.filter(
    (theme) => theme.name !== 'light' && theme.name !== 'dark',
  );
  /**
   * The six heights of the elevation ladder (21.12.0). Rendered as a row per theme so the set
   * reads as a ladder — the point of the family is the relationship between the steps, which no
   * single component can show.
   */
  protected readonly elevationSteps = [0, 1, 2, 3, 4, 5];
  protected readonly isChecked = signal(true);
  protected readonly intensity = signal(72);
  protected readonly search = signal('Neon pulse');
  protected readonly mode = signal<string | number | null>('recon');
  protected readonly modes: GogDropdownOption[] = [
    { id: 'recon', name: 'Recon mode' },
    { id: 'siege', name: 'Siege mode' },
    { id: 'command', name: 'Command mode' },
  ];
}
