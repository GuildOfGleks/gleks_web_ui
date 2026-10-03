import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MultiselectComponent, GogFloatLabelVariant } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [MultiselectComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiselectFloatLabelExample {
  protected readonly variants: readonly GogFloatLabelVariant[] = ['none', 'in', 'on', 'over'];
  protected readonly frameworks = [
    { id: 'angular', name: 'Angular' },
    { id: 'react', name: 'React' },
    { id: 'vue', name: 'Vue' },
    { id: 'svelte', name: 'Svelte' },
  ];
}
