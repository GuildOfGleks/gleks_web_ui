import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonToggleGroupComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonToggleGroupComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonToggleMultipleExample {
  protected readonly formats = [
    { id: 'bold', name: 'Bold' },
    { id: 'italic', name: 'Italic' },
    { id: 'underline', name: 'Underline' },
  ];
  protected readonly active = signal<string[]>(['bold']);
}
