import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  MultiselectComponent,
  GogDropdownChevronDirective,
  GogMultiselectClearIconDirective,
  IconComponent,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [
    MultiselectComponent,
    GogDropdownChevronDirective,
    GogMultiselectClearIconDirective,
    IconComponent,
  ],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiselectSlotsExample {
  protected readonly frameworks = [
    { id: 'angular', name: 'Angular' },
    { id: 'react', name: 'React' },
    { id: 'vue', name: 'Vue' },
    { id: 'svelte', name: 'Svelte' },
  ];
}
