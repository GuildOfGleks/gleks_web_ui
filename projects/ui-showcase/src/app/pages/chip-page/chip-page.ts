import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { ChipComponent, GogPanelHeaderDirective, PanelComponent } from '@guildofgleks/ui';

interface ChipPerson {
  name: string;
  avatarUrl: string;
}

@Component({
  selector: 'app-chip-page',
  imports: [ChipComponent, GogPanelHeaderDirective, PanelComponent],
  templateUrl: './chip-page.html',
  styleUrl: './chip-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipPage {
  protected readonly filters = signal(['Angular', 'Design system', 'Pinned']);
  protected readonly people: ChipPerson[] = [
    {
      name: 'Alex Johnson',
      avatarUrl:
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'><rect width='64' height='64' rx='32' fill='%23c9b896'/><text x='32' y='38' text-anchor='middle' font-size='24' font-family='Arial' fill='%231a1208'>AJ</text></svg>",
    },
    {
      name: 'Maya Stone',
      avatarUrl:
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'><rect width='64' height='64' rx='32' fill='%23d4b483'/><text x='32' y='38' text-anchor='middle' font-size='24' font-family='Arial' fill='%231a1208'>MS</text></svg>",
    },
  ];

  protected readonly team = signal([
    {
      name: 'Priya Patel',
      avatarUrl:
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'><rect width='64' height='64' rx='32' fill='%237a5c00'/><text x='32' y='38' text-anchor='middle' font-size='24' font-family='Arial' fill='white'>PP</text></svg>",
    },
  ]);

  /**
   * One signal per chip rather than one signal holding the whole row: `[(selected)]` writes back
   * into whatever it is bound to, and a signal per topic is what lets it write without the page
   * needing a click handler at all.
   */
  protected readonly topics = [
    { label: 'Accessibility', on: signal(true) },
    { label: 'Theming', on: signal(false) },
    { label: 'Forms', on: signal(true) },
    { label: 'Overlays', on: signal(false) },
  ];
  protected readonly selectedTopics = computed(() => {
    const on = this.topics.filter((topic) => topic.on()).map((topic) => topic.label);
    return on.length ? `Showing: ${on.join(', ')}` : 'No filter selected — showing everything.';
  });

  protected readonly lastAction = signal('No chip clicked yet.');

  protected onChipClick(label: string): void {
    this.lastAction.set(`Clicked "${label}"`);
  }

  protected removeFilter(label: string): void {
    this.filters.update((current) => current.filter((item) => item !== label));
    this.lastAction.set(`Removed "${label}"`);
  }

  protected removeTeamMember(name: string): void {
    this.team.update((current) => current.filter((member) => member.name !== name));
    this.lastAction.set(`Removed "${name}"`);
  }
}
