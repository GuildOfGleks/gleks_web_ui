import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  InputfieldComponent,
  GogInputAddonEndDirective,
  GogInputAddonStartDirective,
  IconComponent,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [
    InputfieldComponent,
    GogInputAddonEndDirective,
    GogInputAddonStartDirective,
    IconComponent,
  ],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputfieldAddonsExample {
  protected readonly amount = signal('');
  protected readonly website = signal('');
  protected readonly search = signal('');
  protected readonly lastSearch = signal('No search yet.');

  protected run(): void {
    this.lastSearch.set(`Searched for "${this.search()}"`);
  }
}
