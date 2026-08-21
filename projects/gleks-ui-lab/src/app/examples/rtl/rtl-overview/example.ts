import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  ButtonComponent,
  ButtonToggleGroupComponent,
  CheckboxComponent,
  GogTooltipDirective,
  InputfieldComponent,
  ProgressbarComponent,
  SelectComponent,
  SliderComponent,
  TagComponent,
  type GogDropdownOption,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [
    ButtonToggleGroupComponent,
    InputfieldComponent,
    SelectComponent,
    CheckboxComponent,
    SliderComponent,
    ProgressbarComponent,
    TagComponent,
    ButtonComponent,
    GogTooltipDirective,
  ],
  templateUrl: './example.html',
  styleUrl: './example.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RtlOverviewExample {
  protected readonly directions: GogDropdownOption[] = [
    { id: 'ltr', name: 'dir="ltr"' },
    { id: 'rtl', name: 'dir="rtl"' },
  ];

  protected readonly dir = signal('rtl');

  protected readonly branches: GogDropdownOption[] = [
    { id: 'main', name: 'main' },
    { id: 'next', name: 'next' },
    { id: 'v21', name: 'v21' },
  ];

  protected readonly query = signal('');
  protected readonly branch = signal<string | null>('main');
  protected readonly notify = signal(true);
  protected readonly progress = signal(65);
}
