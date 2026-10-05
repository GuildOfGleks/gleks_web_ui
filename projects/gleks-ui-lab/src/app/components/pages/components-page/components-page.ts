import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  CardComponent,
  GogCardHeaderDirective,
  GogCardLinkDirective,
  GogCardMediaDirective,
} from '@guildofgleks/ui';
import { ComponentIllustrationComponent } from '../../shared/component-illustration/component-illustration';
import { NAV_SECTIONS } from '../../shared/nav-data';
import type { NavGroup } from '../../types/nav-item';

/**
 * One line per page: what the component is for, in the words someone scanning the grid would
 * use. Keyed by the slug the routes use; a component added to `nav-data.ts` without a line here
 * still gets a card, with no description under its name.
 */
export const COMPONENT_BLURBS: Readonly<Record<string, string>> = {
  button: 'Actions, links styled as buttons, severities and loading.',
  'button-toggle': 'A segmented control: one choice, or several, from a row.',
  menu: 'A dropdown of actions, opened from any trigger.',
  toggle: 'An on/off switch for a setting that applies at once.',
  autocomplete: 'A text field that suggests as you type.',
  calendar: 'A date grid: a day, a range or a time, inline.',
  checkbox: 'Checked, unchecked or indeterminate, alone or in a list.',
  datepicker: 'A date field with a calendar in a popup.',
  'file-upload': 'Choose files by picker or by drag and drop.',
  inputfield: 'Text input with a label, add-ons, a clear button and errors.',
  multiselect: 'Pick several options, shown as chips.',
  'radio-group': 'Exactly one of a few options, all visible.',
  rating: 'A score out of a few stars, to give or to show.',
  select: 'Pick one option from a dropdown list.',
  slider: 'A value or a range along a track.',
  textarea: 'Multi-line text that can grow with its content.',
  avatar: 'A person as a picture, initials or an icon — alone or in a group.',
  badge: 'A count or a dot pinned to the corner of anything.',
  chip: 'A compact item to remove, filter by or pick.',
  divider: 'A rule between sections, with or without a label.',
  icon: '136 built-in outline icons, and any SVG of your own.',
  paginator: 'Page through a long list, with an optional page size.',
  progressbar: 'How far a task has got, or that it is running.',
  ripple: 'Press feedback for anything you can click.',
  skeleton: 'The shape of content that is still loading.',
  table: 'Sortable, paginated, selectable — and virtualized when it is long.',
  tag: 'A short status label in a severity colour.',
  accordion: 'Stacked sections that open one or several at a time.',
  breadcrumbs: 'Where this page sits, and the way back up.',
  card: 'A surface for one thing — linkable as a whole.',
  collapsible: 'Show and hide one region; the primitive under the accordion.',
  panel: 'A titled region of a page, collapsible if it needs to be.',
  scroll: 'A scroll area with a themed, auto-hiding scrollbar.',
  stepper: 'Where a user is in a multi-step task.',
  tabs: 'Switch between views without leaving the page.',
  alert: 'A persistent message in the flow of the page.',
  dialog: 'A modal window, opened from a template or a service.',
  'empty-state': 'What a region says when it has nothing to show.',
  spinner: 'Something is loading, for an unknown length of time.',
  toast: 'A short message that comes and goes on its own.',
  tooltip: 'A hint on hover or focus.',
};

interface CatalogueCard {
  readonly slug: string;
  readonly label: string;
  readonly path: string;
  readonly blurb: string;
}

interface CatalogueGroup {
  readonly id: string;
  readonly title: string;
  readonly cards: readonly CatalogueCard[];
}

function toGroup(group: NavGroup): CatalogueGroup {
  return {
    id: group.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, ''),
    title: group.title,
    cards: group.items.map((item) => {
      const slug = item.path.replace(/^components\//, '');
      return { slug, label: item.label, path: item.path, blurb: COMPONENT_BLURBS[slug] ?? '' };
    }),
  };
}

/** Read off the sidebar's own groups, so a component added there gets a card here too. */
const GROUPS: readonly CatalogueGroup[] = (
  NAV_SECTIONS.find((section) => section.path === 'components')?.groups ?? []
).map(toGroup);

@Component({
  selector: 'app-components-page',
  imports: [
    CardComponent,
    ComponentIllustrationComponent,
    GogCardHeaderDirective,
    GogCardLinkDirective,
    GogCardMediaDirective,
    RouterLink,
  ],
  templateUrl: './components-page.html',
  styleUrl: './components-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComponentsPage {
  protected readonly groups = GROUPS;
  protected readonly count = GROUPS.reduce((sum, group) => sum + group.cards.length, 0);
}
