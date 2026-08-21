import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faBoxOpen,
  faCircleHalfStroke,
  faLayerGroup,
  faPalette,
  faSliders,
  faUniversalAccess,
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface FeatureCard {
  readonly icon: IconDefinition;
  readonly title: string;
  readonly text: string;
}

const FEATURES: readonly FeatureCard[] = [
  {
    icon: faLayerGroup,
    title: '31 building blocks',
    text: 'Buttons, form controls, date pickers, dialogs, tables, tabs, menus, navigation and feedback components — ready-made.',
  },
  {
    icon: faPalette,
    title: 'One visual language',
    text: 'A consistent look across your whole product, out of the box — not assembled component-by-component.',
  },
  {
    icon: faCircleHalfStroke,
    title: 'Effortless theming',
    text: 'Light/dark theming that adapts to your brand, plus three ready-made presets you can drop in as-is.',
  },
  {
    icon: faSliders,
    title: 'App-wide defaults',
    text: "Set a size, an error timing, a date format once — a house style isn't repeated on every instance.",
  },
  {
    icon: faUniversalAccess,
    title: 'Accessible by default',
    text: 'Keyboard navigation, focus states, screen-reader support and right-to-left layouts are built in, not bolted on.',
  },
  {
    icon: faBoxOpen,
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
  imports: [FaIconComponent, RouterLink],
  templateUrl: './overview-page.html',
  styleUrl: './overview-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewPage {
  protected readonly features = FEATURES;
  protected readonly nextLinks = NEXT_LINKS;
}
