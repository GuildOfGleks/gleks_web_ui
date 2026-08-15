import { Component, signal } from '@angular/core';
import { GogDropdownOption, SelectComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [SelectComponent],
  template: `<gog-select label="Framework" [options]="frameworks" [(value)]="framework" />`,
})
export class SelectOverviewExample {
  protected readonly framework = signal<string | number | null>(null);
  protected readonly frameworks: GogDropdownOption[] = [
    { id: 'angular', name: 'Angular' },
    { id: 'react', name: 'React' },
    { id: 'vue', name: 'Vue' },
  ];
}
