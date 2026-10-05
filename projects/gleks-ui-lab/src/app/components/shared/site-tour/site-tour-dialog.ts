import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  ButtonComponent,
  type GogStep,
  SelectComponent,
  StepperComponent,
  ThemeService,
  ToggleComponent,
} from '@guildofgleks/ui';
import { DIALOG_REF } from '@guildofgleks/ui/dialog';
import { DirectionPreference } from '../direction-preference';
import { RipplePreference } from '../ripple-preference';
import { THEME_OPTIONS } from '../theme-options';
import type { SiteTourResult } from './site-tour';

/** The heading the dialog is named by (`ariaLabelledBy` in `SiteTour.open`). */
export const SITE_TOUR_TITLE_ID = 'site-tour-title';

interface TourStep {
  readonly label: string;
  readonly heading: string;
  readonly text: string;
  /** For a reader on a narrow screen, where that part of the layout is folded away. */
  readonly narrow?: string;
}

const STEPS: readonly TourStep[] = [
  {
    label: 'Guides',
    heading: 'The guides, at the top of the left sidebar',
    text:
      'Overview, Getting Started, Theming and the FAQ. Each opens to the pages that belong to it — ' +
      'the comparison with Material and PrimeNG and the release notes under Overview, global ' +
      'configuration and AGENTS.md under Getting Started, right-to-left under Theming.',
    narrow: 'On a narrow screen the sidebar is behind the menu button at the top left.',
  },
  {
    label: 'Components',
    heading: 'Every component, below them',
    text:
      'Grouped by what it is for, in a list that scrolls on its own. The Components title is a ' +
      'link too: a page with every component on a card, each with a drawing of what it looks like.',
    narrow: 'Same place — the menu button at the top left.',
  },
  {
    label: 'On this page',
    heading: 'Where you are on the page, on the right',
    text:
      'The right sidebar lists the sections of the page you are reading and follows you as you ' +
      'scroll. Pick one to jump to it.',
    narrow: 'It is hidden on narrower screens, where the page is short enough to scroll.',
  },
  {
    label: 'Settings',
    heading: 'How the demos are shown, in the header',
    text:
      'Search for a component, and change what every demo on the site renders with: the press ' +
      'ripple, right-to-left layout and the theme — eleven of them. Try them here; the header ' +
      'keeps the same switches.',
  },
];

/**
 * The site tour: four steps on a `gog-stepper`, each with a drawing of the layout that marks the
 * part being described. The last step carries the header's three settings as live controls, so
 * the reader changes them from the tour and sees the page behind it follow.
 */
@Component({
  selector: 'app-site-tour-dialog',
  imports: [ButtonComponent, SelectComponent, StepperComponent, ToggleComponent],
  templateUrl: './site-tour-dialog.html',
  styleUrl: './site-tour-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteTourDialog {
  private readonly ref = inject(DIALOG_REF);
  private readonly themeService = inject(ThemeService);
  private readonly ripple = inject(RipplePreference);
  private readonly direction = inject(DirectionPreference);

  protected readonly titleId = SITE_TOUR_TITLE_ID;
  protected readonly tour = STEPS;
  protected readonly themeOptions = THEME_OPTIONS;
  protected readonly contentRows = [
    { y: 40, w: 92 },
    { y: 47, w: 84 },
    { y: 54, w: 90 },
    { y: 66, w: 70 },
    { y: 73, w: 88 },
    { y: 80, w: 62 },
    { y: 92, w: 92 },
    { y: 99, w: 76 },
    { y: 106, w: 84 },
  ];

  /**
   * A phone: four labels do not fit across, so the stepper runs down; and the drawing goes, since
   * it shows the desktop layout, which is not what a phone reader is looking at. The dialog only
   * ever opens in the browser, so `window` is safe here.
   */
  protected readonly narrow = signal(false);

  protected readonly active = signal(0);
  /** The furthest step the reader has moved past; the stepper lets them go back, not ahead. */
  private readonly reached = signal(0);

  protected readonly steps = computed<GogStep[]>(() =>
    STEPS.map((step, index) => ({
      label: step.label,
      state: index < this.reached() ? 'complete' : undefined,
    })),
  );
  protected readonly step = computed(() => STEPS[this.active()]);
  protected readonly isLast = computed(() => this.active() === STEPS.length - 1);

  protected readonly rippleOn = this.ripple.enabled;
  protected readonly rtl = this.direction.isRtl;
  protected readonly theme = computed(() => this.themeService.theme());

  constructor() {
    const media = window.matchMedia('(max-width: 560px)');
    this.narrow.set(media.matches);
    const onChange = (event: MediaQueryListEvent) => this.narrow.set(event.matches);
    media.addEventListener('change', onChange);
    inject(DestroyRef).onDestroy(() => media.removeEventListener('change', onChange));
  }

  protected next(): void {
    if (this.isLast()) {
      this.ref.close('finished' satisfies SiteTourResult);
      return;
    }
    this.reached.update((reached) => Math.max(reached, this.active() + 1));
    this.active.update((index) => index + 1);
  }

  protected back(): void {
    this.active.update((index) => Math.max(0, index - 1));
  }

  protected skip(): void {
    this.ref.close('skipped' satisfies SiteTourResult);
  }

  protected setRipple(on: boolean): void {
    this.ripple.set(on);
  }

  protected setRtl(rtl: boolean): void {
    this.direction.set(rtl);
  }

  protected setTheme(theme: unknown): void {
    if (typeof theme === 'string') this.themeService.setTheme(theme);
  }
}
