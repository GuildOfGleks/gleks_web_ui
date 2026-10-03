import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SelectComponent, provideGogConfig } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [SelectComponent],
  // Usually in app.config.ts; here on the component, so it reaches only its own fields.
  providers: [
    provideGogConfig({
      control: { size: 'lg', clearable: true },
      dropdown: { filter: true },
      floatLabel: { variant: 'over' },
    }),
  ],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectConfigExample {
  protected readonly frameworks = [
    { id: 'angular', name: 'Angular' },
    { id: 'react', name: 'React' },
    { id: 'vue', name: 'Vue' },
    { id: 'svelte', name: 'Svelte' },
  ];
}
