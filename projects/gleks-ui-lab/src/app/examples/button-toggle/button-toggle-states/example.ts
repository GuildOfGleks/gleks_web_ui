import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonToggleGroupComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonToggleGroupComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonToggleStatesExample {
  protected readonly alignments = [
    { id: 'left', name: 'Left' },
    { id: 'center', name: 'Center' },
    { id: 'right', name: 'Right' },
  ];
  protected readonly oneDisabled = [
    { id: 'left', name: 'Left' },
    { id: 'center', name: 'Center' },
    { id: 'right', name: 'Right', disabled: true },
  ];
  protected readonly tools = [
    { id: 'search', name: 'Search' },
    { id: 'filter', name: 'Filter' },
    { id: 'star', name: 'Star' },
  ];
}
