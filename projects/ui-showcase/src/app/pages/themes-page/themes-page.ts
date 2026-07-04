import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import {
  ButtonComponent,
  CheckboxComponent,
  ChipComponent,
  GogSelectOption,
  IconComponent,
  InputfieldComponent,
  SelectComponent,
  SliderComponent,
  SpinnerComponent,
  TagComponent,
} from '@gleks/ui';

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
  protected readonly themes = showcaseThemes.filter((theme) => theme.name !== 'light');
  protected readonly isChecked = signal(true);
  protected readonly intensity = signal(72);
  protected readonly search = signal('Neon pulse');
  protected readonly mode = signal<string | number | null>('recon');
  protected readonly modes: GogSelectOption[] = [
    { id: 'recon', name: 'Recon mode' },
    { id: 'siege', name: 'Siege mode' },
    { id: 'command', name: 'Command mode' },
  ];
}
