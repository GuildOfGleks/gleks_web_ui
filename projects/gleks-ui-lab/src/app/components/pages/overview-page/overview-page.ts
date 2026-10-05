import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent, type GogIconName } from '@guildofgleks/ui';
import { NAV_SECTIONS } from '../../shared/nav-data';

/** Every component and directive page in the sidebar, counted rather than typed. */
const PAGE_COUNT = (
  NAV_SECTIONS.find((section) => section.path === 'components')?.groups ?? []
).reduce((sum, group) => sum + group.items.length, 0);

interface FeatureCard {
  readonly icon: GogIconName;
  readonly title: string;
  readonly text: string;
}

const FEATURES: readonly FeatureCard[] = [
  {
    icon: 'layers',
    title: `${PAGE_COUNT} building blocks`,
    text: 'Buttons, form controls, date pickers, dialogs, tables, tabs, menus, navigation and feedback components — ready-made.',
  },
  {
    icon: 'palette',
    title: 'One visual language',
    text: 'A consistent look across your whole product, out of the box — not assembled component-by-component.',
  },
  {
    icon: 'contrast',
    title: 'Effortless theming',
    text: 'Light/dark theming that adapts to your brand, plus nine ready-made presets you can drop in as-is.',
  },
  {
    icon: 'sliders',
    title: 'App-wide defaults',
    text: "Set a size, an error timing, a date format once — a house style isn't repeated on every instance.",
  },
  {
    icon: 'accessibility',
    title: 'Accessible by default',
    text: 'Keyboard navigation, focus states, screen-reader support and right-to-left layouts are built in, not bolted on.',
  },
  {
    icon: 'package',
    title: 'Zero dependencies',
    text: 'Native Date, no CDK, no date library, no theming engine to learn — just the components.',
  },
];

interface NextLink {
  readonly title: string;
  readonly text: string;
  readonly path?: string;
}

const NEXT_LINKS: readonly NextLink[] = [
  {
    title: 'Getting Started',
    text: 'Add the library to your project in a couple of minutes.',
    path: '/general/getting-started',
  },
  {
    title: 'Theming',
    text: 'Adapt colors, spacing and typography to your brand, or pick a preset.',
    path: '/general/theming',
  },
  {
    title: 'Global Configuration',
    text: 'Set app-wide defaults once instead of per instance.',
    path: '/general/global-config',
  },
  {
    title: 'Components',
    text: 'Browse every component the library ships with — see the sidebar.',
  },
];

@Component({
  selector: 'app-overview-page',
  imports: [IconComponent, RouterLink],
  templateUrl: './overview-page.html',
  styleUrl: './overview-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewPage {
  protected readonly features = FEATURES;
  protected readonly nextLinks = NEXT_LINKS;
}
