import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SelectComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [SelectComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectDirectionExample {
  protected readonly frameworks = [
    { id: 'angular', name: 'Angular' },
    { id: 'react', name: 'React' },
    { id: 'vue', name: 'Vue' },
    { id: 'svelte', name: 'Svelte' },
  ];
}
