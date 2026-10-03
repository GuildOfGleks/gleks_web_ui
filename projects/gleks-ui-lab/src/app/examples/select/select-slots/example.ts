import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GogDropdownChevronDirective, IconComponent, SelectComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [GogDropdownChevronDirective, IconComponent, SelectComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectSlotsExample {
  protected readonly sortOrders = [
    { id: 'newest', name: 'Newest first' },
    { id: 'oldest', name: 'Oldest first' },
  ];
  protected readonly frameworks = [
    { id: 'angular', name: 'Angular' },
    { id: 'react', name: 'React' },
    { id: 'vue', name: 'Vue' },
    { id: 'svelte', name: 'Svelte' },
  ];
}
