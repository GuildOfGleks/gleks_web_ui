import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { SelectComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [SelectComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectOverviewExample {
  protected readonly frameworks = [
    { id: 'angular', name: 'Angular' },
    { id: 'react', name: 'React' },
    { id: 'vue', name: 'Vue' },
    { id: 'svelte', name: 'Svelte' },
  ];
  protected readonly framework = signal<string | null>('angular');
  protected readonly changes = signal(0);
}
