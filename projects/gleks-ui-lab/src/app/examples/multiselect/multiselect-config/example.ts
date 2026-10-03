import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MultiselectComponent, provideGogConfig } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [MultiselectComponent],
  // Usually in app.config.ts; here on the component, so it reaches only its own fields.
  providers: [
    provideGogConfig({
      control: { size: 'lg' },
      dropdown: { filter: true, filterPosition: 'bottom' },
      labels: { selectAll: 'All of them', clearAll: 'None' },
    }),
  ],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiselectConfigExample {
  protected readonly frameworks = [
    { id: 'angular', name: 'Angular' },
    { id: 'react', name: 'React' },
    { id: 'vue', name: 'Vue' },
    { id: 'svelte', name: 'Svelte' },
  ];
}
